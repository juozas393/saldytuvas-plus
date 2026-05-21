import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { normalizeSlotsNutrition } from "./ingredient-nutrition.ts";

interface BrandPreference {
  category: string;
  preferredBrand: string;
  avoidBrands?: string[];
}

interface SubstituteRule {
  product: string;
  substituteWith: string;
  reason?: string;
}

interface MemberInput {
  id: string;
  name: string;
  weightKg: number;
  heightCm: number;
  age: number;
  gender: 'male' | 'female';
  activityLevel: string;
  allergies: string[];
  dislikes: string[];
  likedProducts?: string[];
  brandPreferences?: BrandPreference[];
  substituteRules?: SubstituteRule[];
  dailyCalorieTarget: number;
  dailyProteinTarget?: number;
  fitnessGoal?: 'lose_weight' | 'maintain' | 'gain_muscle';
  targetWeightKg?: number;
}

interface PromotionItem {
  name: string;
  store: string;
  price: number;
  originalPrice: number | null;
}

interface RecipePoolItem {
  id: number;
  title: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  ingredients: string[];
  servings: number;
  readyInMinutes: number;
  image: string;
  suggestedMealType: string;
}

interface GenerateRequest {
  members: MemberInput[];
  inventoryItems: string[];
  promotionItems: string[];
  promotionItemsDetailed?: PromotionItem[];
  days: number;
  startDate: string;
  snackCount?: number;
  proteinPreferences?: string[];
  preferences?: string;
  dailyBudgetEur?: number;
  spoonacularRecipes?: RecipePoolItem[];
}

interface SpoonacularRecipe {
  id: number;
  title: string;
  readyInMinutes: number;
  servings: number;
  nutrition?: {
    nutrients: { name: string; amount: number }[];
  };
  extendedIngredients?: { original: string }[];
}

// Sanitize env vars - strip whitespace/newlines that may come from copy-paste in dashboard
function cleanKey(v: string | undefined): string {
  if (!v) return '';
  // Remove all control chars (0x00-0x1F, 0x7F) and trim
  return v.replace(/[\x00-\x1F\x7F]/g, '').trim();
}
const GROQ_API_KEY = cleanKey(Deno.env.get('GROQ_API_KEY'));
const CEREBRAS_API_KEY = cleanKey(Deno.env.get('CEREBRAS_API_KEY'));
const SPOONACULAR_KEY = cleanKey(Deno.env.get('SPOONACULAR_API_KEY'));

// Multi-key Gemini rotation (GEMINI_API_KEY + GEMINI_API_KEY_1..20)
const GEMINI_KEYS: string[] = [
  Deno.env.get('GEMINI_API_KEY'),
  ...Array.from({ length: 15 }, (_, i) => Deno.env.get(`GEMINI_API_KEY_${i + 1}`)),
].filter((k): k is string => !!cleanKey(k)).map(k => cleanKey(k));

let geminiKeyIdx = 0;
function nextGeminiKey(): string {
  const key = GEMINI_KEYS[geminiKeyIdx % GEMINI_KEYS.length];
  geminiKeyIdx++;
  return key;
}

const GEMINI_API_KEY = GEMINI_KEYS[0] ?? '';
const MODEL = cleanKey(Deno.env.get('GROQ_MODEL')) || 'llama-3.3-70b-versatile';

// ────────────────────────────────────────────────────────────────────
// Groq free tier TPM budget (llama-3.3-70b-versatile = 12 000 TPM)
// Kiekviena užklausa sunaudoja: prompt_tokens + max_tokens + system/overhead
// Strategija:
//   1) Start su MAX_RECIPES_IN_PROMPT/MAX_PROMOTIONS_IN_PROMPT default'ais
//   2) Apskaičiuoti prompt_tokens ≈ chars / 2.5 (LT unicode nėra ASCII-efektyvūs)
//   3) output_tokens = min(CAP, TPM_BUDGET - prompt_tokens - OVERHEAD, theoretical_need)
//   4) Jei prompt_tokens per didelis - pakartotinai build'inti su mažesniais limit'ais
//   5) 413 atveju - šrinkinti dar agresyviau ir bandyti iš naujo
// ────────────────────────────────────────────────────────────────────
const GROQ_TPM_BUDGET = 11500;         // target < 12 000 su 500 tokenų saugos marža
const GROQ_OVERHEAD_TOKENS = 300;      // system message + response wrapper
const MAX_PROMPT_CHARS = 9000;         // ~3600 tokens (LT content, conservative)
const MAX_OUTPUT_TOKENS_CAP = 8000;    // Groq grąžins tiek patiekalų, kiek telpa
const MAX_RECIPES_IN_PROMPT = 12;      // 48 recipes iš kliento - tik top 12 patenka į prompt'ą
const MAX_PROMOTIONS_IN_PROMPT = 15;   // 60 promos iš kliento - tik top 15 patenka į prompt'ą

// Estimate tokens for Lithuanian mixed content. LT chars often take 2-3 tokens
// (unicode overhead), so /2.5 is safer than OpenAI's standard chars/4 rule.
const estimatePromptTokens = (text: string): number => Math.ceil(text.length / 2.5);

// ────────────────────────────────────────────────────────────────────
// Multi-provider failover chain (v58)
// Strategija: bandome provider'ius iš eilės, jei vienas fail'ina (413/429/503/
// timeout/empty content) - pereiname į sekantį. Kiekvienas turi savo TPM biudžetą
// ir variantų galimybę, todėl prompt'as perbuild'inamas pagal to provider'io limit'us.
//
// Eiliškumas parinktas empiriškai iš realių testų su test_v48_payload.json
// (1 naudotojas, 3 dienos, 20 promos):
//   | Provider           | Laikas | Promo match | RPD    | Kokybė |
//   | cerebras qwen-3    | 5.6s   | 89%         | 14 400 | aukšta |
//   | gemini 2.5 pro     | ~12s   | ~90%        |     50 | AUKŠČIAUSIA |
//   | groq llama-3.3     | 9.9s   | 14-82%      |  1 000 | vidutinė |
//   | gemini 2.5 flash   | 27.4s  | 20%         |    250 | vidutinė |
//
//   1) Cerebras Qwen-3 235B PRIMARY - 235B MoE, 22B aktyvių parametrų.
//      Laimi visus 3 rodiklius, kai įjungtas: greičiausias + aukštas promo match
//      + didžiausias RPD. Tai default'as beveik kiekvienam generavimui.
//   2) Gemini 2.5 Pro QUALITY FALLBACK - Google flagship modelis.
//      Kai Cerebras užklupa rate limit'as, Gemini Pro duoda geriausią alternatyvą
//      (stipresnis reasoning, didelis 1M context, 2M promptai). Ribojimas: 50 RPD.
//   3) Groq llama-3.3-70b SPEED FALLBACK - 70B dense model, greitas.
//      Kai Gemini Pro sužino 429, Groq užtikrina back-up'ą. 1000 RPD.
//   4) Gemini 2.5 Flash EMERGENCY - mažas RPD (250), bet 240K TPM absorb'ina
//      bet kokį 413 scenarijų. Paskutinis fallback'as.
//
// VARIANTŲ STRATEGIJA: Kiekvienas provider'is generuoja 5 variantus per valgymą
// (67% daugiau nei ankstesnė versija), kad naudotojas turėtų daugiau pasirinkimo.
// Groq automatiškai degrade'ina iki 3 variantų, jei token biudžetas per mažas.
// ────────────────────────────────────────────────────────────────────

interface AIProvider {
  name: string;
  available: boolean;
  tpmBudget: number;
  outputCap: number; // max tokens išvesčiai (Gemini palaiko 65K, Groq/Cerebras ~8K)
  call: (prompt: string, systemMsg: string, maxTokens: number) => Promise<Response>;
}

async function fetchWithTimeout(url: string, init: RequestInit, timeoutMs: number): Promise<Response> {
  const ctrl = new AbortController();
  const tm = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: ctrl.signal });
  } finally {
    clearTimeout(tm);
  }
}

// Gemini provider helper - visi naudoja tą patį formatą, skiriasi tik modelis
function geminiProvider(name: string, model: string, timeoutMs: number): AIProvider {
  return {
    name,
    available: GEMINI_KEYS.length > 0,
    tpmBudget: 240000,
    outputCap: 32000,
    call: (prompt, systemMsg, maxTokens) => {
      const body = JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        systemInstruction: { parts: [{ text: systemMsg }] },
        generationConfig: {
          temperature: 0.45,
          maxOutputTokens: maxTokens,
          responseMimeType: 'application/json',
          thinkingConfig: { thinkingBudget: 0 },
        },
      });
      const key = nextGeminiKey();
      return fetchWithTimeout(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
        { method: 'POST', headers: { 'Content-Type': 'application/json' }, body },
        timeoutMs,
      );
    },
  };
}

const PROVIDERS: AIProvider[] = [
  // 1) Gemini 2.5 Flash - geriausias (5 RPM, 250K TPM, 20 RPD per key)
  geminiProvider('gemini-2.5-flash', 'gemini-2.5-flash', 45000),
  // 2) Gemini 2.5 Flash Lite (10 RPM, 250K TPM, 20 RPD)
  geminiProvider('gemini-2.5-flash-lite', 'gemini-2.5-flash-lite', 45000),
  // 3) Gemini 3.1 Flash Lite - didžiausias RPD (15 RPM, 250K TPM, 500 RPD!)
  geminiProvider('gemini-3.1-flash-lite', 'gemini-3.1-flash-lite', 45000),
  // 4) Gemini 3 Flash (5 RPM, 250K TPM, 20 RPD)
  geminiProvider('gemini-3-flash', 'gemini-3-flash', 45000),
  // 5) Cerebras - emergency fallback kai visi Gemini key'ai neveikia
  {
    name: 'cerebras',
    available: !!CEREBRAS_API_KEY,
    tpmBudget: 60000,
    outputCap: 16000,
    call: (prompt, systemMsg, maxTokens) => {
      const body = JSON.stringify({
        model: 'qwen-3-235b-a22b-instruct-2507',
        messages: [
          { role: 'system', content: systemMsg },
          { role: 'user', content: prompt },
        ],
        temperature: 0.45,
        max_tokens: maxTokens,
        response_format: { type: 'json_object' },
      });
      return fetchWithTimeout(
        'https://api.cerebras.ai/v1/chat/completions',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${CEREBRAS_API_KEY}`,
          },
          body,
        },
        45000,
      );
    },
  },
  // 6) Groq - paskutinis fallback
  {
    name: 'groq',
    available: !!GROQ_API_KEY,
    tpmBudget: GROQ_TPM_BUDGET,
    outputCap: 8000,
    call: (prompt, systemMsg, maxTokens) => {
      const body = JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'system', content: systemMsg },
          { role: 'user', content: prompt },
        ],
        temperature: 0.45,
        max_tokens: maxTokens,
        response_format: { type: 'json_object' },
      });
      return fetchWithTimeout(
        'https://api.groq.com/openai/v1/chat/completions',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${GROQ_API_KEY}`,
          },
          body,
        },
        45000,
      );
    },
  },
];

// Skirtingi provideriai grąžina skirtingus JSON format'us
function extractContent(providerName: string, data: any): string | null {
  if (providerName.startsWith('gemini')) {
    return data?.candidates?.[0]?.content?.parts?.[0]?.text || null;
  }
  return data?.choices?.[0]?.message?.content || null;
}

// Tikrina ar response nutrūko dėl max tokens limito
function wasContentTruncated(providerName: string, data: any): boolean {
  if (providerName.startsWith('gemini')) {
    const reason = data?.candidates?.[0]?.finishReason;
    return reason === 'MAX_TOKENS' || reason === 'RECITATION';
  }
  const reason = data?.choices?.[0]?.finish_reason;
  return reason === 'length';
}

if (!GROQ_API_KEY) console.warn('GROQ_API_KEY not set');
if (GEMINI_KEYS.length === 0) console.warn('No GEMINI_API_KEY found');
else console.log(`Gemini keys: ${GEMINI_KEYS.length} (round-robin)`);
if (!CEREBRAS_API_KEY) console.warn('CEREBRAS_API_KEY not set (optional)');
if (!SPOONACULAR_KEY) console.error('SPOONACULAR_API_KEY not set!');
const availableProviders = PROVIDERS.filter(p => p.available).map(p => p.name).join(', ');
console.log(`Config: providers=[${availableProviders || 'NONE!'}], SPOON=${SPOONACULAR_KEY ? `${SPOONACULAR_KEY.length} chars` : 'missing'}`);

function calculateMacros(member: MemberInput) {
  let bmr: number;
  if (member.gender === 'male') {
    bmr = 10 * member.weightKg + 6.25 * member.heightCm - 5 * member.age + 5;
  } else {
    bmr = 10 * member.weightKg + 6.25 * member.heightCm - 5 * member.age - 161;
  }
  const multipliers: Record<string, number> = {
    sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, very_active: 1.9,
  };
  const tdee = Math.round(bmr * (multipliers[member.activityLevel] || 1.55));
  const calories = member.dailyCalorieTarget || tdee;
  
  let proteinG: number;
  if (member.dailyProteinTarget) {
    proteinG = member.dailyProteinTarget;
  } else {
    const goalMultipliers: Record<string, Record<string, number>> = {
      lose_weight: { sedentary: 1.6, light: 1.8, moderate: 2.0, active: 2.0, very_active: 2.2 },
      maintain: { sedentary: 0.8, light: 1.2, moderate: 1.4, active: 1.6, very_active: 1.8 },
      gain_muscle: { sedentary: 1.4, light: 1.6, moderate: 1.8, active: 2.0, very_active: 2.2 },
    };
    const goal = member.fitnessGoal || 'maintain';
    const mult = goalMultipliers[goal]?.[member.activityLevel] || 1.4;
    proteinG = Math.round(member.weightKg * mult);
  }
  
  const fatG = Math.round((calories * 0.28) / 9);
  const carbsG = Math.round((calories - proteinG * 4 - fatG * 9) / 4);
  return { calories, proteinG, carbsG, fatG, tdee };
}

async function searchRecipes(ingredients: string[]): Promise<SpoonacularRecipe[]> {
  const cleanIngredients = ingredients
    .map(i => i.replace(/\s*[\u26a0\ufe0f].*/g, '').replace(/\s*\(iki.*\)/g, '').trim())
    .filter(Boolean)
    .slice(0, 10);

  if (cleanIngredients.length === 0) {
    cleanIngredients.push('chicken', 'rice', 'vegetables');
  }

  const params = new URLSearchParams({
    apiKey: SPOONACULAR_KEY,
    ingredients: cleanIngredients.join(','),
    number: '12',
    ranking: '2',
    ignorePantry: 'true',
  });

  try {
    const findRes = await fetch(`https://api.spoonacular.com/recipes/findByIngredients?${params}`);
    if (!findRes.ok) return [];
    const found = await findRes.json();
    if (!found || found.length === 0) return [];

    const recipeIds = found.slice(0, 8).map((r: { id: number }) => r.id).join(',');
    const infoRes = await fetch(
      `https://api.spoonacular.com/recipes/informationBulk?ids=${recipeIds}&includeNutrition=true&apiKey=${SPOONACULAR_KEY}`
    );
    if (!infoRes.ok) {
      return found.slice(0, 8).map((r: { id: number; title: string }) => ({
        id: r.id, title: r.title, readyInMinutes: 30, servings: 4,
      }));
    }

    const detailed: SpoonacularRecipe[] = await infoRes.json();
    return detailed.map(r => ({
      id: r.id, title: r.title, readyInMinutes: r.readyInMinutes,
      servings: r.servings, nutrition: r.nutrition, extendedIngredients: r.extendedIngredients,
    }));
  } catch (error) {
    console.error('Spoonacular error:', error);
    return [];
  }
}

// Common meal name translations (offline fallback if Google Translate fails)
const MEAL_NAME_DICT: Record<string, string> = {
  'chicken breast': 'Vištienos krūtinėlė', 'grilled chicken': 'Kepta vištiena',
  'chicken salad': 'Vištienos salotos', 'chicken soup': 'Vištienos sriuba',
  'oatmeal': 'Avižinė košė', 'oatmeal with berries': 'Avižinė košė su uogomis',
  'scrambled eggs': 'Plakti kiaušiniai', 'omelette': 'Omletas',
  'rice with vegetables': 'Ryžiai su daržovėmis', 'fried rice': 'Kepti ryžiai',
  'pasta with sauce': 'Makaronai su padažu', 'spaghetti': 'Spagečiai',
  'beef stew': 'Jautienos troškinys', 'pork chops': 'Kiaulienos kotletai',
  'salmon fillet': 'Lašišos filė', 'baked salmon': 'Kepta lašiša',
  'greek salad': 'Graikų salotos', 'caesar salad': 'Cezario salotos',
  'vegetable soup': 'Daržovių sriuba', 'tomato soup': 'Pomidorų sriuba',
  'pancakes': 'Blynai', 'sandwich': 'Sumuštinis', 'smoothie': 'Kokteiliai',
  'yogurt with granola': 'Jogurtas su granola', 'cottage cheese': 'Varškė',
  'mashed potatoes': 'Bulvių košė', 'baked potato': 'Kepta bulvė',
  'grilled vegetables': 'Keptos daržovės', 'stir fry': 'Keptos daržovės su mėsa',
  'buckwheat porridge': 'Grikių košė', 'rice porridge': 'Ryžių košė',
};

async function googleTranslate(text: string): Promise<string> {
  // Check offline dictionary first (exact match)
  const lower = text.toLowerCase().trim();
  if (MEAL_NAME_DICT[lower]) return MEAL_NAME_DICT[lower];

  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=lt&dt=t&q=${encodeURIComponent(text)}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000); // 5s timeout per translation
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);
    if (!res.ok) return text;
    const data = await res.json();
    if (data && data[0]) {
      return data[0].map((s: string[]) => s[0]).join('');
    }
    return text;
  } catch {
    console.warn(`Translation failed for "${text}", keeping original`);
    return text;
  }
}

async function translateNamesToLT(names: string[]): Promise<string[]> {
  if (names.length === 0) return [];

  // Batch into chunks of 15 to avoid URL length limits (~2000 chars)
  const CHUNK_SIZE = 15;
  const allResults: string[] = [];

  for (let i = 0; i < names.length; i += CHUNK_SIZE) {
    const chunk = names.slice(i, i + CHUNK_SIZE);
    try {
      const joined = chunk.join(' | ');
      const translated = await googleTranslate(joined);
      const parts = translated.split(' | ').map(s => s.trim());

      if (parts.length === chunk.length) {
        allResults.push(...parts);
      } else {
        console.warn(`Batch split mismatch (${parts.length} vs ${chunk.length}), translating chunk individually`);
        for (const name of chunk) {
          allResults.push(await googleTranslate(name));
        }
      }
    } catch (error) {
      console.error('Translation chunk failed:', error);
      allResults.push(...chunk); // fallback: keep English names
    }
  }

  return allResults;
}

// Bilingual food keyword map: English → Lithuanian stems for fuzzy matching
const FOOD_KEYWORD_MAP: [string, string[]][] = [
  ['chicken', ['viš', 'vištienos', 'vištiena', 'poultry', 'hen']],
  ['egg', ['kiau', 'kiaušin', 'eggs']],
  ['fish', ['žuv', 'žuvies', 'žuvis']],
  ['salmon', ['lašiš']],
  ['cod', ['menk']],
  ['tuna', ['tun']],
  ['beef', ['jautien', 'jautienos', 'steak', 'ground beef', 'minced beef']],
  ['pork', ['kiaulien', 'kiaulienos']],
  ['turkey', ['kalakut']],
  ['sausage', ['dešr', 'dešrelė']],
  ['bacon', ['šonin', 'šoninė']],
  ['ham', ['kumpis', 'kumpio']],
  ['milk', ['pien', 'pienas', 'pieno']],
  ['cheese', ['sūr', 'sūris', 'sūrio', 'cheddar', 'mozzarella', 'parmesan', 'feta', 'gouda']],
  ['butter', ['sviest', 'sviesto', 'sviestas']],
  ['yogurt', ['jogurt', 'skyr', 'greek yoghurt', 'greek yogurt']],
  ['cottage', ['varškė', 'varškės', 'cottage cheese', 'quark', 'curd']],
  ['cream', ['grietin', 'grietinėlė', 'grietinė', 'heavy cream', 'whipping cream']],
  ['kefir', ['kefyr', 'kefir']],
  ['bread', ['duon', 'duonos', 'duona', 'toast', 'baguette', 'ciabatta', 'sourdough']],
  ['rice', ['ryž', 'ryžiai', 'ryžių', 'basmati', 'jasmine rice']],
  ['pasta', ['makaron', 'makaronai', 'spaghetti', 'penne', 'fusilli', 'noodle', 'noodles', 'linguine', 'fettuccine']],
  ['oat', ['avižin', 'avižų', 'dribsniai', 'oats', 'oatmeal', 'porridge']],
  ['buckwheat', ['griki', 'grikių']],
  ['flour', ['milt', 'miltų', 'miltai']],
  ['potato', ['bulv', 'bulvės', 'bulvių', 'potatoes', 'sweet potato']],
  ['carrot', ['mork', 'morkos', 'morkų', 'carrots']],
  ['tomato', ['pomidor', 'pomidorų', 'tomatoes', 'cherry tomato']],
  ['cucumber', ['agurk', 'agurkų', 'cucumbers']],
  ['onion', ['svogūn', 'svogūnų', 'onions', 'shallot', 'red onion']],
  ['pepper', ['paprik', 'paprikos', 'bell pepper', 'capsicum']],
  ['cabbage', ['kopūst', 'kopūstų']],
  ['banana', ['banan', 'bananų', 'bananai', 'bananas']],
  ['apple', ['obuol', 'obuolių', 'obuoliai', 'apples']],
  ['lemon', ['citrin', 'lemon juice']],
  ['orange', ['apelsin', 'oranges']],
  ['mushroom', ['gryb', 'grybų', 'grybai', 'mushrooms', 'champignon', 'shiitake']],
  ['spinach', ['špinat']],
  ['broccoli', ['brokoli']],
  ['bean', ['pupel', 'pupelių', 'beans', 'kidney bean', 'black bean', 'white bean']],
  ['lentil', ['lęš', 'lęšiai', 'lentils', 'red lentil']],
  ['tofu', ['tofu']],
  ['honey', ['med', 'medus', 'medaus']],
  ['oil', ['aliej', 'aliejaus', 'olive oil', 'sunflower oil', 'coconut oil', 'vegetable oil']],
  ['granola', ['granola', 'musli', 'muesli']],
  ['garlic', ['česnako', 'česnak', 'garlic clove', 'garlic cloves']],
  ['salt', ['drusk']],
  ['sugar', ['cukr']],
  ['sour cream', ['grietinė']],
  ['avocado', ['avokad', 'avocados']],
  // Augmentations - dažnai pasitaikantys ingredientai, kurių anksčiau trūko.
  // Be šių raktų `estimateIngredientCost` grąžina 0.30 EUR placeholder'į.
  ['almond', ['migdol', 'almonds']],
  ['walnut', ['graikinis riesut', 'walnut']],
  ['peanut', ['žemes riesut', 'peanut']],
  ['nut', ['riesut', 'nuts']],
  ['lettuce', ['salot', 'lettuce']],
  ['radish', ['ridik', 'radish']],
  ['quinoa', ['quinoa', 'kvinoja', 'bolivin']],
  ['chickpea', ['avinzir', 'chickpea', 'humus']],
  ['blueberry', ['melyn', 'blueberr']],
  ['strawberry', ['braski', 'strawberr']],
  ['raspberry', ['aviet', 'raspberr']],
  ['berry', ['uog', 'berries']],
  ['olive_oil', ['alyvuog aliej', 'olive oil']],
  ['sunflower_oil', ['saulegrazu aliej', 'sunflower oil']],
  ['sour_cream', ['grietine', 'sour cream']],
  ['heavy_cream', ['plakim grietin', 'heavy cream']],
  ['cream_thickener', ['grietineles standikli', 'standikli', 'cream thickener']],
  ['citric_acid', ['citrin rugst', 'citric acid']],
  ['vinegar', ['act', 'vinegar']],
  ['mustard', ['garstic', 'mustard']],
  ['mayo', ['majone', 'mayonnaise']],
  ['ketchup', ['ketcup']],
  ['spice_mix', ['priesk', 'prieskoniu', 'spice', 'mix']],
  ['salt', ['drusk', 'salt']],
  ['sugar', ['cukr', 'sugar']],
  ['pepper_spice', ['juodj pipirj', 'black pepper']],
  ['cinnamon', ['cinamon', 'cinnamon']],
  ['paprika_spice', ['paprika prieskoni', 'paprika']],
  ['ginger', ['imbier', 'ginger']],
  ['cocoa', ['kakavos', 'cocoa', 'kakav']],
  ['vanilla', ['vanil', 'vanilla']],
  ['raisins', ['razin', 'raisins']],
  ['dates', ['dziovinti datul', 'dates']],
  ['cherry', ['vysn', 'cherr']],
  ['water', ['vandens', 'vanduo', 'water']],
];

// Reference prices for Lithuanian supermarkets (EUR, 2025-2026)
// Weight items: per kg. Volume items: per L. Unit items: per unit.
// Based on average prices across Maxima, IKI, Lidl, Rimi, Norfa.
const REFERENCE_PRICES: Record<string, number> = {
  // Proteins
  chicken: 4.50,    // /kg — filė ~6, whole ~3, avg 4.50
  egg: 0.18,        // /unit — 10 vnt ~1.80
  fish: 7.00,       // /kg — generic white fish
  salmon: 11.00,    // /kg — fresh fillet
  cod: 9.00,        // /kg — frozen fillets
  tuna: 2.00,       // /unit (can 160g)
  beef: 9.00,       // /kg — minced ~6, steak ~12, avg 9
  pork: 4.50,       // /kg — shoulder ~3.50, tenderloin ~6, avg 4.50
  turkey: 7.00,     // /kg — breast fillet
  sausage: 5.00,    // /kg — cooked sausage
  bacon: 7.00,      // /kg — sliced
  ham: 6.00,        // /kg — sliced deli
  // Dairy
  milk: 1.10,       // /L — 2.5% fat
  cheese: 7.00,     // /kg — hard cheese block
  butter: 9.00,     // /kg — 82% fat (~1.80/200g)
  yogurt: 3.50,     // /kg — natural (~0.70/200g)
  cottage: 4.00,    // /kg — varškė (~1.60/400g)
  cream: 4.50,      // /L — 35% fat (~0.90/200ml)
  kefir: 1.00,      // /L
  // Grains & Starches
  bread: 1.30,      // /unit (loaf 400g)
  rice: 1.40,       // /kg — white long grain
  pasta: 1.80,      // /kg — spaghetti/penne
  oat: 1.20,        // /kg — rolled oats
  buckwheat: 1.80,  // /kg — grikiai
  flour: 0.70,      // /kg — wheat
  // Vegetables
  potato: 0.70,     // /kg
  carrot: 0.70,     // /kg
  tomato: 2.80,     // /kg — seasonal avg
  cucumber: 2.00,   // /kg
  onion: 0.80,      // /kg
  pepper: 3.50,     // /kg — bell pepper
  cabbage: 0.50,    // /kg
  mushroom: 3.50,   // /kg — champignon
  spinach: 6.00,    // /kg — fresh (~1.50/250g bag)
  broccoli: 2.50,   // /kg — frozen ~2, fresh ~3
  // Fruits
  banana: 1.30,     // /kg
  apple: 1.80,      // /kg — Lithuanian
  lemon: 0.25,      // /unit
  orange: 0.35,     // /unit
  avocado: 1.20,    // /unit
  // Legumes & Plant
  bean: 1.20,       // /unit (can 400g)
  lentil: 2.20,     // /kg
  tofu: 6.00,       // /kg (~2.40/400g)
  // Pantry
  honey: 8.00,      // /kg (~2.40/300g jar)
  oil: 2.50,        // /L — sunflower/rapeseed
  granola: 5.00,    // /kg (~2.00/400g)
  garlic: 0.10,     // /unit (clove)
  salt: 0.02,       // /unit (pinch)
  sugar: 0.04,      // /unit (tbsp)
  // Augmentations
  almond: 14.00,    // /kg
  walnut: 18.00,    // /kg
  peanut: 6.00,     // /kg
  nut: 14.00,       // /kg generic nuts
  lettuce: 5.00,    // /kg
  radish: 2.50,     // /kg
  quinoa: 6.00,     // /kg
  chickpea: 2.20,   // /kg
  blueberry: 8.00,  // /kg
  strawberry: 6.00, // /kg
  raspberry: 10.00, // /kg
  berry: 8.00,      // /kg generic
  olive_oil: 4.00,  // /L
  sunflower_oil: 2.50, // /L
  sour_cream: 4.50, // /kg
  heavy_cream: 5.00, // /L
  cream_thickener: 30.00, // /kg (small packets)
  citric_acid: 8.00, // /kg (small packets)
  vinegar: 1.50,    // /L
  mustard: 4.00,    // /kg
  mayo: 4.00,       // /kg
  ketchup: 3.50,    // /kg
  spice_mix: 30.00, // /kg (small packets ~10g)
  pepper_spice: 30.00, // /kg
  cinnamon: 30.00,  // /kg
  paprika_spice: 25.00, // /kg
  ginger: 5.00,     // /kg
  cocoa: 12.00,     // /kg
  vanilla: 30.00,   // /kg
  raisins: 6.00,    // /kg
  dates: 10.00,     // /kg
  cherry: 6.00,     // /kg
  water: 0.05,      // /L (negligible)
};

// Parse quantity from ingredient string like "120g chicken breast" → 0.12 kg
function parseQuantityKg(item: string): number {
  const gMatch = item.match(/(\d+)\s*g\b/i);
  if (gMatch) return parseInt(gMatch[1]) / 1000;
  const kgMatch = item.match(/(\d+(?:\.\d+)?)\s*kg/i);
  if (kgMatch) return parseFloat(kgMatch[1]);
  const mlMatch = item.match(/(\d+)\s*ml/i);
  if (mlMatch) return parseInt(mlMatch[1]) / 1000; // treat ml as L fraction
  const lMatch = item.match(/(\d+(?:\.\d+)?)\s*[lL]\b/);
  if (lMatch) return parseFloat(lMatch[1]);
  const numMatch = item.match(/(\d+)/);
  if (numMatch) return parseInt(numMatch[1]); // for "3 eggs" → 3 units
  return 1; // default 1 unit
}

function estimateIngredientCost(item: string, foodKeyword: string | null, isPromo: boolean, promoPrice: number): { cost: number; refCost: number } {
  if (!foodKeyword) return { cost: 0.30, refCost: 0.30 };
  const refPrice = REFERENCE_PRICES[foodKeyword] || 0.50;
  const qty = parseQuantityKg(item);

  // For unit-based items (eggs, lemons, bread), qty is already in units
  const unitItems = ['egg', 'lemon', 'orange', 'bread', 'garlic', 'avocado', 'tuna', 'bean'];
  if (unitItems.includes(foodKeyword)) {
    const refCost = Math.round(qty * refPrice * 100) / 100;
    const price = isPromo ? Math.min(refPrice, promoPrice / Math.max(1, qty)) : refPrice;
    return { cost: Math.round(qty * price * 100) / 100, refCost };
  }

  // For weight/volume items, qty is in kg/L — all prices are now per-kg/per-L
  const refCost = Math.round(qty * refPrice * 100) / 100;
  const price = isPromo ? Math.min(refPrice, promoPrice) : refPrice;
  return { cost: Math.round(qty * price * 100) / 100, refCost };
}

function enrichSlotsWithCosts(
  slots: any[],
  promotions: PromotionItem[]
): { matched: number; total: number } {
  if (!promotions || promotions.length === 0) {
    // Even without promotions, add cost estimates using reference prices
    function addRefCosts(ingredients: string[]): any[] {
      return ingredients.map((ing: string) => {
        const lowerItem = ing.toLowerCase();
        let foodKey: string | null = null;
        for (const [enWord] of FOOD_KEYWORD_MAP) {
          if (lowerItem.includes(enWord)) { foodKey = enWord; break; }
        }
        const { cost } = estimateIngredientCost(ing, foodKey, false, 0);
        return { item: ing, costEur: cost, isPromotion: false, store: null };
      });
    }
    for (const slot of slots) {
      if (!slot.variants) continue;
      for (const variant of slot.variants) {
        if (!variant.ingredients) continue;
        variant.ingredientCosts = addRefCosts(variant.ingredients);
        variant.estimatedCostEur = Math.round(variant.ingredientCosts.reduce((s: number, ic: any) => s + ic.costEur, 0) * 100) / 100;
        // Also process memberVariants
        if (variant.memberVariants) {
          for (const mv of variant.memberVariants) {
            if (!mv.ingredients) continue;
            mv.ingredientCosts = addRefCosts(mv.ingredients);
            mv.estimatedCostEur = Math.round(mv.ingredientCosts.reduce((s: number, ic: any) => s + ic.costEur, 0) * 100) / 100;
          }
        }
      }
    }
    return { matched: 0, total: 0 };
  }

  let matched = 0;
  let total = 0;

  // Pre-index promotions by food keyword
  const promoIndex = new Map<string, PromotionItem[]>();
  for (const promo of promotions) {
    const lowerName = promo.name.toLowerCase();
    for (const [enWord, ltStems] of FOOD_KEYWORD_MAP) {
      const hasMatch = ltStems.some(stem => lowerName.includes(stem)) || lowerName.includes(enWord);
      if (hasMatch) {
        if (!promoIndex.has(enWord)) promoIndex.set(enWord, []);
        promoIndex.get(enWord)!.push(promo);
      }
    }
  }

  function processIngredients(ingredients: string[]): any[] {
    return ingredients.map((ing: string) => {
      total++;
      const lowerItem = ing.toLowerCase();
      let foodKey: string | null = null;
      let bestPromo: PromotionItem | null = null;

      for (const [enWord] of FOOD_KEYWORD_MAP) {
        if (!lowerItem.includes(enWord)) continue;
        foodKey = enWord;
        const matchingPromos = promoIndex.get(enWord);
        if (matchingPromos && matchingPromos.length > 0) {
          bestPromo = matchingPromos.reduce((a, b) => a.price < b.price ? a : b);
        }
        break;
      }

      if (bestPromo) {
        matched++;
        const { cost, refCost } = estimateIngredientCost(ing, foodKey, true, bestPromo.price);
        const storeName = (bestPromo.store || 'unknown').charAt(0).toUpperCase() + (bestPromo.store || 'unknown').slice(1);
        const savingsEur = Math.round(Math.max(0, refCost - cost) * 100) / 100;
        return { item: ing, costEur: cost, isPromotion: true, store: storeName, savingsEur };
      } else {
        const { cost } = estimateIngredientCost(ing, foodKey, false, 0);
        return { item: ing, costEur: cost, isPromotion: false, store: null };
      }
    });
  }

  for (const slot of slots) {
    if (!slot.variants) continue;
    for (const variant of slot.variants) {
      if (!variant.ingredients) continue;

      // Build ingredientCosts from scratch using real data
      variant.ingredientCosts = processIngredients(variant.ingredients);
      variant.estimatedCostEur = Math.round(variant.ingredientCosts.reduce((s: number, ic: any) => s + ic.costEur, 0) * 100) / 100;

      // Process memberVariants too
      if (variant.memberVariants) {
        for (const mv of variant.memberVariants) {
          if (!mv.ingredients) continue;
          mv.ingredientCosts = processIngredients(mv.ingredients);
          mv.estimatedCostEur = Math.round(mv.ingredientCosts.reduce((s: number, ic: any) => s + ic.costEur, 0) * 100) / 100;
        }
      }
    }
  }

  return { matched, total };
}

// ─── OUTPUT VALIDATION & REPAIR ────────────────────────────────────
interface ValidationResult {
  repaired: boolean;
  warnings: string[];
  slotsMissing: number;
  variantsMissing: number;
  memberVariantsMissing: number;
  calorieOutliers: number;
  ingredientsWithoutQty: number;
}

function validateAndRepairSlots(
  slots: any[],
  expectedSlots: number,
  expectedMealTypes: string[],
  dates: string[],
  restrictedMemberIds: string[],
  restrictedMembers: { id: string; name: string; allergies?: string[]; dislikes?: string[] }[],
  variantCount: number = 5
): ValidationResult {
  const result: ValidationResult = {
    repaired: false,
    warnings: [],
    slotsMissing: 0,
    variantsMissing: 0,
    memberVariantsMissing: 0,
    calorieOutliers: 0,
    ingredientsWithoutQty: 0,
  };

  // 0. Pre-pass: drop slots with invalid date/mealType so fill logic can
  // regenerate them. AI sometimes returns slot objects without `date` or
  // `mealType` fields - palikti jie sukeltų `localeCompare` nuolyžą prie
  // rūšiavimo apačioje, o fill step'as jų nepastebės, nes `slots.length`
  // gali būti lygus `expectedSlots` net ir su sugadintais įrašais.
  const expectedDateSet = new Set(dates);
  const expectedMealTypeSet = new Set(expectedMealTypes);
  for (let i = slots.length - 1; i >= 0; i--) {
    const s = slots[i];
    const hasValidDate = typeof s?.date === 'string' && expectedDateSet.has(s.date);
    const hasValidMealType = typeof s?.mealType === 'string' && expectedMealTypeSet.has(s.mealType);
    if (!hasValidDate || !hasValidMealType) {
      result.warnings.push(
        `Dropping slot with invalid date/mealType: date=${JSON.stringify(s?.date)}, mealType=${JSON.stringify(s?.mealType)}`,
      );
      result.repaired = true;
      slots.splice(i, 1);
    }
  }

  // 1. Fix slot count — fill missing slots
  if (slots.length < expectedSlots) {
    result.slotsMissing = expectedSlots - slots.length;
    result.warnings.push(`AI generated ${slots.length}/${expectedSlots} slots, filling ${result.slotsMissing} missing`);

    // Jei AI grąžino pilnai tuščią/netinkamą rezultatą (visi slot'ai išmesti
    // pre-pass'e dėl blogos `date`/`mealType`) - anksčiau buvo tyliai įstatoma
    // „Paprastas patiekalas, 200g ryžių, 100g daržovių" placeholder'is ir
    // grąžinamas 200 OK. Tai naudotojui atrodė kaip korektiškas planas, nors
    // iš tiesų joks AI neatsakė. Dabar - mesti aiškią klaidą, kad caller'is
    // grąžintų 503 ir front'as parodytų žinutę „Visi AI modeliai šiuo metu
    // nepasiekiami. Bandykite po kelių minučių".
    if (slots.length === 0) {
      throw new Error(
        'Visi AI modeliai šiuo metu nepasiekiami arba grąžino netinkamą atsakymą. Bandykite po kelių minučių.',
      );
    }

    // Build set of existing date+mealType combos
    const existingKeys = new Set(slots.map(s => `${s.date}_${s.mealType}`));
    for (const date of dates) {
      for (const mealType of expectedMealTypes) {
        const key = `${date}_${mealType}`;
        if (!existingKeys.has(key)) {
          // Clone last valid slot of same mealType, or any last slot.
          // Abu yra realūs AI-sugeneruoti slot'ai (ne hardcoded placeholder'is),
          // tad naudotojas gaus bent panašų, o ne „Paprastas patiekalas".
          const template =
            slots.find(s => s.mealType === mealType) ||
            slots[slots.length - 1];
          const cloned = JSON.parse(JSON.stringify(template));
          cloned.date = date;
          cloned.mealType = mealType;
          slots.push(cloned);
          result.repaired = true;
        }
      }
    }
  }

  // 2. Validate each slot
  for (const slot of slots) {
    if (!slot.variants) {
      slot.variants = [];
      result.warnings.push(`Slot ${slot.date}/${slot.mealType} had no variants array`);
    }

    // 2a. Ensure exactly variantCount variants
    //
    // Jei slot'as pilnai be variantų - kažkas blogai AI output'e.
    // Geriau skolinamės iš „broliško" slot'o (to paties mealType, kitos dienos),
    // nei kišam „Simple meal, 200g rice, 100g vegetables" placeholder'į, kuris
    // naudotojui atrodo kaip korektiškas planas.
    if (slot.variants.length === 0) {
      const donor = slots.find(
        s => s !== slot && s.mealType === slot.mealType && Array.isArray(s.variants) && s.variants.length > 0,
      );
      if (donor) {
        slot.variants = JSON.parse(JSON.stringify(donor.variants));
        result.repaired = true;
        result.warnings.push(`Slot ${slot.date}/${slot.mealType} borrowed variants from ${donor.date}/${donor.mealType}`);
      } else {
        throw new Error(
          'Visi AI modeliai šiuo metu nepasiekiami arba grąžino netinkamą atsakymą. Bandykite po kelių minučių.',
        );
      }
    }

    while (slot.variants.length < variantCount) {
      result.variantsMissing++;
      result.repaired = true;
      // Klonuojam paskutinį esamą variant'ą su pakeistu vardu - kadangi
      // slot.variants.length > 0 čia garantuotas (aukščiau yra guard'as).
      const source = slot.variants[slot.variants.length - 1];
      const cloned = JSON.parse(JSON.stringify(source));
      cloned.name = cloned.name + ` (variant ${slot.variants.length + 1})`;
      slot.variants.push(cloned);
    }

    // Trim excess variants
    if (slot.variants.length > variantCount) {
      slot.variants = slot.variants.slice(0, variantCount);
    }

    for (const variant of slot.variants) {
      // 2b. Calorie sanity check (per-meal bounds: 80-2500 kcal)
      if (typeof variant.calories === 'number') {
        if (variant.calories < 80 || variant.calories > 2500) {
          result.calorieOutliers++;
          result.warnings.push(`${slot.date}/${slot.mealType}: "${variant.name}" has ${variant.calories}kcal (outlier)`);
          // Clamp to reasonable range
          variant.calories = Math.max(150, Math.min(2000, variant.calories));
          result.repaired = true;
        }
      }

      // 2b2. Macro consistency check: protein*4 + carbs*4 + fat*9 ≈ calories (±30%)
      // Jei LLM grąžino nelogiškus makroelementus - perskaičiuojam proporcingai
      if (typeof variant.calories === 'number' && variant.calories > 0) {
        const p = variant.protein || 0;
        const c = variant.carbs || 0;
        const f = variant.fat || 0;
        const macroKcal = p * 4 + c * 4 + f * 9;
        if (macroKcal > 0) {
          const ratio = macroKcal / variant.calories;
          if (ratio < 0.5 || ratio > 1.8) {
            // Makroelementai neatitinka kalorijų - perskaičiuojam iš kalorijų
            // Pagal tipinį pasiskirstymą: 25% P, 45% C, 30% F
            variant.protein = Math.round(variant.calories * 0.25 / 4);
            variant.carbs = Math.round(variant.calories * 0.45 / 4);
            variant.fat = Math.round(variant.calories * 0.30 / 9);
            result.warnings.push(`${slot.date}/${slot.mealType}: "${variant.name}" macros recalculated (was ${macroKcal}kcal from macros vs ${variant.calories}kcal declared)`);
            result.repaired = true;
          }
        } else if (p === 0 && c === 0 && f === 0) {
          // LLM negrąžino makroelementų - užpildom pagal kalorijas
          variant.protein = Math.round(variant.calories * 0.25 / 4);
          variant.carbs = Math.round(variant.calories * 0.45 / 4);
          variant.fat = Math.round(variant.calories * 0.30 / 9);
        }
      }

      // 2c. Ensure ingredients is an array
      if (!Array.isArray(variant.ingredients)) {
        variant.ingredients = [];
        result.warnings.push(`${slot.date}/${slot.mealType}: "${variant.name}" had no ingredients`);
        result.repaired = true;
      }

      // 2d. Check ingredient quantities
      for (const ing of variant.ingredients) {
        const hasQty = /\d+\s*(g|kg|ml|l|tbsp|tsp|cup|slice|piece|unit)s?\b/i.test(ing) || /^\d+\s/.test(ing);
        if (!hasQty) {
          result.ingredientsWithoutQty++;
        }
      }

      // 2e. Ensure memberVariants for restricted members
      if (restrictedMemberIds.length > 0) {
        if (!Array.isArray(variant.memberVariants)) {
          variant.memberVariants = [];
        }

        const existingMemberIds = new Set(variant.memberVariants.map((mv: any) => mv.memberId));
        for (const rm of restrictedMembers) {
          if (!existingMemberIds.has(rm.id)) {
            result.memberVariantsMissing++;
            result.repaired = true;
            // Create a copy of main variant as fallback for this member
            // Check if main variant contains restricted ingredients
            const restrictions = [...(rm.allergies || []), ...(rm.dislikes || [])].map((r: string) => r.toLowerCase());
            const ingredientStr = variant.ingredients.join(' ').toLowerCase();
            const hasConflict = restrictions.some((r: string) => ingredientStr.includes(r));
            variant.memberVariants.push({
              memberId: rm.id,
              memberName: rm.name,
              name: hasConflict ? `${variant.name} (pritaikyta ${rm.name})` : variant.name,
              calories: variant.calories,
              protein: variant.protein,
              carbs: variant.carbs,
              fat: variant.fat,
              ingredients: hasConflict
                ? variant.ingredients.filter((ing: string) => !restrictions.some((r: string) => ing.toLowerCase().includes(r)))
                : [...variant.ingredients],
              warning: hasConflict ? `Pašalinti ingredientai dėl ${rm.name} apribojimų` : undefined,
            });
          }
        }
      }
    }
  }

  // Sort slots by date + mealType order. Defensive - pre-pass turėtų būti
  // jau išmetęs undefined date/mealType įrašus, bet vis tiek guard'inam,
  // kad būsimas bug'as nepadarytų 500 error'o.
  const mealOrder: Record<string, number> = {};
  expectedMealTypes.forEach((mt, i) => mealOrder[mt] = i);
  slots.sort((a, b) => {
    const aDate = typeof a?.date === 'string' ? a.date : '';
    const bDate = typeof b?.date === 'string' ? b.date : '';
    const dateComp = aDate.localeCompare(bDate);
    if (dateComp !== 0) return dateComp;
    const aMt = typeof a?.mealType === 'string' ? a.mealType : '';
    const bMt = typeof b?.mealType === 'string' ? b.mealType : '';
    return (mealOrder[aMt] ?? 99) - (mealOrder[bMt] ?? 99);
  });

  if (result.ingredientsWithoutQty > 0) {
    result.warnings.push(`${result.ingredientsWithoutQty} ingredients lack quantity (e.g. "chicken" instead of "120g chicken")`);
  }
  if (result.variantsMissing > 0) {
    result.warnings.push(`Filled ${result.variantsMissing} missing variants by cloning`);
  }
  if (result.memberVariantsMissing > 0) {
    result.warnings.push(`Filled ${result.memberVariantsMissing} missing memberVariants with main dish copy`);
  }

  return result;
}

function buildPrompt(
  req: GenerateRequest,
  spoonRecipes: SpoonacularRecipe[],
  overrides?: { maxRecipes?: number; maxPromos?: number; variantCount?: number }
): string {
  const maxRecipes = overrides?.maxRecipes ?? MAX_RECIPES_IN_PROMPT;
  const maxPromos = overrides?.maxPromos ?? MAX_PROMOTIONS_IN_PROMPT;
  const vc = overrides?.variantCount ?? 5;
  const snackCount = Math.min(3, Math.max(0, req.snackCount || 0));
  const mealsCount = 3 + snackCount;
  const mealTypes = ['breakfast', 'lunch', 'dinner'];
  for (let i = 1; i <= snackCount; i++) mealTypes.push(`snack${i}`);

  const memberInfo = req.members.map(m => {
    const macros = calculateMacros(m);
    
    let bCal: number, lCal: number, dCal: number;
    let snackCals: number[] = [];

    if (snackCount === 0) {
      bCal = Math.round(macros.calories * 0.25);
      lCal = Math.round(macros.calories * 0.40);
      dCal = Math.round(macros.calories * 0.35);
    } else if (snackCount === 1) {
      bCal = Math.round(macros.calories * 0.25);
      lCal = Math.round(macros.calories * 0.35);
      dCal = Math.round(macros.calories * 0.30);
      snackCals = [Math.round(macros.calories * 0.10)];
    } else if (snackCount === 2) {
      bCal = Math.round(macros.calories * 0.20);
      lCal = Math.round(macros.calories * 0.30);
      dCal = Math.round(macros.calories * 0.30);
      snackCals = [Math.round(macros.calories * 0.10), Math.round(macros.calories * 0.10)];
    } else {
      bCal = Math.round(macros.calories * 0.20);
      lCal = Math.round(macros.calories * 0.27);
      dCal = Math.round(macros.calories * 0.27);
      snackCals = [Math.round(macros.calories * 0.08), Math.round(macros.calories * 0.08), Math.round(macros.calories * 0.10)];
    }

    const goalLabel = m.fitnessGoal === 'lose_weight' ? 'LOSING WEIGHT (high protein, calorie deficit)'
      : m.fitnessGoal === 'gain_muscle' ? 'BUILDING MUSCLE (high protein, calorie surplus)'
      : 'MAINTAINING WEIGHT';
      
    // Per-meal protein targets (proporcingai pagal kalorijų paskirstymą)
    const bProt = Math.round(macros.proteinG * bCal / macros.calories);
    const lProt = Math.round(macros.proteinG * lCal / macros.calories);
    const dProt = Math.round(macros.proteinG * dCal / macros.calories);
    const snackProts = snackCals.map(sc => Math.round(macros.proteinG * sc / macros.calories));

    let snackStr = snackCount > 0 ? `, snacks~${snackCals.map((c, i) => `${c}kcal/${snackProts[i]}gP`).join(',')}` : '';
    let info = `- ${m.name} (ID:"${m.id}"): ${goalLabel}. Target ${macros.calories}kcal/day, ${macros.proteinG}g protein, ${macros.carbsG}g carbs, ${macros.fatG}g fat. Per meal: breakfast~${bCal}kcal/${bProt}gP, lunch~${lCal}kcal/${lProt}gP, dinner~${dCal}kcal/${dProt}gP${snackStr}.`;
    if (m.targetWeightKg) info += ` Current: ${m.weightKg}kg, goal: ${m.targetWeightKg}kg.`;
    if (m.allergies.length > 0) info += ` ALLERGIES: ${m.allergies.join(', ')}.`;
    if (m.dislikes.length > 0) info += ` DISLIKES: ${m.dislikes.join(', ')}.`;
    if (m.likedProducts && m.likedProducts.length > 0) info += ` LIKES (positive signal, prioritize when possible): ${m.likedProducts.join(', ')}.`;
    if (m.brandPreferences && m.brandPreferences.length > 0) {
      const brandStr = m.brandPreferences.map(bp =>
        `prefer "${bp.preferredBrand}" for ${bp.category}${bp.avoidBrands?.length ? ` (avoid: ${bp.avoidBrands.join(', ')})` : ''}`
      ).join('; ');
      info += ` BRAND PREFERENCES: ${brandStr}.`;
    }
    if (m.substituteRules && m.substituteRules.length > 0) {
      const subStr = m.substituteRules.map(sr =>
        `replace "${sr.product}" with "${sr.substituteWith}"${sr.reason ? ` (${sr.reason})` : ''}`
      ).join('; ');
      info += ` SUBSTITUTIONS: ${subStr}.`;
    }
    return info;
  }).join('\n');

  // Build recipe pool section from Spoonacular recipes (passed from client).
  // Cap'iname maxRecipes kiekiu, kad tilptume į TPM. Per meal type paskirstome
  // tolygiai, kad neturėtume visų „breakfast" receptų, bet nė vieno „dinner".
  const clientRecipes = (req as any).spoonacularRecipes as RecipePoolItem[] | undefined;
  let recipeList = '';
  if (clientRecipes && clientRecipes.length > 0) {
    const grouped: Record<string, RecipePoolItem[]> = {};
    for (const r of clientRecipes) {
      const type = r.suggestedMealType || 'main';
      if (!grouped[type]) grouped[type] = [];
      grouped[type].push(r);
    }
    const groupKeys = Object.keys(grouped);
    const perType = Math.max(1, Math.floor(maxRecipes / Math.max(1, groupKeys.length)));
    const capped: RecipePoolItem[] = [];
    for (const type of groupKeys) {
      capped.push(...grouped[type].slice(0, perType));
    }
    // Užpildome likutį, jei dar telpa
    for (const r of clientRecipes) {
      if (capped.length >= maxRecipes) break;
      if (!capped.includes(r)) capped.push(r);
    }

    const lines: string[] = [];
    const finalGrouped: Record<string, RecipePoolItem[]> = {};
    for (const r of capped.slice(0, maxRecipes)) {
      const type = r.suggestedMealType || 'main';
      if (!finalGrouped[type]) finalGrouped[type] = [];
      finalGrouped[type].push(r);
    }
    for (const [type, recipes] of Object.entries(finalGrouped)) {
      lines.push(`  ### ${type.toUpperCase()}`);
      for (const r of recipes) {
        // Trumpesnis format'as: tik 4 ingredientai, slice'intos title ir ingredientų eilutės
        const cleanTitle = (r.title || '').replace(/[\x00-\x1F\x7F"]/g, ' ').slice(0, 80);
        const cleanIngs = (r.ingredients || [])
          .slice(0, 4)
          .map(ing => (ing || '').replace(/[\x00-\x1F\x7F]/g, ' ').slice(0, 60))
          .join(', ');
        lines.push(`  - [${r.id}] "${cleanTitle}" (${r.calories}kcal P:${r.protein} C:${r.carbs} F:${r.fat}, ${r.readyInMinutes}min): ${cleanIngs}`);
      }
    }
    recipeList = lines.join('\n');
  } else {
    // Fallback: use Edge Function's own Spoonacular search
    recipeList = spoonRecipes.slice(0, maxRecipes).map(r => {
      const cal = r.nutrition?.nutrients?.find(n => n.name === 'Calories')?.amount || 0;
      const prot = r.nutrition?.nutrients?.find(n => n.name === 'Protein')?.amount || 0;
      return `  - "${r.title}" (${Math.round(cal)}kcal, P:${Math.round(prot)}g, ${r.readyInMinutes}min)`;
    }).join('\n');
  }
  const hasRecipePool = !!(clientRecipes && clientRecipes.length > 0);

  const inventory = req.inventoryItems.length > 0 ? req.inventoryItems.join('\n') : 'Fridge is empty.';

  const detailed = req.promotionItemsDetailed || [];
  let promotions = '';
  if (detailed.length > 0) {
    // Categorize promotions by food type for better AI matching
    const categories: Record<string, typeof detailed> = {
      'PROTEINS (meat, fish, eggs, tofu)': [],
      'DAIRY (milk, cheese, yogurt, butter)': [],
      'GRAINS & STAPLES (bread, rice, pasta, oats, cereal)': [],
      'FRUITS & VEGETABLES': [],
      'OTHER FOOD': [],
    };
    const proteinKw = ['viš', 'chicken', 'kiau', 'egg', 'žuv', 'fish', 'lašiš', 'salmon', 'jautien', 'beef', 'kiaulien', 'pork', 'kalakut', 'turkey', 'tofu', 'mės', 'meat', 'dešr', 'sausage', 'šonin', 'bacon', 'kumpis', 'ham', 'filė', 'fillet'];
    const dairyKw = ['pien', 'milk', 'sūr', 'cheese', 'jogurt', 'yogurt', 'grie', 'cream', 'sviest', 'butter', 'varškė', 'cottage', 'kefyr', 'kefir', 'pilos'];
    const grainKw = ['duon', 'bread', 'ryž', 'rice', 'makaron', 'pasta', 'avižin', 'oat', 'miež', 'griki', 'buckwheat', 'milt', 'flour', 'dribs', 'granola', 'muesli', 'skrebut', 'toast'];
    const produceKw = ['obuol', 'apple', 'banan', 'banana', 'pomidor', 'tomato', 'agurk', 'cucumber', 'morkos', 'carrot', 'bulv', 'potato', 'svogūn', 'onion', 'paprik', 'pepper', 'kopūst', 'cabbage', 'salotos', 'salad', 'špinat', 'spinach', 'brokoliai', 'broccoli', 'citrin', 'lemon', 'apelsin', 'orange', 'vais', 'fruit', 'uog', 'berry', 'daržov', 'vegetable', 'grybai', 'mushroom'];

    for (const p of detailed.slice(0, maxPromos)) {
      const lower = p.name.toLowerCase();
      if (proteinKw.some(kw => lower.includes(kw))) {
        categories['PROTEINS (meat, fish, eggs, tofu)'].push(p);
      } else if (dairyKw.some(kw => lower.includes(kw))) {
        categories['DAIRY (milk, cheese, yogurt, butter)'].push(p);
      } else if (grainKw.some(kw => lower.includes(kw))) {
        categories['GRAINS & STAPLES (bread, rice, pasta, oats, cereal)'].push(p);
      } else if (produceKw.some(kw => lower.includes(kw))) {
        categories['FRUITS & VEGETABLES'].push(p);
      } else {
        categories['OTHER FOOD'].push(p);
      }
    }

    const lines: string[] = [];
    for (const [cat, items] of Object.entries(categories)) {
      if (items.length === 0) continue;
      lines.push(`\n  ### ${cat}`);
      for (const p of items) {
        const priceStr = p.originalPrice ? `${p.price.toFixed(2)}\u20ac (was ${p.originalPrice.toFixed(2)}\u20ac)` : `${p.price.toFixed(2)}\u20ac`;
        const storeName = (p.store || 'unknown').charAt(0).toUpperCase() + (p.store || 'unknown').slice(1);
        lines.push(`  - ${p.name} @ ${storeName}: ${priceStr}`);
      }
    }
    promotions = lines.join('\n');
  } else if (req.promotionItems.length > 0) {
    promotions = req.promotionItems.slice(0, maxPromos).join(', ');
  }

  const dates: string[] = [];
  const start = new Date(req.startDate);
  for (let i = 0; i < req.days; i++) {
    const d = new Date(start); d.setDate(start.getDate() + i);
    dates.push(d.toISOString().split('T')[0]);
  }

  const membersWithRestrictions = req.members.filter(m => m.allergies.length > 0 || m.dislikes.length > 0);
  const hasRestrictedMembers = membersWithRestrictions.length > 0;

  const proteinMap: Record<string, string> = {
    chicken: 'chicken', fish: 'fish/salmon/cod', beef: 'beef',
    turkey: 'turkey', pork: 'pork',
    vegetarian: 'vegetarian dishes (tofu, legumes, mushroom dishes)',
  };
  const prefs = req.proteinPreferences || ['chicken', 'fish', 'beef'];
  const allowedProteins = prefs.map(p => proteinMap[p] || p).join(', ');
  const disallowedProteins = Object.entries(proteinMap).filter(([key]) => !prefs.includes(key)).map(([, val]) => val).join(', ');

  const proteinRules = `## Protein preferences\nALLOWED: ${allowedProteins}\n${disallowedProteins ? 'NOT ALLOWED (except for alternatives for restricted members): ' + disallowedProteins : ''}`;

  let customPrefs = '';
  if (req.preferences && req.preferences.trim().length > 0) {
    customPrefs = `\n## \u26a0\ufe0f MANDATORY USER PREFERENCES (YOU MUST OBEY THESE \u2014 VIOLATION = FAILURE)\nThe user has explicitly stated the following preferences. These are ABSOLUTE RULES that override everything else except allergies:\n"${req.preferences}"\n\nINTERPRETATION RULES:\n- If user says "no meat" / "nereikia m\u0117sos" / "be m\u0117sos" \u2192 ZERO meat in ANY variant. No chicken, no pork, no beef, no turkey, no any animal meat.\n- If user says "no fish" \u2192 ZERO fish/seafood in any variant.\n- If user says "no dairy" \u2192 ZERO dairy products.\n- If user excludes something, it must NOT appear in ANY variant, not even as a minor ingredient.\n- Negative preferences ("no X", "nereikia X", "be X") are HARD BANS. Treat them like allergies.\n- Positive preferences ("more vegetables", "daugiau dar\u017eovi\u0173") should be followed as much as possible.\n`;
  }

  const goalMembers = req.members.filter(m => m.fitnessGoal && m.fitnessGoal !== 'maintain');
  let fitnessContext = '';
  if (goalMembers.length > 0) {
    fitnessContext = `\n## FITNESS GOALS\n`;
    for (const m of goalMembers) {
      if (m.fitnessGoal === 'lose_weight') {
        fitnessContext += `- ${m.name} is LOSING WEIGHT: meals should be high-protein, moderate-low carb, use lean proteins and vegetables. Avoid heavy/calorie-dense sides.\n`;
      } else if (m.fitnessGoal === 'gain_muscle') {
        fitnessContext += `- ${m.name} is BUILDING MUSCLE: meals should be high-protein with sufficient carbs for energy. Include protein-rich foods in every meal.\n`;
      }
    }
  }

  let budgetRules = '';
  if (req.dailyBudgetEur && req.dailyBudgetEur > 0) {
    budgetRules = `\n## BUDGET CONSTRAINT\nDaily food budget per person: ~${req.dailyBudgetEur.toFixed(2)} EUR.\nPrefer cheaper ingredients and promotion items to stay within budget. Costs are calculated automatically.\n`;
  }

  let promotionRules = '';
  if (promotions) {
    promotionRules = `\n## \u26a0\ufe0f PROMOTIONS \u2014 PRIMARY INGREDIENT SOURCE (MOST IMPORTANT!)\nThe following products are currently ON SALE at Lithuanian supermarkets. SAVE MONEY by using sale items.\n\nCURRENT PROMOTIONS:\n${promotions}\n\nPROMOTION RULES (MANDATORY):\n1. Build meals AROUND these sale items — they are the PRIMARY ingredient source.\n2. EVERY meal should include AT LEAST 1 promotion item as a key ingredient.\n3. If a promotion PROTEIN is available (e.g. chicken on sale), build the meal around it.\n4. If a promotion VEGETABLE/DAIRY is available, incorporate it into the recipe.\n5. AT LEAST one of the 3 variants per meal MUST heavily feature a promotion item.\n6. A meal plan that ignores available promotions is a FAILED plan.\n7. Use ingredient names matching the promotion items so the system can detect them automatically.\n`;
  }

  let restrictionRules = '';
  if (hasRestrictedMembers) {
    restrictionRules = `\n## \u26a0\ufe0f CRITICAL: MEMBER RESTRICTIONS AND ALTERNATIVES\nThe following members have dietary restrictions. For EACH variant, you MUST provide a separate "memberVariants" entry for EACH restricted member listed below.\n\n### Members with restrictions:\n`;
    for (const m of membersWithRestrictions) {
      const restrictions: string[] = [];
      if (m.allergies.length > 0) restrictions.push(`ALLERGIES (HARD BAN): ${m.allergies.join(', ')}`);
      if (m.dislikes.length > 0) restrictions.push(`DISLIKES (HARD BAN \u2014 treat same as allergies!): ${m.dislikes.join(', ')}`);
      const macros = calculateMacros(m);
      restrictionRules += `- **${m.name}** (ID:"${m.id}"): ${restrictions.join('; ')}. Target: ${macros.calories}kcal, ${macros.proteinG}g protein/day.\n`;
    }
    restrictionRules += `\n### RULES FOR ALTERNATIVES (MANDATORY \u2014 FAILURE TO FOLLOW = FAILED PLAN):\n\n**RULE 1: ONE ENTRY PER RESTRICTED MEMBER**\nThe "memberVariants" array must contain EXACTLY ${membersWithRestrictions.length} entries \u2014 one for EACH restricted member listed above.\n${membersWithRestrictions.map(m => `  - One entry with memberId:"${m.id}", memberName:"${m.name}"`).join('\n')}\n\n**RULE 2: DISLIKES = ALLERGIES (ZERO TOLERANCE)**\nDislikes are HARD BANS, not suggestions. If a member dislikes "beans/pup\u0117li\u0173", their alternative MUST NOT contain beans, lentils, chickpeas or any legume in that category. If a member dislikes "eggs/kiau\u0161ini\u0173", their alternative MUST NOT contain eggs in any form.\n\n**RULE 3: MINIMAL SWAP (KEEP THE SAME BASE)**\nThe alternative must share the same side dishes, vegetables, sauces, and garnish as the main meal. ONLY replace the problematic ingredient.\n- Main: "Chicken breast with rice and salad" \u2192 Vegan: "Tofu steak with rice and salad" (same rice + salad!)\n- Main: "Beef stew with potatoes" \u2192 Vegetarian: "Mushroom stew with potatoes" (same potatoes!)\n- Main: "Salmon with buckwheat" \u2192 Vegan: "Grilled tofu with buckwheat" (same buckwheat!)\n- WRONG: "Chicken with rice" \u2192 "Lentil soup" \u274c (completely different dish!)\n\n**RULE 4: IF MAIN MEAL IS ALREADY SAFE**\nIf the main meal already fits the restricted member (e.g. oatmeal with fruit for a vegetarian), provide the SAME dish as the alternative \u2014 just confirm it's safe. The name should be identical.\n\n**RULE 5: MATCH MEMBER'S MACROS**\nEach alternative should target that specific member's calorie and protein goals, NOT the admin's.\n`;
  }

  // Build memberVariants examples dynamically for ALL restricted members
  let memberVariantsExStr1 = '';
  let memberVariantsExStr2 = '';
  let memberVariantsExStr3 = '';
  
  if (hasRestrictedMembers) {
    const mvEntries1 = membersWithRestrictions.map(m => {
      const macros = calculateMacros(m);
      const bCal = Math.round(macros.calories * 0.25);
      const bProt = Math.round(macros.proteinG * 0.25);
      return `{"memberId":"${m.id}","memberName":"${m.name}","name":"Tofu košė su uogomis","calories":${bCal},"protein":${bProt},"carbs":65,"fat":14,"ingredients":["80g avižinių dribsnių","100g tofu","100g uogų"]}`;
    });
    memberVariantsExStr1 = `,"memberVariants":[${mvEntries1.join(',')}]`;

    const mvEntries2 = membersWithRestrictions.map(m => {
      const macros = calculateMacros(m);
      const bCal = Math.round(macros.calories * 0.25);
      const bProt = Math.round(macros.proteinG * 0.25);
      return `{"memberId":"${m.id}","memberName":"${m.name}","name":"Halloumi su daržovėmis","calories":${bCal},"protein":${bProt},"carbs":20,"fat":30,"ingredients":["100g halloumi sūrio","50g paprikos","30g sūrio"]}`;
    });
    memberVariantsExStr2 = `,"memberVariants":[${mvEntries2.join(',')}]`;

    const mvEntries3 = membersWithRestrictions.map(m => {
      const macros = calculateMacros(m);
      const bCal = Math.round(macros.calories * 0.25);
      const bProt = Math.round(macros.proteinG * 0.25);
      return `{"memberId":"${m.id}","memberName":"${m.name}","name":"Avokado sumuštinis su humusu","calories":${bCal},"protein":${bProt},"carbs":55,"fat":16,"ingredients":["2 riekelės duonos","80g humuso","pusė avokado"]}`;
    });
    memberVariantsExStr3 = `,"memberVariants":[${mvEntries3.join(',')}]`;
  }

  let calRulesStr = '';
  if (snackCount === 0) { calRulesStr = `1. breakfast=~25%, lunch=~40%, dinner=~35% of daily calories`; }
  else if (snackCount === 1) { calRulesStr = `1. breakfast=~25%, lunch=~35%, dinner=~30%, snack1=~10% of daily calories`; }
  else if (snackCount === 2) { calRulesStr = `1. breakfast=~20%, lunch=~30%, dinner=~30%, snack1=~10%, snack2=~10% of daily calories`; }
  else { calRulesStr = `1. breakfast=~20%, lunch=~27%, dinner=~27%, snack1=~8%, snack2=~8%, snack3=~10% of daily calories`; }

  return `# Meal plan: ${req.days} days, ${vc} VARIANTS per meal\n\n## LANGUAGE: LITHUANIAN (output values only, NOT JSON keys)\nAll "name" field values AND all strings inside "ingredients" arrays MUST be in LITHUANIAN.\nJSON keys ("name","calories","protein","carbs","fat","ingredients","memberVariants","memberId","memberName","slots","date","mealType","variants") MUST STAY ENGLISH.\n"mealType" enum MUST STAY ENGLISH ("breakfast","lunch","dinner","snack1","snack2","snack3").\nUse Lithuanian genitive case for quantities:\n  - "120g vištienos krūtinėlės" (NOT "vištienos krūtinėlė")\n  - "200ml pieno" (NOT "pienas")\n  - "80g avižinių dribsnių", "3 kiaušiniai", "1 bananas"\n\n## Members\n${memberInfo}\n\n## MAIN RULE: ${vc} VARIANTS!\nFor each day, for each MEAL TYPE (${mealTypes.join(', ')}) generate EXACTLY ${vc} DIFFERENT variants.\nAdmin will choose which variant the whole family eats.\nEach variant must be a COMPLETE meal matching the calorie target.\nVariants must be DIFFERENT (not the same dish with minor changes).\n\n## ⚠️ CALORIE RULES (STRICT — MAX ±5% DEVIATION)\n${calRulesStr}\n2. The SUM of all meal calories for a day MUST be within ±5% of the member's daily target. Example: target 3352kcal → acceptable range 3184-3520kcal.\n3. Each individual meal's calories MUST be within ±10% of its target. Do NOT create meals with wildly different calories than specified.\n4. If a variant exceeds the target, REDUCE portion sizes. If below, ADD more ingredients.\n\n## ⚠️ PROTEIN RULES (STRICT — PROTEIN IS PRIORITY)\nEach member has a specific daily protein target listed above. PROTEIN IS THE #1 MACRO PRIORITY.\n1. Each meal MUST hit its per-meal protein target (listed above as "gP"). Tolerance: ±10%.\n2. Every main meal (breakfast, lunch, dinner) MUST contain a significant protein source (meat, fish, eggs, dairy, legumes).\n3. Prefer high-protein ingredients: chicken breast, turkey, fish, eggs, cottage cheese, Greek yogurt, tofu.\n4. Do NOT fill calories with empty carbs (plain rice, bread, pasta without protein). Always pair carbs with protein.\n5. Daily macro split should match the member's targets. Do not over-allocate carbs or fat at the expense of protein.\n\n${proteinRules}${customPrefs}${fitnessContext}${budgetRules}${promotionRules}${restrictionRules}\n\n${hasRecipePool ? `## ⚠️ RECIPE POOL — PRIMARY SOURCE (MANDATORY)\nThe following recipes were fetched from Spoonacular API. You MUST select and arrange meals from this pool.\nFor each meal slot, pick the ${vc} BEST recipes from the appropriate category (breakfast/main/snack) considering:\n1. Match with INVENTORY items (prefer recipes using ingredients the user already has)\n2. Match with PROMOTION items (prefer recipes using on-sale ingredients)\n3. Calorie/macro targets for each member\n4. Variety across the week (don't repeat the same recipe)\n\nYou may adapt recipe names/portions but the core recipe must come from this pool.\nOnly create NEW recipes if the pool doesn't have enough options for a specific meal type.\nIMPORTANT: translate Spoonacular recipe names and ingredients INTO LITHUANIAN when placing them into the output JSON.\n\n${recipeList}` : (recipeList ? '## Recipe inspiration\n' + recipeList : '')}\n\n## Fridge contents\n${inventory}\n\n## Dates: ${dates.join(', ')}\n\n## Meal quality\n- COMPLETE meal (protein + side + vegetables)\n- Names AND ingredients in Lithuanian (genitive case for quantities)\n- DIFFERENT variants\n- Include specific quantities: "120g vištienos krūtinėlės", "200g ryžių", "100g brokolių", "3 kiaušiniai", "200ml pieno"\n- ⚠️ CRITICAL: ingredient quantities MUST add up to the stated calories! System recalculates macros from ingredients — if you claim 1100kcal but list ingredients totaling 500kcal, the real value (500) will be used. Scale portions UP to match the calorie target (e.g., 300g chicken instead of 120g for a high-calorie high-protein meal).\n\n## JSON format (ONLY JSON!):\n{"slots":[{"date":"2026-03-02","mealType":"breakfast","variants":[{"name":"Avižinė košė su bananu ir medumi","calories":550,"protein":18,"carbs":75,"fat":15,"ingredients":["80g avižinių dribsnių","1 bananas","200ml pieno","15g medaus"]${memberVariantsExStr1}},{"name":"Daržovių omletas su sūriu","calories":520,"protein":28,"carbs":15,"fat":35,"ingredients":["3 kiaušiniai","50g paprikos","30g sūrio"]${memberVariantsExStr2}},{"name":"Varškės dubenėlis su vaisiais","calories":480,"protein":25,"carbs":45,"fat":18,"ingredients":["200g varškės","1 obuolys","30g granolos","15g medaus"]${memberVariantsExStr3}}]}]}\n\nSlots count: EXACTLY ${req.days * mealsCount} (${req.days} days x ${mealsCount} meal types).\nEach slot MUST have EXACTLY ${vc} variants.\nDo NOT include estimatedCostEur or ingredientCosts — costs will be calculated automatically.\n${hasRestrictedMembers ? `\nCRITICAL: "memberVariants" MUST contain EXACTLY ${membersWithRestrictions.length} entries per variant \u2014 one for EACH restricted member. Dislikes are HARD BANS (same as allergies). Alternatives must be MINIMAL SWAPS of the main dish \u2014 keep the same side dishes, ONLY replace the problematic ingredient.` : ''}`;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    });
  }

  try {
    const body: GenerateRequest = await req.json();
    if (!body.members || body.members.length === 0) {
      return new Response(JSON.stringify({ error: 'No family members found' }), {
        status: 400, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    const restrictedMembers = body.members.filter(m => m.allergies.length > 0 || m.dislikes.length > 0);
    console.log(`Generating plan for ${body.members.length} members (${restrictedMembers.length} with restrictions), ${body.days} days${body.dailyBudgetEur ? `, budget: ${body.dailyBudgetEur} EUR/day` : ''}`);
    console.log(`Promotions: ${body.promotionItems?.length || 0} items (detailed: ${body.promotionItemsDetailed?.length || 0})`);
    if (body.preferences) {
      console.log(`User preferences: "${body.preferences}"`);
    }
    
    // Patikriname, kad bent vienas AI provideris būtų prieinamas
    const activeProviders = PROVIDERS.filter(p => p.available);
    if (activeProviders.length === 0) {
      return new Response(JSON.stringify({
        error: 'Nėra sukonfigūruoto AI provider\'io. Reikia bent vieno iš: GEMINI_API_KEY, GROQ_API_KEY, CEREBRAS_API_KEY.',
      }), {
        status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }
    console.log(`🔗 Active providers (in order): ${activeProviders.map(p => p.name).join(' → ')}`);

    const spoonRecipes = SPOONACULAR_KEY ? await searchRecipes(body.inventoryItems) : [];
    console.log(`Found ${spoonRecipes.length} Spoonacular recipes`);

    // ── Theoretical output token need (per-provider, variantCount gali skirtis) ──
    // Kiekvienas variantas su pilnais ingredientais (name + calories + protein + carbs + fat
    // + 4-6 ingredients su kiekiais) užima realiai ~180-250 tokenų JSON format'e.
    const reqSnackCount = Math.min(3, Math.max(0, body.snackCount || 0));
    const mealsCountForBudget = 3 + reqSnackCount;
    const tokensPerVariant = restrictedMembers.length > 0 ? 300 : 220;

    // Default variantų kiekis: 3 - sumažinta nuo 5, nes 7d*3meals*5variants = 105 variantų
    // generuoja per didelį JSON response kuris nutrūksta dėl max_tokens limito.
    const DEFAULT_VARIANT_COUNT = 3;

    const systemMsg = (vc: number) => `You are a professional nutritionist and budget-smart meal planner for Lithuania. Your PRIMARY GOAL is to create nutritious, varied meals that USE PROMOTION ITEMS whenever possible. Generate ${vc} DIFFERENT meal variants per meal type per day. ALL "name" fields and ALL strings inside "ingredients" arrays MUST BE WRITTEN IN LITHUANIAN with specific quantities in genitive case (e.g. "120g vištienos krūtinėlės", "200g ryžių", "50g špinatų", "3 kiaušiniai", "200ml pieno"). JSON keys and "mealType" enum values MUST stay ENGLISH.\n\nFOCUS ON:\n1. Building meals AROUND promotion items provided in the user prompt\n2. Meeting each member's calorie and protein targets\n3. Creating diverse, complete meals (protein + side + vegetables)\n4. Respecting allergies, dislikes, and fitness goals\n\nDo NOT calculate costs — costs are handled automatically. Just provide: name, calories, protein, carbs, fat, ingredients (with quantities).\n\nCRITICAL RULES FOR MEMBER ALTERNATIVES:\n1. "memberVariants" must have EXACTLY one entry per restricted member.\n2. DISLIKES are HARD BANS — treat them EXACTLY like allergies.\n3. Alternatives must be MINIMAL SWAPS: keep the SAME side dishes, ONLY swap the problematic ingredient.\n4. If the main meal already fits a restricted member, their alternative should be THE SAME dish.\n\nReturn ONLY JSON with "slots" array.`;

    // ── Multi-provider failover loop ──
    // Bandome kiekvieną provider'į iš eilės. Kiekvienam:
    //   1) Build'inam prompt'ą pagal to provider'io TPM biudžetą
    //   2) Jei reikia - šrink'iname (mažesnis budget'as → mažiau receptų/promos)
    //   3) Bandome kvietimą
    //   4) Jei 413/429/503/timeout/empty - pereiname į sekantį provider'į
    let finalContent: string | null = null;
    let finalProviderName = '';
    let lastError: { status: number; text: string; provider: string } | null = null;
    let finalPromptLength = 0;
    let finalVariantCount = DEFAULT_VARIANT_COUNT;

    for (const provider of activeProviders) {
      // Per-provider variant count: Groq (mažas TPM) - degrade'iname iki 3
      let providerVariantCount = DEFAULT_VARIANT_COUNT;
      if (provider.tpmBudget < 50000) {
        providerVariantCount = 3; // Groq: 12K TPM per mažas 5 variantams
      }

      const totalVariants = body.days * mealsCountForBudget * providerVariantCount;
      const theoreticalNeed = totalVariants * tokensPerVariant + 1000;

      // Per-provider prompt sizing
      let currentMaxRecipes = MAX_RECIPES_IN_PROMPT;
      let currentMaxPromos = MAX_PROMOTIONS_IN_PROMPT;
      let prompt = buildPrompt(body, spoonRecipes, {
        maxRecipes: currentMaxRecipes,
        maxPromos: currentMaxPromos,
        variantCount: providerVariantCount,
      });
      let promptTok = estimatePromptTokens(prompt);
      let availableForOutput = provider.tpmBudget - promptTok - GROQ_OVERHEAD_TOKENS;

      // Jei provider'io biudžetas per mažas - šrink'iname (Gemini'ui beveik niekada neprisireiks)
      while (availableForOutput < 2500 && (currentMaxRecipes > 4 || currentMaxPromos > 5)) {
        currentMaxRecipes = Math.max(4, currentMaxRecipes - 3);
        currentMaxPromos = Math.max(5, currentMaxPromos - 3);
        prompt = buildPrompt(body, spoonRecipes, {
          maxRecipes: currentMaxRecipes,
          maxPromos: currentMaxPromos,
          variantCount: providerVariantCount,
        });
        promptTok = estimatePromptTokens(prompt);
        availableForOutput = provider.tpmBudget - promptTok - GROQ_OVERHEAD_TOKENS;
      }

      // Hard cut kaip kritinis fallback'as
      if (prompt.length > MAX_PROMPT_CHARS && provider.tpmBudget < 50000) {
        console.warn(`Prompt ${prompt.length}ch > ${MAX_PROMPT_CHARS}, hard truncating for ${provider.name}`);
        prompt = prompt.slice(0, MAX_PROMPT_CHARS) + '\n[truncated]';
        promptTok = estimatePromptTokens(prompt);
        availableForOutput = provider.tpmBudget - promptTok - GROQ_OVERHEAD_TOKENS;
      }

      // Per-provider output token calculation:
      // - High budget (Cerebras 60K, Gemini 240K): naudojame pilną outputCap.
      // - Low budget (Groq 12K): naudojame min(outputCap, available, theoreticalNeed).
      const isHighBudgetProvider = provider.tpmBudget >= 50000;
      const outputTokens = isHighBudgetProvider
        ? Math.min(provider.outputCap, availableForOutput)
        : Math.max(2000, Math.min(provider.outputCap, availableForOutput, theoreticalNeed));
      console.log(`🎯 Trying ${provider.name}: prompt=${prompt.length}ch (~${promptTok}tok), output=${outputTokens}tok, budget=${provider.tpmBudget} cap=${provider.outputCap} variants=${providerVariantCount} (recipes=${currentMaxRecipes}, promos=${currentMaxPromos})`);

      finalPromptLength = prompt.length;

      try {
        const res = await provider.call(prompt, systemMsg(providerVariantCount), outputTokens);

        if (!res.ok) {
          const errText = await res.text();
          lastError = { status: res.status, text: errText, provider: provider.name };
          console.warn(`⚠️ ${provider.name} returned ${res.status}: ${errText.slice(0, 180)}`);
          continue; // switch'inam į sekantį provider'į
        }

        const data = await res.json();
        const truncated = wasContentTruncated(provider.name, data);
        const content = extractContent(provider.name, data);
        if (!content) {
          lastError = { status: 0, text: 'empty content', provider: provider.name };
          console.warn(`⚠️ ${provider.name} returned empty content, trying next`);
          continue;
        }

        if (truncated) {
          console.warn(`⚠️ ${provider.name} response truncated (${content.length} chars), will attempt recovery`);
        }

        finalContent = content;
        finalProviderName = provider.name;
        finalVariantCount = providerVariantCount;
        console.log(`✅ ${truncated ? 'Truncated' : 'Success'} via ${provider.name} (content ${content.length} chars, ${providerVariantCount} variants)`);
        break; // exit'inam provider loop'ą - recovery bus žemiau
      } catch (e: any) {
        const errMsg = e?.name === 'AbortError' ? 'timeout' : (e?.message || 'unknown');
        lastError = { status: 0, text: errMsg, provider: provider.name };
        console.warn(`⚠️ ${provider.name} threw: ${errMsg}, trying next`);
        continue;
      }
    }

    if (!finalContent) {
      const statusCode = lastError?.status || 0;
      const cleanDetails = lastError?.text || 'Visi provideriai nepasiekiami';
      console.error(`❌ All ${activeProviders.length} providers failed. Last: ${lastError?.provider} (${statusCode})`);
      return new Response(JSON.stringify({
        error: `AI klaida (${statusCode || 'all providers failed'})`,
        details: cleanDetails,
        lastProvider: lastError?.provider || 'none',
        triedProviders: activeProviders.map(p => p.name),
        promptLength: finalPromptLength,
        recipeCount: body.spoonacularRecipes?.length || 0,
        promoCount: body.promotionItemsDetailed?.length || 0,
      }), {
        status: 502, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    const textContent = finalContent;

    let parsed;
    try {
      parsed = JSON.parse(textContent);
    } catch {
      try {
        // Try extracting from markdown code block
        const m = textContent.match(/```(?:json)?\s*\n?([\s\S]*?)\n?\s*```/);
        parsed = m ? JSON.parse(m[1]) : JSON.parse(textContent.trim());
      } catch (parseError) {
        // Truncated JSON recovery: bandome surinkti kiek galima slot'ų
        console.warn(`JSON parse failed, attempting truncated recovery (${textContent.length} chars)...`);
        let recovered = false;
        let raw = textContent.trim();
        // Pašalinam markdown code block jei yra
        const mdMatch = raw.match(/```(?:json)?\s*\n?([\s\S]*)/);
        if (mdMatch) raw = mdMatch[1];

        // Greitas recovery: ieškome paskutinio slot boundary pattern'o
        // Slot baigiasi su: ...}]\n    },  arba  ...}]\n    }
        // Bandome max 10 kandidatų (greitai, ne brute-force)
        const slotsStart = raw.indexOf('"slots"');
        if (slotsStart !== -1) {
          // Ieškome visų "variants" masyvo uždarymų - tai slot boundary
          const closingPattern = /\}\s*\]\s*\}/g;
          const boundaries: number[] = [];
          let match;
          while ((match = closingPattern.exec(raw)) !== null) {
            boundaries.push(match.index + match[0].length);
          }
          // Bandome nuo paskutinio boundary atgal
          for (let i = boundaries.length - 1; i >= 0 && !recovered; i--) {
            const candidate = raw.substring(0, boundaries[i]) + ']}';
            try {
              const test = JSON.parse(candidate);
              if (test?.slots?.length > 0) {
                parsed = test;
                recovered = true;
                console.log(`Recovered ${test.slots.length} slots from truncated JSON`);
              }
            } catch { /* try earlier boundary */ }
          }
        }

        if (!recovered) {
          console.error(`Failed to parse ${finalProviderName} response (${textContent.length} chars):`, textContent.substring(0, 300));
          console.error(`Last 300 chars:`, textContent.substring(Math.max(0, textContent.length - 300)));
          return new Response(JSON.stringify({
            error: 'AI grąžino neteisingą formatą. Bandykite dar kartą.',
            provider: finalProviderName,
            contentLength: textContent.length,
            debugStart: textContent.substring(0, 200),
            debugEnd: textContent.substring(Math.max(0, textContent.length - 200)),
            parseError: String(parseError),
          }), {
            status: 502, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
          });
        }
      }
    }

    const slots = parsed?.slots;
    if (!slots || !Array.isArray(slots) || slots.length === 0) {
      console.error('AI returned empty or missing slots:', JSON.stringify(parsed).substring(0, 500));
      return new Response(JSON.stringify({
        error: 'AI nesugeneravo jokių patiekalų. Bandykite dar kartą.',
      }), {
        status: 502, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }
    console.log(`AI generated ${slots.length} slots.`);

    // ── Output validation & repair ──
    const snackCount = Math.min(3, Math.max(0, body.snackCount || 0));
    const expectedMealsPerDay = 3 + snackCount;
    const mealTypesExpected = ['breakfast', 'lunch', 'dinner'];
    for (let i = 1; i <= snackCount; i++) mealTypesExpected.push(`snack${i}`);
    const expectedDates: string[] = [];
    const startDateParsed = new Date(body.startDate);
    for (let i = 0; i < body.days; i++) {
      const d = new Date(startDateParsed); d.setDate(startDateParsed.getDate() + i);
      expectedDates.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`);
    }

    const validationResult = validateAndRepairSlots(
      slots,
      body.days * expectedMealsPerDay,
      mealTypesExpected,
      expectedDates,
      restrictedMembers.map(m => m.id),
      restrictedMembers.map(m => ({ id: m.id, name: m.name, allergies: m.allergies, dislikes: m.dislikes })),
      finalVariantCount
    );

    if (validationResult.repaired) {
      console.warn(`⚠️ AI output was repaired:`);
      for (const w of validationResult.warnings) {
        console.warn(`  - ${w}`);
      }
    }
    console.log(`Validation: ${validationResult.slotsMissing} slots filled, ${validationResult.variantsMissing} variants cloned, ${validationResult.memberVariantsMissing} memberVariants added, ${validationResult.calorieOutliers} calorie outliers clamped, ${validationResult.ingredientsWithoutQty} ingredients without qty`);

    // ── Ingredient-based nutrition recompute ──
    // LLM target distribution'as (breakfast=30%, lunch=35%, dinner=35% of daily
    // target_kcal) generuoja kalorijas pagal user'io target'ą, ne pagal realius
    // listed ingredientus. Pvz. „Vištienos kepsnys + 150g bulvių + 100g cukinijos +
    // 20g sviesto" gauna 1173 kcal, nors realybėje ~540 kcal. Čia perskaičiuojam
    // iš listed ingredientų pagal USDA per-100g nutrition table'es, kad DB iš
    // karto turėtų tikslias vertes (be client-side workaround'o). Threshold'ai
    // (coverage >= 0.6, kcal >= 50) apsaugo nuo edge case'ų, kai parser'is
    // neatpažino ingredientų - tada paliekame LLM output'ą.
    const nutritionStats = normalizeSlotsNutrition(slots);
    const recomputeRate = nutritionStats.variantsTotal > 0
      ? Math.round((nutritionStats.variantsRewritten / nutritionStats.variantsTotal) * 100)
      : 0;
    console.log(`Nutrition recompute: ${nutritionStats.variantsRewritten}/${nutritionStats.variantsTotal} variants rewritten from ingredients (${recomputeRate}%), ${nutritionStats.memberVariantsRewritten}/${nutritionStats.memberVariantsTotal} member-variants, ${nutritionStats.skippedLowCoverage} skipped (low coverage)`);

    // Post-process: build ingredientCosts with real prices and promotion matching
    const promoMatchResult = enrichSlotsWithCosts(slots, body.promotionItemsDetailed || []);
    const matchRate = promoMatchResult.total > 0 ? Math.round((promoMatchResult.matched / promoMatchResult.total) * 100) : 0;
    console.log(`Cost enrichment: ${promoMatchResult.matched}/${promoMatchResult.total} ingredients matched to promotions (${matchRate}%)`);
    if (matchRate < 25 && (body.promotionItemsDetailed?.length || 0) > 0) {
      console.warn(`⚠️ Low promo match rate (${matchRate}%). AI may not be using promotion ingredient names.`);
    }

    // ── Post-generation calorie & budget validation ──
    const primaryMember = body.members?.[0];
    if (primaryMember) {
      const dailyTarget = primaryMember.dailyCalorieTarget || 2000;
      // Check per-day calorie totals (using first variant of each slot)
      for (const date of expectedDates) {
        const daySlots = slots.filter((s: any) => s.date === date);
        const dayCalories = daySlots.reduce((sum: number, s: any) => {
          const v = s.variants?.[0];
          return sum + (v?.calories || 0);
        }, 0);
        const deviation = Math.abs(dayCalories - dailyTarget) / dailyTarget;
        if (deviation > 0.20) {
          console.warn(`⚠️ Day ${date}: ${dayCalories} kcal vs target ${dailyTarget} kcal (${Math.round(deviation * 100)}% off)`);
        }
      }
      // Budget check
      if (body.dailyBudgetEur) {
        const totalPlanCost = slots.reduce((sum: number, s: any) => {
          const v = s.variants?.[0];
          return sum + (v?.estimatedCostEur || 0);
        }, 0);
        const budgetForPlan = body.dailyBudgetEur * body.days;
        if (totalPlanCost > budgetForPlan * 1.15) {
          console.warn(`⚠️ Plan cost ${totalPlanCost.toFixed(2)}€ exceeds budget ${budgetForPlan.toFixed(2)}€ by ${Math.round(((totalPlanCost / budgetForPlan) - 1) * 100)}%`);
        }
      }
    }

    console.log('Translating names via Google Translate...');

    const namesToTranslate: string[] = [];
    const nameIndexMap: { slotIdx: number; variantIdx: number; isMemberVariant: boolean; mvIdx: number }[] = [];

    for (let si = 0; si < slots.length; si++) {
      const slot = slots[si];
      if (!slot.variants) continue;
      for (let vi = 0; vi < slot.variants.length; vi++) {
        const v = slot.variants[vi];
        namesToTranslate.push(v.name);
        nameIndexMap.push({ slotIdx: si, variantIdx: vi, isMemberVariant: false, mvIdx: -1 });
        if (v.memberVariants) {
          for (let mi = 0; mi < v.memberVariants.length; mi++) {
            namesToTranslate.push(v.memberVariants[mi].name);
            nameIndexMap.push({ slotIdx: si, variantIdx: vi, isMemberVariant: true, mvIdx: mi });
          }
        }
      }
    }

    console.log(`Translating ${namesToTranslate.length} meal names...`);

    const translatedNames = await translateNamesToLT(namesToTranslate);

    for (let i = 0; i < nameIndexMap.length; i++) {
      const map = nameIndexMap[i];
      const translated = translatedNames[i];
      if (map.isMemberVariant) {
        slots[map.slotIdx].variants[map.variantIdx].memberVariants[map.mvIdx].name = translated;
      } else {
        slots[map.slotIdx].variants[map.variantIdx].name = translated;
      }
    }

    console.log(`Done: ${slots.length} slots, ${translatedNames.length} names translated`);

    const macroTargets = body.members.map(m => {
      const macros = calculateMacros(m);
      return { memberId: m.id, calories: macros.calories, proteinG: macros.proteinG, carbsG: macros.carbsG, fatG: macros.fatG };
    });

    return new Response(
      JSON.stringify({
        slots,
        macroTargets,
        restrictedMembers: restrictedMembers.map(m => ({ id: m.id, name: m.name, allergies: m.allergies, dislikes: m.dislikes })),
        spoonacularRecipesUsed: spoonRecipes.length,
        translatedNames: translatedNames.length,
        aiProvider: finalProviderName,
        variantCount: finalVariantCount,
        matchQuality: {
          promoMatchRate: matchRate,
          promoMatched: promoMatchResult.matched,
          promoTotal: promoMatchResult.total,
          repaired: validationResult.repaired,
          warnings: validationResult.warnings,
          calorieOutliers: validationResult.calorieOutliers,
          ingredientsWithoutQty: validationResult.ingredientsWithoutQty,
          nutritionRecomputeRate: recomputeRate,
          nutritionRecomputed: nutritionStats.variantsRewritten,
          nutritionTotalVariants: nutritionStats.variantsTotal,
        },
      }),
      { headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
    );
  } catch (error) {
    console.error('Error:', error);
    const message = error instanceof Error ? error.message : 'Internal error';
    // Jei klaida kilo iš validateAndRepairSlots (AI modeliai nepasiekiami/grąžino
    // tuščią) - grąžinam 503 Service Unavailable, kad front'as galėtų atskirti
    // nuo tikros 500 bug'o ir pasiūlyti „bandyti vėliau". message prasideda
    // „Visi AI modeliai..." - tai signalas, kad tai laikinas gedimas.
    const isAiOutage = message.includes('AI modeliai');
    return new Response(
      JSON.stringify({ error: message }),
      { status: isAiOutage ? 503 : 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
    );
  }
});
