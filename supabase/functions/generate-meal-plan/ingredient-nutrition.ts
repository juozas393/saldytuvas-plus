/**
 * Ingredient Nutrition Lookup (Edge Function copy)
 *
 * Port'as iš `mobile/src/features/nutrition/utils/ingredient-nutrition.ts`.
 * KEEP IN SYNC - bet kokie pakeitimai turi būti ten ir čia, kitaip
 * server-side recompute'as ir client-side normalizer'is duos skirtingus
 * rezultatus.
 *
 * Vienintelis skirtumas: nėra `mobile/` import'ų ir interface eksportai
 * paliktas tame pačiame faile (Deno bundler'is sukompiliuoja į vieną
 * deployment'ą).
 *
 * Naudojamas `index.ts` po LLM atsakymo - perrašo `slot.variants[].calories/
 * protein/carbs/fat` ingredient-derived reikšmėmis, kad DB iš karto turėtų
 * tikslias vertes (ne LLM target distribution melą - 1173 kcal vakarienei,
 * nepaisant kad recipe'as tik ~540 kcal).
 */

export interface NutritionPer100g {
    kcal: number;
    p: number;
    c: number;
    f: number;
}

export const NUTRITION_PER_100G: Record<string, NutritionPer100g> = {
    // === BALTYMAI ===
    'vištienos krūtin': { kcal: 165, p: 31, c: 0, f: 4 },
    'vištienos šlaun': { kcal: 209, p: 26, c: 0, f: 11 },
    'vištienos sultin': { kcal: 4, p: 1, c: 0, f: 0 },
    'vištien': { kcal: 165, p: 31, c: 0, f: 4 },
    'jautien': { kcal: 250, p: 26, c: 0, f: 17 },
    'kiaulien': { kcal: 242, p: 27, c: 0, f: 14 },
    'kalakut': { kcal: 189, p: 29, c: 0, f: 7 },
    'lašiš': { kcal: 208, p: 20, c: 0, f: 13 },
    'tuno': { kcal: 132, p: 28, c: 0, f: 1 },
    'tunas': { kcal: 132, p: 28, c: 0, f: 1 },
    'žuv': { kcal: 130, p: 22, c: 0, f: 4 },
    'tilapia': { kcal: 96, p: 20, c: 0, f: 2 },
    'krevet': { kcal: 99, p: 24, c: 0, f: 0 },
    'tofu': { kcal: 76, p: 8, c: 2, f: 5 },
    'kiaušin': { kcal: 155, p: 13, c: 1, f: 11 },
    'baltymai': { kcal: 52, p: 11, c: 1, f: 0 },
    'šonin': { kcal: 541, p: 37, c: 1, f: 42 },
    'kumpis': { kcal: 145, p: 21, c: 1, f: 6 },
    'kumpio': { kcal: 145, p: 21, c: 1, f: 6 },
    'dešr': { kcal: 301, p: 12, c: 2, f: 27 },
    'midij': { kcal: 86, p: 12, c: 4, f: 2 },
    'kepsn': { kcal: 250, p: 26, c: 0, f: 17 },

    // === PIENO PRODUKTAI ===
    'plakimo grietinė': { kcal: 340, p: 2, c: 3, f: 36 },
    'riebi grietinė': { kcal: 340, p: 2, c: 3, f: 36 },
    'grietinė': { kcal: 195, p: 2, c: 3, f: 19 },
    'kokosų pien': { kcal: 230, p: 2, c: 6, f: 24 },
    'pien': { kcal: 61, p: 3, c: 5, f: 3 },
    'sviest': { kcal: 717, p: 1, c: 0, f: 81 },
    'majonez': { kcal: 680, p: 1, c: 1, f: 75 },
    'kepamojo sūrio': { kcal: 311, p: 22, c: 1, f: 25 },
    'parmezan': { kcal: 392, p: 36, c: 4, f: 26 },
    'čederi': { kcal: 403, p: 25, c: 1, f: 33 },
    'tepamas sūr': { kcal: 252, p: 6, c: 4, f: 24 },
    'varšk': { kcal: 98, p: 11, c: 3, f: 4 },
    'jogurt': { kcal: 59, p: 10, c: 4, f: 0 },
    'sūr': { kcal: 350, p: 22, c: 3, f: 27 },

    // === ANGLIAVANDENIAI / GRŪDAI ===
    'avižin': { kcal: 389, p: 17, c: 66, f: 7 },
    'avižo': { kcal: 389, p: 17, c: 66, f: 7 },
    'rudieji ryž': { kcal: 370, p: 8, c: 77, f: 3 },
    'ryž': { kcal: 365, p: 7, c: 80, f: 1 },
    'makaron': { kcal: 371, p: 13, c: 75, f: 2 },
    'fetučin': { kcal: 371, p: 13, c: 75, f: 2 },
    'penne': { kcal: 371, p: 13, c: 75, f: 2 },
    'bulv': { kcal: 77, p: 2, c: 17, f: 0 },
    'duon': { kcal: 265, p: 9, c: 49, f: 3 },
    'sub roll': { kcal: 290, p: 10, c: 55, f: 4 },
    'croissant': { kcal: 406, p: 8, c: 46, f: 21 },
    'džiūvėsėl': { kcal: 395, p: 13, c: 72, f: 5 },
    'milt': { kcal: 364, p: 10, c: 76, f: 1 },
    'kepimo milt': { kcal: 53, p: 0, c: 28, f: 0 },
    'cukr': { kcal: 387, p: 0, c: 100, f: 0 },
    'rudasis cukr': { kcal: 380, p: 0, c: 98, f: 0 },
    'med': { kcal: 304, p: 0, c: 82, f: 0 },
    'klevų sirup': { kcal: 260, p: 0, c: 67, f: 0 },
    'agave nect': { kcal: 310, p: 0, c: 76, f: 0 },
    'humuso': { kcal: 166, p: 8, c: 14, f: 10 },
    'humusas': { kcal: 166, p: 8, c: 14, f: 10 },
    'granolos': { kcal: 471, p: 10, c: 64, f: 20 },

    // === DARŽOVĖS ===
    'cukin': { kcal: 17, p: 1, c: 3, f: 0 },
    'brokol': { kcal: 34, p: 3, c: 7, f: 0 },
    'pomidorų past': { kcal: 82, p: 4, c: 19, f: 0 },
    'pomidorų padaž': { kcal: 30, p: 1, c: 6, f: 0 },
    'konservuoti pomidor': { kcal: 24, p: 1, c: 5, f: 0 },
    'pomidor': { kcal: 18, p: 1, c: 4, f: 0 },
    'agurk': { kcal: 16, p: 1, c: 4, f: 0 },
    'paprik': { kcal: 31, p: 1, c: 6, f: 0 },
    'morkos': { kcal: 41, p: 1, c: 10, f: 0 },
    'morkų': { kcal: 41, p: 1, c: 10, f: 0 },
    'morka': { kcal: 41, p: 1, c: 10, f: 0 },
    'svogūn': { kcal: 40, p: 1, c: 9, f: 0 },
    'česnakų milt': { kcal: 331, p: 17, c: 73, f: 1 },
    'česnak': { kcal: 149, p: 6, c: 33, f: 1 },
    'grybai': { kcal: 22, p: 3, c: 3, f: 0 },
    'grybų': { kcal: 22, p: 3, c: 3, f: 0 },
    'salot': { kcal: 15, p: 1, c: 3, f: 0 },
    'rukol': { kcal: 25, p: 3, c: 4, f: 1 },
    'špinat': { kcal: 23, p: 3, c: 4, f: 0 },
    'šparag': { kcal: 20, p: 2, c: 4, f: 0 },
    'pupel': { kcal: 31, p: 2, c: 7, f: 0 },
    'kalend': { kcal: 23, p: 2, c: 4, f: 0 },
    'petražol': { kcal: 36, p: 3, c: 6, f: 1 },
    'bazilik': { kcal: 22, p: 3, c: 3, f: 1 },
    'kukurūz': { kcal: 86, p: 3, c: 19, f: 1 },
    'avokad': { kcal: 160, p: 2, c: 9, f: 15 },
    'laiškinis svogūn': { kcal: 32, p: 2, c: 7, f: 0 },

    // === VAISIAI / UOGOS ===
    'banan': { kcal: 89, p: 1, c: 23, f: 0 },
    'obuol': { kcal: 52, p: 0, c: 14, f: 0 },
    'džiovintų vyšn': { kcal: 333, p: 2, c: 75, f: 1 },
    'vyšn': { kcal: 50, p: 1, c: 12, f: 0 },
    'mėlyn': { kcal: 57, p: 1, c: 14, f: 0 },
    'braškė': { kcal: 32, p: 1, c: 8, f: 0 },
    'braški': { kcal: 32, p: 1, c: 8, f: 0 },
    'avietė': { kcal: 52, p: 1, c: 12, f: 1 },
    'aviet': { kcal: 52, p: 1, c: 12, f: 1 },
    'uogų': { kcal: 50, p: 1, c: 12, f: 0 },
    'uogos': { kcal: 50, p: 1, c: 12, f: 0 },
    'žalioji citrin': { kcal: 30, p: 1, c: 11, f: 0 },
    'citrin': { kcal: 29, p: 1, c: 9, f: 0 },
    'apelsin': { kcal: 47, p: 1, c: 12, f: 0 },

    // === RIEBALAI / ALIEJAI ===
    'alyvuogių aliej': { kcal: 884, p: 0, c: 0, f: 100 },
    'sezamo aliej': { kcal: 884, p: 0, c: 0, f: 100 },
    'kokosų aliej': { kcal: 862, p: 0, c: 0, f: 100 },
    'aliej': { kcal: 884, p: 0, c: 0, f: 100 },

    // === PADAŽAI / PRIESKONIAI ===
    'sojų padaž': { kcal: 53, p: 8, c: 5, f: 0 },
    'diožono garstyči': { kcal: 66, p: 4, c: 5, f: 4 },
    'garstyči': { kcal: 66, p: 4, c: 5, f: 4 },
    'sultin': { kcal: 4, p: 1, c: 0, f: 0 },
    'vyno': { kcal: 83, p: 0, c: 3, f: 0 },
    'vynas': { kcal: 83, p: 0, c: 3, f: 0 },

    // === RIEŠUTAI / SĖKLOS ===
    'migdol': { kcal: 579, p: 21, c: 22, f: 50 },
    'žemės riešut': { kcal: 567, p: 26, c: 16, f: 49 },
    'saulėgrąžų sėkl': { kcal: 584, p: 21, c: 20, f: 51 },
    'linų sėmen': { kcal: 534, p: 18, c: 29, f: 42 },
    'aguono': { kcal: 525, p: 18, c: 28, f: 42 },
    'kokoso': { kcal: 354, p: 3, c: 15, f: 33 },
    'kokosas': { kcal: 354, p: 3, c: 15, f: 33 },

    // === PRIESKONIAI ===
    'cinamon': { kcal: 247, p: 4, c: 81, f: 1 },
    'imbier': { kcal: 80, p: 2, c: 18, f: 1 },
    'ciberžol': { kcal: 354, p: 8, c: 65, f: 10 },
    'muskat': { kcal: 525, p: 6, c: 49, f: 36 },
    'čili dribsn': { kcal: 282, p: 12, c: 50, f: 14 },
    'čili milt': { kcal: 282, p: 12, c: 50, f: 14 },
    'pipirai': { kcal: 251, p: 10, c: 64, f: 3 },
    'pipirų': { kcal: 251, p: 10, c: 64, f: 3 },
    'čiobreli': { kcal: 276, p: 9, c: 64, f: 7 },
    'lauro lap': { kcal: 313, p: 8, c: 75, f: 8 },
    'kario': { kcal: 325, p: 13, c: 56, f: 14 },
    'fenugreek': { kcal: 323, p: 23, c: 58, f: 6 },
    'vanilė': { kcal: 288, p: 0, c: 13, f: 0 },
    'vanilės ekstrakt': { kcal: 288, p: 0, c: 13, f: 0 },
    'druska': { kcal: 0, p: 0, c: 0, f: 0 },
    'šokolad': { kcal: 546, p: 5, c: 61, f: 31 },
};

const COUNT_GRAMS: Record<string, number> = {
    'banan': 120,
    'obuol': 180,
    'kiaušin': 50,
    'pomidor': 120,
    'svogūn': 100,
    'morkos': 60,
    'morka': 60,
    'cukin': 200,
    'česnak': 3,
    'česnako skilt': 3,
    'citrin': 60,
    'žalioji citrin': 50,
    'paprik': 120,
    'bulv': 150,
    'agurk': 200,
    'avokad': 200,
    'croissant': 60,
    'sub roll': 80,
    'krevet': 25,
    'midij': 15,
    'lauro lap': 0.5,
    'lašiš': 170,
    'kepsn': 200,
    'vanilė': 5,
    'riekel': 25,           // 1 riekelė duonos
    'skiltel': 3,           // 1 skiltelė česnako
    'griež': 12,            // 1 griežinėlis
    'porcij': 200,          // 1 porcija (default'as)
};

// „Pagal skonį" / 0-kcal ingredientai - skip'inami compute'ui (nemažina coverage'o).
// LLM kartais išvardija „Druska", „Pipirai", „Žolelės pagal skonį" be kiekių -
// jie nieko reikšmingo nepriduoda kalorijoms, todėl neturi būti laikomi miss'ais.
const SKIP_INGREDIENT_PATTERNS = [
    'pagal skonį', 'pagal skoni', 'to taste',
    'drusk', 'pipir', // visos formos: druska/druskos/pipirų/pipirai/etc.
    'žolelė', 'žolelių',
    'prieskoni', 'prieskonių', 'prieskoniai',
    'žiupsn', // žiupsnis/žiupsniai/žiupsnio - typically be kiekio
    'cukraus pudr',
    'vanduo', 'vandens', 'water',
    'ledo', 'led kub', 'ice',
];

function isSkipIngredient(line: string): boolean {
    const lower = line.toLowerCase();
    // Jei eilutė neturi jokio skaičiaus + jokio g/ml/kg, ji greičiausiai be kiekio
    const hasQty = /\d+\s*(g|kg|ml|l)\b/i.test(line) || /^\d+\s/.test(line.trim());
    if (hasQty) return false;
    return SKIP_INGREDIENT_PATTERNS.some(p => lower.includes(p));
}

const UNIT_TO_GRAMS: Record<string, number> = {
    'v.š.': 15, 'v.š': 15, 'tbs': 15, 'tb': 15, 'tbsp': 15,
    'a.š.': 5, 'a.š': 5, 'tsp': 5,
    'puod.': 240, 'puod': 240, 'cup': 240,
    'skilt.': 3, 'skilt': 3,
    'riek.': 25, 'riek': 25,
    'sk.': 400, 'sk': 400,
    'žiups.': 0.5, 'žiups': 0.5,
    'stick': 113,
    'inch': 6, 'inches': 6,
    'filė': 170,
};

interface ParsedIngredient {
    nameKey: string;
    grams: number;
}

export function parseIngredientLine(line: string): ParsedIngredient | null {
    if (!line) return null;
    const raw = line.trim();
    const lower = raw.toLowerCase();

    let m = lower.match(/^(\d+(?:[.,]\d+)?)\s*g(?:rams)?\s+(.+)$/);
    if (m) return { grams: parseFloat(m[1].replace(',', '.')), nameKey: m[2].trim() };

    m = lower.match(/^(\d+(?:[.,]\d+)?)\s*kg\s+(.+)$/);
    if (m) return { grams: parseFloat(m[1].replace(',', '.')) * 1000, nameKey: m[2].trim() };

    m = lower.match(/^(\d+(?:[.,]\d+)?)\s*ml\s+(.+)$/);
    if (m) return { grams: parseFloat(m[1].replace(',', '.')), nameKey: m[2].trim() };

    m = lower.match(/^(\d+(?:[.,]\d+)?)\s+([\p{L}].+)$/u);
    if (m) {
        const count = parseFloat(m[1].replace(',', '.'));
        const name = m[2].trim();
        const vntMatch = name.match(/^vnt\s+(.+)$/);
        if (vntMatch) {
            const realName = vntMatch[1];
            const unitG = lookupCountGrams(realName);
            if (unitG > 0) return { grams: count * unitG, nameKey: realName };
        }
        const unitG = lookupCountGrams(name);
        if (unitG > 0) return { grams: count * unitG, nameKey: name };

        // Try „QTY UNIT NAME" pattern, pvz. „1 v.š. medaus" arba „0.5 puod ryžių".
        // Split'inam name į first token ir likutį - first token gali būti unit (UNIT_TO_GRAMS).
        const spaceIdx = name.indexOf(' ');
        if (spaceIdx > 0) {
            const firstToken = name.slice(0, spaceIdx).toLowerCase();
            const restName = name.slice(spaceIdx + 1).trim();
            const tokenAsUnit = UNIT_TO_GRAMS[firstToken] ?? UNIT_TO_GRAMS[firstToken + '.'];
            if (tokenAsUnit !== undefined) {
                return { grams: count * tokenAsUnit, nameKey: restName };
            }
        }
        return null;
    }

    m = lower.match(/^(.+?)\s+(\d+(?:[.,]\d+)?)\s*([\p{L}.]+)$/u);
    if (m) {
        const name = m[1].trim();
        const qty = parseFloat(m[2].replace(',', '.'));
        const unit = m[3].toLowerCase();
        if (unit === 'g' || unit === 'grams') return { grams: qty, nameKey: name };
        if (unit === 'kg') return { grams: qty * 1000, nameKey: name };
        if (unit === 'ml') return { grams: qty, nameKey: name };
        if (unit === 'l' || unit === 'litre' || unit === 'liter') return { grams: qty * 1000, nameKey: name };
        const unitG = UNIT_TO_GRAMS[unit];
        if (unitG !== undefined) return { grams: qty * unitG, nameKey: name };
        return null;
    }

    return null;
}

function lookupCountGrams(name: string): number {
    const n = name.toLowerCase();
    const keys = Object.keys(COUNT_GRAMS).sort((a, b) => b.length - a.length);
    for (const k of keys) if (n.includes(k)) return COUNT_GRAMS[k];
    return 0;
}

export function lookupNutritionPer100g(name: string): NutritionPer100g | null {
    const n = name.toLowerCase().trim();
    if (!n) return null;
    const keys = Object.keys(NUTRITION_PER_100G).sort((a, b) => b.length - a.length);
    for (const k of keys) if (n.includes(k)) return NUTRITION_PER_100G[k];
    return null;
}

export interface ComputedNutrition {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    coverage: number;
    matched: number;
    total: number;
}

export function computeNutritionFromIngredients(ingredients: string[]): ComputedNutrition {
    if (!ingredients || ingredients.length === 0) {
        return { calories: 0, protein: 0, carbs: 0, fat: 0, coverage: 0, matched: 0, total: 0 };
    }

    let kcalSum = 0;
    let pSum = 0;
    let cSum = 0;
    let fSum = 0;
    let matched = 0;
    let countableTotal = 0; // Skip'intieji (druska, „pagal skonį") į vardiklį neeina

    for (const line of ingredients) {
        if (isSkipIngredient(line)) continue; // sumažina vardiklį, ne skaitiklį
        countableTotal += 1;
        const parsed = parseIngredientLine(line);
        if (!parsed) continue;
        const nutrition = lookupNutritionPer100g(parsed.nameKey);
        if (!nutrition) continue;
        const factor = parsed.grams / 100;
        kcalSum += nutrition.kcal * factor;
        pSum += nutrition.p * factor;
        cSum += nutrition.c * factor;
        fSum += nutrition.f * factor;
        matched += 1;
    }

    return {
        calories: Math.round(kcalSum),
        protein: Math.round(pSum),
        carbs: Math.round(cSum),
        fat: Math.round(fSum),
        coverage: countableTotal > 0 ? matched / countableTotal : 0,
        matched,
        total: countableTotal,
    };
}

/**
 * Server-side normalizer'is - apvalkstantis kiekvieną slot'o variantą
 * (ir kiekvieno member'io alternatyvą), perrašo calories/protein/carbs/fat
 * jeigu coverage >= 0.6 ir computed >= 50 kcal. Mutuoja parametrą in-place
 * (Edge Fn slots objektas yra build'inamas per JSON.parse, todėl mutacija
 * saugi). Grąžina statistiką log'avimui.
 */
export interface NormalizationStats {
    variantsTotal: number;
    variantsRewritten: number;
    memberVariantsTotal: number;
    memberVariantsRewritten: number;
    skippedLowCoverage: number;
}

const MIN_COVERAGE = 0.6;
const MIN_COMPUTED_KCAL = 50;

export function normalizeSlotsNutrition(slots: any[]): NormalizationStats {
    const stats: NormalizationStats = {
        variantsTotal: 0,
        variantsRewritten: 0,
        memberVariantsTotal: 0,
        memberVariantsRewritten: 0,
        skippedLowCoverage: 0,
    };

    if (!Array.isArray(slots)) return stats;

    for (const slot of slots) {
        if (!Array.isArray(slot?.variants)) continue;

        for (const variant of slot.variants) {
            stats.variantsTotal += 1;
            if (Array.isArray(variant?.ingredients) && variant.ingredients.length > 0) {
                const c = computeNutritionFromIngredients(variant.ingredients);
                if (c.coverage >= MIN_COVERAGE && c.calories >= MIN_COMPUTED_KCAL) {
                    variant.calories = c.calories;
                    variant.protein = c.protein;
                    variant.carbs = c.carbs;
                    variant.fat = c.fat;
                    stats.variantsRewritten += 1;
                } else {
                    stats.skippedLowCoverage += 1;
                }
            }

            if (Array.isArray(variant?.memberVariants)) {
                for (const mv of variant.memberVariants) {
                    stats.memberVariantsTotal += 1;
                    if (Array.isArray(mv?.ingredients) && mv.ingredients.length > 0) {
                        const c = computeNutritionFromIngredients(mv.ingredients);
                        if (c.coverage >= MIN_COVERAGE && c.calories >= MIN_COMPUTED_KCAL) {
                            mv.calories = c.calories;
                            mv.protein = c.protein;
                            mv.carbs = c.carbs;
                            mv.fat = c.fat;
                            stats.memberVariantsRewritten += 1;
                        }
                    }
                }
            }
        }
    }

    return stats;
}
