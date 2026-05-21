/**
 * Hybrid Promotions Runner
 *
 * Combines multiple data sources for maximum coverage:
 * - IKI: direct REST API (iki.lt/wp-json/iki-app/v1/promos)
 * - Norfa: direct HTML scraping (norfa.lt/akciju-puslapiai/)
 * - Rimi: direct HTML scraping with pagination (rimi.lt/e-parduotuve/lt/akcijos)
 * - Maxima + Lidl: akcijos.lt API (no direct API available)
 *
 * No Playwright needed - uses fetch + cheerio only.
 */

import * as cheerio from 'cheerio';
import * as fs from 'fs';
import { AkcijosLtAdapter } from './akcijos-lt/AkcijosLtAdapter.js';

// ─── Shared types & helpers ────────────────────────────────────────────

interface HybridProduct {
    store: string;
    name: string;
    originalPrice: number | null;
    discountPrice: number;
    discountPercent: number | null;
    validFrom: string | null;
    validTo: string | null;
    category: string | null;
    imageUrl: string | null;
    unit: string | null;
    pricePerUnit: string | null;
    description: string | null;
    storeProductId: string | null;
    productUrl: string | null;
    sourceSection: string | null;
    dealType: string | null;
    scrapedAt: string;
}

const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const NOW_ISO = new Date().toISOString();

function calcDiscount(original: number | null, discounted: number): number | null {
    if (!original || original <= 0 || discounted <= 0) return null;
    return Math.round(((original - discounted) / original) * 100);
}

function parsePrice(text: string | undefined | null): number | null {
    if (!text) return null;
    const cleaned = text.replace(/[€EUR\s]/g, '').replace(',', '.').trim();
    const val = parseFloat(cleaned);
    return isNaN(val) || val <= 0 || val > 9999 ? null : val;
}

function formatDate(d: Date | null): string | null {
    if (!d) return null;
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function dedup(products: HybridProduct[]): HybridProduct[] {
    const seen = new Set<string>();
    return products.filter(p => {
        const key = `${p.store}-${p.name}-${p.discountPrice}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });
}

// ─── Unified category system ───────────────────────────────────────────
const CATEGORY_MAP: Record<string, string> = {
    // IKI / Lidl / Maxima (from akcijos.lt)
    'Mėsa ir paukštiena': 'Mėsa ir žuvis',
    'Žuvis ir jūros gėrybės': 'Mėsa ir žuvis',
    'Mėsa ir žuvis': 'Mėsa ir žuvis',
    'Pienas ir pieno gaminiai': 'Pieno produktai',
    'Sūriai': 'Pieno produktai',
    'Jogurtai ir desertai': 'Pieno produktai',
    'Pieno produktai': 'Pieno produktai',
    'Kiaušiniai': 'Pieno produktai',
    'Duonos gaminiai': 'Duona ir konditerija',
    'Bandelės ir pyragaičiai': 'Duona ir konditerija',
    'Konditerija': 'Duona ir konditerija',
    'RIMI konditerija': 'Duona ir konditerija',
    'Miltai ir kepimo produktai': 'Duona ir konditerija',
    'Vaisiai ir uogos': 'Vaisiai ir daržovės',
    'Daržovės': 'Vaisiai ir daržovės',
    'Vaisiai, daržovės': 'Vaisiai ir daržovės',
    'Šaldytos daržovės ir vaisiai': 'Vaisiai ir daržovės',
    'Saldumynai ir užkandžiai': 'Saldumynai ir užkandžiai',
    'Traškučiai ir užkandžiai': 'Saldumynai ir užkandžiai',
    'Saldumynai': 'Saldumynai ir užkandžiai',
    'Ledai': 'Saldumynai ir užkandžiai',
    'Riešutai': 'Saldumynai ir užkandžiai',
    'Kruopos ir makaronai': 'Bakalėja',
    'Padažai ir prieskoniai': 'Bakalėja',
    'Konservai': 'Bakalėja',
    'Aliejus ir riebalai': 'Bakalėja',
    'Pusryčių produktai': 'Bakalėja',
    'Bakalėja': 'Bakalėja',
    'Šaldyti pusgaminiai': 'Šaldytas maistas',
    'Šaldytas maistas': 'Šaldytas maistas',
    'Paruoštas maistas': 'Paruoštas maistas',
    'Augaliniai produktai': 'Paruoštas maistas',

    // Non-food categories (preserve as-is, excluded from meal planning)
    'Kosmetika ir higiena': 'Kosmetika ir higiena',
    'Buitinė chemija': 'Buitinė chemija',
    'Gyvūnų prekės': 'Gyvūnų prekės',
    'Augalai': 'Augalai',
    'Namų ūkis': 'Namų ūkis',
    // Akcijos.lt raw non-food category names
    'Buitinės chemijos prekės': 'Buitinė chemija',
    'Buitinės chemijos': 'Buitinė chemija',
    'Kosmetikos prekės': 'Kosmetika ir higiena',
    'Kosmetikos': 'Kosmetika ir higiena',
    'Asmens higienos prekės': 'Kosmetika ir higiena',
    'Asmens higiena': 'Kosmetika ir higiena',
    'Higienos prekės': 'Kosmetika ir higiena',
    'Gyvūnų': 'Gyvūnų prekės',
    'Kūdikių prekės': 'Kūdikių prekės',
    'Kūdikių': 'Kūdikių prekės',
    'Vaikų ir kūdikių': 'Kūdikių prekės',
    'Namų apyvokos prekės': 'Namų ūkis',
    'Namų ūkio ir laisvalaikio': 'Namų ūkis',
    'Pramonės prekės': 'Namų ūkis',
    'Vaistinės prekės': 'Sveikata',
    'Medicininės prekės': 'Sveikata',
    'Vitaminai ir papildai': 'Sveikata',
    'Įvairios prekės': 'Namų ūkis',
};

function categorizeByName(name: string): string {
    const n = name.toLowerCase();
    // Note: using (?:^|[\s.,/(]) instead of \b because \b doesn't work with Lithuanian chars (š,ž,č,ė etc.)
    const B = '(?:^|[\\s.,/(])'; // word-start boundary that works with Unicode
    if (new RegExp(`${B}(dešr|kump|lašin|kiaulien|vištien|jautien|mės|kalakut|kotlet|farsas|šonin|servelat|skilandis|rūkyt|maltint|dešrain|paukštien|antiena|veršien|lašiš|silkė|silkių|menkė|žuv|krevet|tun|upėtak|sardin|skumbr|ikra|jūros|krab|pašteta|sardel|ešer|saliam|kepenėl|šašlyk|šoninė|kiaul|vyniotin|dorada|vilkešer)`).test(n)) return 'Mėsa ir žuvis';
    if (new RegExp(`${B}(pien|sūri|jogurt|grietin|varšk|sviest|kefyr|kiaušin|mocarela|mascarpone|mozzarella|džiug|feta|brie|camembert|cheddar|gouda|parmezan|sūrel|rūgpien)`).test(n)) return 'Pieno produktai';
    if (new RegExp(`${B}(duon|baton|pyrag|bandelė|kruasan|tortas|keksas|milt|sausain|muffin|vafli|meduol|spurg|konditer|lavašas|pita|pynė|džiūvėsė|džiūvėsiai)`).test(n)) return 'Duona ir konditerija';
    if (new RegExp(`${B}(obuol|banan|braškė|mang|avokad|citrin|apelsin|arbūz|melon|vynuog|ananasa|pomidor|agurk|mork|bulv|kopūst|paprik|svogūn|salot|česnak|brokoliai|kukurūz|špinat|burokėl|cukinij|gryb|baklažan|moliūg|daržov|vaisi|uog|slyv|persik|nektarin|ridik|žirnių|pupu)`).test(n)) return 'Vaisiai ir daržovės';
    if (new RegExp(`${B}(šokolad|saldain|traškuč|čips|ledai|plombyras|riešut|chalva|zefyr|marmelad|karamel|batonel|snickers|mars|twix|skittles|popcorn|kreker|dražė)`).test(n)) return 'Saldumynai ir užkandžiai';
    if (new RegExp(`${B}(šald|koldūn|blyneli|pelmen|cepelinai|gyoza|kalmar)`).test(n)) return 'Šaldytas maistas';
    if (new RegExp(`${B}(sumuštini|paruošt|gatav|kepta.*višt|grilio|pica |pizza|kibinai|apkepėl)`).test(n)) return 'Paruoštas maistas';
    if (new RegExp(`${B}(makaronai|spageti|kruop|ryžiai|padaž|kečup|majonez|aliej|konserv|kons\\.|pupelės|cukr|drusk|mieli|dribsni|granola|avižos|uogiena|džemas|medus|marinuot|sultinys|actas|sirup|krienai|miso|sezam|imbier|rizotas|tofu|kokos|pistacij.*krem)`).test(n)) return 'Bakalėja';
    return 'Kita';
}

// Patterns to detect non-food categories from raw akcijos.lt category strings
const NON_FOOD_CAT_RULES: Array<{ pattern: RegExp; unified: string }> = [
    { pattern: /kosmetik|higien|asmens/i, unified: 'Kosmetika ir higiena' },
    { pattern: /buitin|chemij|valym/i, unified: 'Buitinė chemija' },
    { pattern: /gyvūn/i, unified: 'Gyvūnų prekės' },
    { pattern: /kūdiki|vaik/i, unified: 'Kūdikių prekės' },
    { pattern: /vaist|medicinin|vitamin|papild/i, unified: 'Sveikata' },
    { pattern: /namų apyvok|namų ūkio|pramonės|įvairios|laisvalaikio/i, unified: 'Namų ūkis' },
    { pattern: /drabužiai|avalyn|tekstil/i, unified: 'Namų ūkis' },
];

// Classify non-food products by name (fallback when category is missing/generic)
function classifyNonFoodByName(name: string): string | null {
    const n = name.toLowerCase();
    if (/šampūn|dušo|muilas|dezodorant|dantų past|plaukų|veido krem|kūno krem|odos|burnos|nagų|makiažo|lūpų|skustuv|higienin|įklot|kremas cien|kremas hydra/.test(n)) return 'Kosmetika ir higiena';
    if (/skalbim|skalbikl|plovikl|valikl|wc valikl|wc.*gaivikl|šluost|servetėl|popierini|rankšluosč|oro gaivikl|indaplov|indapl\.|šiukšlių|kempinė|šepet|šluot|maišeli|grindų plovim|tualetinis popierius|fairy|somat|finish/.test(n)) return 'Buitinė chemija';
    if (/šunų|kačių|gyvūn|kraikas|šunų ėdal|kačių skanėst/.test(n)) return 'Gyvūnų prekės';
    if (/sodinuk|gėlių|trąš|augalas|spygliuotis|gerbera|sėklos.*augal|beirutis|atramų augal|šalavijų sėkl/.test(n)) return 'Augalai';
    if (/sauskeln|kūdiki|vaikų pižam/.test(n)) return 'Kūdikių prekės';
    if (/vitamin|maisto papild|pirmosios pagalb/.test(n)) return 'Sveikata';
    if (/šašlykin|įranki|gręžtuv|pjūkl|žvak|termosas|ausinė|kolonėlė|bluetooth|įkrovikl|baterij|lygintuv|džiovintuv|kirpimo mašinėl|gruzdintuvė|orkaitė|dulki|siurbl|ventiliator|radiator|patalynė|užvalkal|pledas|antklod|kilim|žaislas|lego|dėlion|kojinės|pirštinės|šlepetės|avalynė|medžio angli|jaukas|jauko|lipni dekoracij|akinių|keptuvė|replės|replių|atsuktuvai|atsuktuvų|antgalių|poveržlių|dirželių|spintelė|patiesaliu|sulčiaspaudė|patikros kamer|dekoratyvin|pistoletas rms|dėtuvių|muilo burbul|kepimo form|kepimo grotėl|kepimo grotel|termometr|pagalvių rinkin|peilių rinkin|puodų rinkin|teptukų rinkin|dėžė art|šaldytuvo dėkl|žaidimo rinkin|beer pong/.test(n)) return 'Namų ūkis';
    return null;
}

// Non-food unified categories (used to detect if CATEGORY_MAP returned a non-food result)
const NON_FOOD_UNIFIED = new Set([
    'Kosmetika ir higiena', 'Buitinė chemija', 'Gyvūnų prekės',
    'Augalai', 'Namų ūkis', 'Kūdikių prekės', 'Sveikata',
]);

function unifyCategory(product: HybridProduct): string {
    // 1. Exact match in CATEGORY_MAP
    if (product.category && CATEGORY_MAP[product.category]) {
        const mapped = CATEGORY_MAP[product.category];
        // For non-food results, check if name suggests a more specific category
        if (NON_FOOD_UNIFIED.has(mapped)) {
            const nameOverride = classifyNonFoodByName(product.name);
            return nameOverride || mapped;
        }
        return mapped;
    }
    // 2. Partial match for non-food categories (handles raw akcijos.lt names)
    if (product.category) {
        for (const rule of NON_FOOD_CAT_RULES) {
            if (rule.pattern.test(product.category)) {
                const nameOverride = classifyNonFoodByName(product.name);
                return nameOverride || rule.unified;
            }
        }
    }
    // 3. Try food classification by name
    const byName = categorizeByName(product.name);
    if (byName !== 'Kita') return byName;
    // 4. If categorizeByName returned Kita, try non-food classification by name
    return classifyNonFoodByName(product.name) || 'Kita';
}

// Drink/non-food filter reused across adapters
const DRINK_PATTERN = /\b(kava|kavos|coffee|espresso|cappuccino|latte|arbata|arbatos|tea|sultys|sul[čc]i[ųu]|g[eė]rimas|g[eė]rim|limonadas|vanduo|vandens|mineralin|gazuot|alus|al[aų]|vynas|vyn[oų]|degtinė|brendis|viskis|konjak|šamp[aū]n|sidras|energin|cola|pepsi|fanta|sprite|redbull|monster|beer|wine|vodka|gin\b|rum\b|whisky|tequila|liqueur|cocktail|smoothie|milkshake)\b/i;

function isFoodProduct(name: string): boolean {
    return !DRINK_PATTERN.test(name);
}

async function fetchWithRetry(url: string, opts: RequestInit = {}, retries = 2): Promise<Response> {
    for (let i = 0; i <= retries; i++) {
        try {
            const res = await fetch(url, {
                ...opts,
                headers: { 'User-Agent': USER_AGENT, ...(opts.headers || {}) },
            });
            if (res.ok) return res;
            if (i < retries) {
                console.log(`  Retry ${i + 1}/${retries} for ${url} (HTTP ${res.status})`);
                await new Promise(r => setTimeout(r, 1000 * (i + 1)));
            } else {
                throw new Error(`HTTP ${res.status} for ${url}`);
            }
        } catch (err) {
            if (i >= retries) throw err;
            await new Promise(r => setTimeout(r, 1000 * (i + 1)));
        }
    }
    throw new Error('Unreachable');
}


// ═══════════════════════════════════════════════════════════════════════
// IKI - Direct REST API
// ═══════════════════════════════════════════════════════════════════════

async function fetchIki(): Promise<HybridProduct[]> {
    console.log('[IKI Direct] Fetching from REST API...');

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    let res: Response;
    try {
        res = await fetchWithRetry('https://iki.lt/wp-json/iki-app/v1/promos', {
            headers: {
                'Accept': 'application/json',
                'Accept-Language': 'lt-LT,lt;q=0.9,en;q=0.8',
            },
            signal: controller.signal,
        });
    } catch (err) {
        console.error(`[IKI Direct] Fetch failed: ${err}`);
        return [];
    } finally {
        clearTimeout(timeout);
    }
    const text = await res.text();
    console.log(`[IKI Direct] Response: ${res.status}, length: ${text.length}`);

    // Validate JSON response (API might return HTML on block/error)
    let data: any[];
    try {
        data = JSON.parse(text);
    } catch {
        console.error(`[IKI Direct] API returned non-JSON (${text.slice(0, 200)}...)`);
        return [];
    }

    if (!Array.isArray(data)) {
        console.error(`[IKI Direct] API returned non-array: ${typeof data}`);
        return [];
    }

    console.log(`[IKI Direct] API returned ${data.length} promos`);

    const products: HybridProduct[] = [];

    for (const item of data) {
        try {
            const name = (item.title || '').trim();
            if (!name || name.length < 2) continue;

            // meta_price can be "" (empty), "0.19", or missing
            // Items without price but with discount % (like "-50%") are still valid
            const discountPrice = parsePrice(item.meta_price);
            const originalPrice = parsePrice(item.meta_price_old);
            const metaDiscount = item.meta_discount
                ? parseInt(String(item.meta_discount).replace(/[^0-9]/g, ''), 10) || null
                : null;

            // Must have either a price or a discount percentage
            if (!discountPrice && !metaDiscount) continue;

            const discountPercent = metaDiscount || calcDiscount(originalPrice, discountPrice || 0);

        // Parse dates
        let validFrom: string | null = null;
        let validTo: string | null = null;
        if (item.start_date) validFrom = item.start_date;
        if (item.end_date) validTo = item.end_date;

        // Image - try multiple fields
        const imageUrl = item.image_url || item.image || item.thumbnail || null;

        // Category from the first category in the array
        const category = Array.isArray(item.categories) && item.categories.length > 0
            ? (item.categories[0].name || item.categories[0]) : null;

        // Deal type from meta_sales_note
        const dealType = item.meta_sales_note || null;

            // Filter non-food categories (cosmetics, household, etc.)
            const cats = Array.isArray(item.categories) ? item.categories : [];
            const isNonFoodCategory = cats.some((c: string) =>
                /kosmetik|higien|valymo|buitin|gyvūn|namų ūkio|household/i.test(c));
            if (isNonFoodCategory) continue;

            if (!isFoodProduct(name)) continue;

            products.push({
                store: 'iki',
                name,
                originalPrice,
                discountPrice: discountPrice || 0,
                discountPercent,
                validFrom,
                validTo,
                category: typeof category === 'string' ? category : null,
                imageUrl,
                unit: null,
                pricePerUnit: null,
                description: item.description ? String(item.description).replace(/<[^>]*>/g, '').trim().slice(0, 200) : null,
                storeProductId: item.promo_id ? String(item.promo_id) : null,
                productUrl: item.shop_url || null,
                sourceSection: 'iki.lt/promos',
                dealType,
                scrapedAt: NOW_ISO,
            });
        } catch {
            // Skip malformed items
        }
    }

    console.log(`[IKI Direct] ${products.length} food products after filtering`);
    return dedup(products);
}


// ═══════════════════════════════════════════════════════════════════════
// NORFA - Direct HTML scraping with cheerio
// ═══════════════════════════════════════════════════════════════════════

const NORFA_SECTIONS = [
    { name: 'Akcijos', url: 'https://www.norfa.lt/akciju-puslapiai/akcijos/' },
    { name: 'Praktiski pasiulymai', url: 'https://www.norfa.lt/akciju-puslapiai/praktiski-pasiulymai/' },
];

// Non-food filter for Norfa (they sell household items too)
const NORFA_NON_FOOD = /\b(purkštuv|atsuktuv|replės|gręžtuv|pjūklas|terkšlė|gulsčiukas|šalmas|suvirinimo|švitrini|įranki|skustuvas|ausinės|ausinių|džiovintuvas|garintuvas|kolonėlė|klaviatūra|pelė onex|irigatorius|lygintuvas|bluetooth|įkrovikl|elementai gp|baterij|akumuliator|šiukšlių maišai|šiukšlių|šluostė|skalbimo|skalbikl|plovikl|rankšluoščiai|rankšluost|popierini|tualetinis popierius|tualetini|oro gaiviklis|indaplov|servetėlės|servetėl|ausų krapštukai|dezodorantas|šampūnas|veido kremas|kūno kremas|dantų pasta|plaukų dažai|nagų lakas|kraikas|kojinės|pirštinės|šlepetės|avalynė|pėdkelnės|daiginimo|aušinimo skystis|stiklinis ind|termosas|maisto papildas|žaislas|lego|dėlionė|ingco|onex|clatronic|bomann|esperanza|emos|prohelfer|glamour|philips|tefal|princess|šašlykinė art|surenkama šašlykinė|kapų žvakė|žvakė art|sauskeln|patalynė|užvalkal|spalvinuk|knyga mano pirmi|kirpimo mašinėl|gruzdintuvė|šunų ėdal|kačių skanėst|trąšos|trąš.*emolus|jaukas vde|jauko pried|medžio angli|pirmosios pagalb|kvapniosios granul|lipni dekoracij|muilo burbul|sodinuk|gėlių svogūnėl)\b/i;

async function fetchNorfa(): Promise<HybridProduct[]> {
    console.log('[Norfa Direct] Fetching from HTML...');

    const allProducts: HybridProduct[] = [];

    for (const section of NORFA_SECTIONS) {
        try {
            console.log(`[Norfa Direct] Section: ${section.name}`);
            const res = await fetchWithRetry(section.url);
            const html = await res.text();
            const $ = cheerio.load(html);

            // Norfa uses c-product--compact cards as top-level containers
            // IMPORTANT: [class*="c-product"] matches children too (c-product__name etc.)
            // Use the specific card class to avoid duplicates
            const cards = $('.c-product--compact, .c-product--full, .c-product--list');
            // Fallback to broader selector if specific classes not found
            const productCards = cards.length > 0 ? cards : $('[class*="c-product"]').filter((_, el) => {
                const cls = $(el).attr('class') || '';
                return /c-product--(compact|full|list|card)/.test(cls);
            });
            console.log(`[Norfa Direct]   Found ${productCards.length} product cards`);

            productCards.each((_, el) => {
                const $el = $(el);
                const name = $el.find('.c-product__name, .c-product__title, h3, h4').first().text().trim();
                if (!name || name.length < 3) return;

                // Price - look for the main price element, not old-price
                const priceEl = $el.find('.c-product__price').first();
                const priceText = priceEl.text();
                const discountPrice = parsePrice(priceText);
                if (!discountPrice) return;

                // Old price
                const oldPriceEl = $el.find('.c-product__old-price, s, del').first();
                const originalPrice = parsePrice(oldPriceEl.text());

                // Discount % - verify badge value against actual prices
                const discountEl = $el.find('.c-product__discount, .c-product__badge').first();
                const percMatch = discountEl.text().match(/-?\s*(\d+)\s*%/);
                const badgePercent = percMatch ? parseInt(percMatch[1], 10) : null;
                const calcPercent = calcDiscount(originalPrice, discountPrice);
                const discountPercent = (badgePercent && calcPercent && Math.abs(badgePercent - calcPercent) > 5)
                    ? calcPercent
                    : (badgePercent ?? calcPercent);

                // Image
                const imgEl = $el.find('img').first();
                const imageUrl = imgEl.attr('src') || imgEl.attr('data-src') || imgEl.attr('data-lazy-src') || null;

                // Link
                let productUrl = $el.find('a[href]').first().attr('href') || $el.closest('a').attr('href') || null;
                if (productUrl && !productUrl.startsWith('http')) {
                    productUrl = 'https://www.norfa.lt' + productUrl;
                }

                // Dates
                const dateText = $el.find('.c-product__date, [class*="valid"], time, small').first().text();
                const dateMatch = dateText.match(/(\d{2})[.\-](\d{2})\s*[-–]\s*(\d{2})[.\-](\d{2})/);
                let validFrom: string | null = null;
                let validTo: string | null = null;
                if (dateMatch) {
                    const year = new Date().getFullYear();
                    validFrom = formatDate(new Date(year, parseInt(dateMatch[1], 10) - 1, parseInt(dateMatch[2], 10)));
                    validTo = formatDate(new Date(year, parseInt(dateMatch[3], 10) - 1, parseInt(dateMatch[4], 10)));
                }

                // Filter drinks only (keep non-food with category)
                if (!isFoodProduct(name)) return;

                // Classify non-food items into categories instead of skipping
                let category: string | null = null;
                if (NORFA_NON_FOOD.test(name.toLowerCase())) {
                    const lower = name.toLowerCase();
                    if (/šampūn|dušo|muilas|dezodorant|dantų past|plaukų|veido|kūno|odos|burnos/.test(lower)) {
                        category = 'Kosmetika ir higiena';
                    } else if (/skalbim|plovikl|valikl|šluost|servetėl|popierius|oro gaivikl|indaplov/.test(lower)) {
                        category = 'Buitinė chemija';
                    } else if (/šunų|kačių|gyvūn|kraikas/.test(lower)) {
                        category = 'Gyvūnų prekės';
                    } else if (/sodinuk|gėlių|trąš/.test(lower)) {
                        category = 'Augalai';
                    } else {
                        category = 'Namų ūkis';
                    }
                }

                allProducts.push({
                    store: 'norfa',
                    name,
                    originalPrice,
                    discountPrice,
                    discountPercent,
                    validFrom,
                    validTo,
                    category,
                    imageUrl,
                    unit: null,
                    pricePerUnit: null,
                    description: null,
                    storeProductId: null,
                    productUrl,
                    sourceSection: section.name,
                    dealType: null,
                    scrapedAt: NOW_ISO,
                });
            });
        } catch (err) {
            console.error(`[Norfa Direct] Failed to fetch ${section.name}:`, err);
        }
    }

    const unique = dedup(allProducts);
    console.log(`[Norfa Direct] ${unique.length} unique food products`);
    return unique;
}


// ═══════════════════════════════════════════════════════════════════════
// RIMI - Direct HTML scraping with pagination
// ═══════════════════════════════════════════════════════════════════════

const RIMI_BASE = 'https://www.rimi.lt/e-parduotuve/lt/akcijos';
const RIMI_QUERY_PREFIX = ':relevance:assortmentStatus:inAssortment:inStockFlag:true:firstLevelCategory:';
const RIMI_CATEGORIES = [
    { name: 'Vaisiai, daržovės', query: 'Vaisiai%2C+dar%C5%BEov%C4%97s+ir+g%C4%97l%C4%97s%7E2' },
    { name: 'Augaliniai produktai', query: 'Augaliniai+produktai%7E3' },
    { name: 'Pieno produktai', query: 'Pieno+produktai+ir+kiau%C5%A1iniai%7E4' },
    { name: 'Duonos gaminiai', query: 'Duonos+gaminiai+%7E5' },
    { name: 'Mėsa ir žuvis', query: 'M%C4%97sa+ir+%C5%BEuvis+%7E6' },
    { name: 'Šaldytas maistas', query: '%C5%A0aldytas+maistas%7E7' },
    { name: 'Bakalėja', query: 'Bakal%C4%97ja%7E8' },
    { name: 'Saldumynai', query: 'Saldumynai+ir+u%C5%BEkand%C5%BEiai%7E9' },
    { name: 'RIMI konditerija', query: 'RIMI+konditerija+ir+kulinarija%7E' },
];
const RIMI_PAGE_SIZE = 80;
const RIMI_MAX_PAGES = 10;

async function fetchRimi(): Promise<HybridProduct[]> {
    console.log(`[Rimi Direct] Fetching from HTML (${RIMI_CATEGORIES.length} categories)...`);

    const allProducts: HybridProduct[] = [];
    const now = new Date();
    const today = formatDate(now);
    const daysUntilSunday = (7 - now.getDay()) % 7 || 7;
    const nextSunday = new Date(now);
    nextSunday.setDate(now.getDate() + daysUntilSunday);
    const validTo = formatDate(nextSunday);

    for (const cat of RIMI_CATEGORIES) {
        let categoryTotal = 0;

        for (let page = 1; page <= RIMI_MAX_PAGES; page++) {
            const url = `${RIMI_BASE}?currentPage=${page}&pageSize=${RIMI_PAGE_SIZE}&query=${RIMI_QUERY_PREFIX}${cat.query}`;

            try {
                const res = await fetchWithRetry(url);
                const html = await res.text();
                const $ = cheerio.load(html);

                const cards = $('li.product-grid__item, li.card');
                if (cards.length === 0) break;

                let pageCount = 0;
                cards.each((_, el) => {
                    const $card = $(el);

                    // Name
                    const name = $card.find('.card__name').first().text().trim();
                    if (!name || name.length < 3) return;

                    // Current price
                    // Rimi DOM: <span class="sr-only">2.49 € per kg</span>
                    //           <span aria-hidden="true">2</span>
                    //           <div aria-hidden="true"><sup>49</sup><sub>€/kg</sub></div>
                    // SVARBU: children('span').first() gauna sr-only span su visu tekstu,
                    // todėl naudojam aria-hidden span (turi tik sveikąją dalį).
                    const priceTag = $card.find('.price-tag.card__price, .card__price').first();
                    const wholeEl = priceTag.find('span[aria-hidden="true"]').first();
                    const centsEl = priceTag.find('sup').first();
                    const whole = wholeEl.text().replace(/[^0-9]/g, '');
                    const cents = centsEl.text().replace(/[^0-9]/g, '') || '00';
                    const discountPrice = whole ? parseFloat(`${whole}.${cents.padStart(2, '0')}`) : null;
                    if (!discountPrice || discountPrice <= 0) return;

                    // Old price
                    // Rimi DOM: <span class="sr-only">Regular price: 0,99 €</span>
                    //           <span aria-hidden="true">0,99€</span>
                    // Nėra sup elementų - kaina viename span kaip "0,99€"
                    const oldTag = $card.find('.old-price-tag.card__old-price, .card__old-price').first();
                    let originalPrice: number | null = null;
                    if (oldTag.length) {
                        const oldAriaSpan = oldTag.find('span[aria-hidden="true"]').first();
                        if (oldAriaSpan.length) {
                            const oldText = oldAriaSpan.text().trim();
                            const oldMatch = oldText.match(/(\d+)[,.](\d{2})/);
                            if (oldMatch) originalPrice = parseFloat(`${oldMatch[1]}.${oldMatch[2]}`);
                        }
                        if (originalPrice !== null && originalPrice > 500) originalPrice = null;
                    }

                    // Loyalty price
                    const loyaltyEl = $card.find('.price-label__price').first();
                    const majorEl = loyaltyEl.find('.major').first();
                    const minorEl = loyaltyEl.find('.minor').first();
                    let loyaltyPrice: number | null = null;
                    if (majorEl.length) {
                        const major = majorEl.text().replace(/[^0-9]/g, '');
                        const minor = minorEl.text().replace(/[^0-9]/g, '') || '00';
                        if (major) loyaltyPrice = parseFloat(`${major}.${minor.padStart(2, '0')}`);
                    }

                    // Must have a discount
                    const hasRegularDiscount = originalPrice !== null && originalPrice > discountPrice;
                    const hasLoyaltyDiscount = loyaltyPrice !== null && loyaltyPrice < discountPrice;
                    if (!hasRegularDiscount && !hasLoyaltyDiscount) return;

                    let finalDiscount = discountPrice;
                    let finalOriginal = originalPrice;
                    if (hasLoyaltyDiscount && !hasRegularDiscount) {
                        finalOriginal = discountPrice;
                        finalDiscount = loyaltyPrice!;
                    }

                    // Unit price - naudojam aria-hidden span (sr-only turi "Price per unit:" prefixą)
                    const ppuEl = $card.find('.card__price-per').first();
                    const ppuAriaSpan = ppuEl.find('span[aria-hidden="true"]').first();
                    const rawPPU = (ppuAriaSpan.length ? ppuAriaSpan.text() : ppuEl.text()).replace(/\s+/g, ' ').trim();
                    const pricePerUnit = rawPPU || null;

                    // Image (upgrade Cloudinary quality: q_1→q_auto, 216→512px)
                    const imgEl = $card.find('img').first();
                    let imageUrl = imgEl.attr('src') || imgEl.attr('data-src') || null;
                    if (imageUrl && imageUrl.includes('cloudinary.com')) {
                        imageUrl = imageUrl.replace(/q_\d+/, 'q_auto').replace(/h_\d+/, 'h_512').replace(/w_\d+/, 'w_512');
                    }

                    // Product URL
                    let productUrl = $card.find('a[href]').first().attr('href') || null;
                    if (productUrl && !productUrl.startsWith('http')) {
                        productUrl = 'https://www.rimi.lt' + productUrl;
                    }

                    // Product code
                    const productCode = $card.attr('data-product-code') || null;

                    if (!isFoodProduct(name)) return;

                    allProducts.push({
                        store: 'rimi',
                        name,
                        originalPrice: finalOriginal,
                        discountPrice: finalDiscount,
                        discountPercent: calcDiscount(finalOriginal, finalDiscount),
                        validFrom: today,
                        validTo,
                        category: cat.name,
                        imageUrl,
                        unit: null,
                        pricePerUnit,
                        description: null,
                        storeProductId: productCode,
                        productUrl,
                        sourceSection: cat.name,
                        dealType: null,
                        scrapedAt: NOW_ISO,
                    });
                    pageCount++;
                });

                categoryTotal += pageCount;
                console.log(`[Rimi Direct]   ${cat.name} p${page}: ${pageCount} products`);

                // If we got very few products, no more pages
                if (pageCount < RIMI_PAGE_SIZE * 0.3) break;

                // Small delay between pages
                await new Promise(r => setTimeout(r, 200));

            } catch (err) {
                console.error(`[Rimi Direct]   Failed ${cat.name} p${page}:`, err);
                break;
            }
        }

        console.log(`[Rimi Direct]   ${cat.name} total: ${categoryTotal}`);
    }

    const unique = dedup(allProducts);
    console.log(`[Rimi Direct] ${unique.length} unique food products`);
    return unique;
}


// ═══════════════════════════════════════════════════════════════════════
// MAIN - Run all sources in parallel, merge results
// ═══════════════════════════════════════════════════════════════════════

async function main() {
    console.log('=== Hybrid Promotions Runner ===');
    console.log('Sources: IKI (REST API) + Norfa (HTML) + Rimi (HTML) + Akcijos.lt (Maxima, Lidl)\n');

    const startTime = Date.now();

    // Run all sources in parallel
    const [ikiResult, norfaResult, rimiResult, akcijosResult] = await Promise.allSettled([
        fetchIki(),
        fetchNorfa(),
        fetchRimi(),
        new AkcijosLtAdapter().run().then(r => r),
    ]);

    // Extract results with fallback handling
    if (ikiResult.status === 'rejected') console.error('[IKI Direct] FAILED:', ikiResult.reason);
    if (norfaResult.status === 'rejected') console.error('[Norfa Direct] FAILED:', norfaResult.reason);
    if (rimiResult.status === 'rejected') console.error('[Rimi Direct] FAILED:', rimiResult.reason);

    const ikiProducts = ikiResult.status === 'fulfilled' ? ikiResult.value : [];
    const norfaProducts = norfaResult.status === 'fulfilled' ? norfaResult.value : [];
    const rimiProducts = rimiResult.status === 'fulfilled' ? rimiResult.value : [];

    // From akcijos.lt, we always take Maxima and Lidl
    // For IKI/Norfa/Rimi, fall back to akcijos.lt if direct source failed
    let akcijosMaxima: HybridProduct[] = [];
    let akcijosLidl: HybridProduct[] = [];
    let akcijosIki: HybridProduct[] = [];
    let akcijosNorfa: HybridProduct[] = [];
    let akcijosRimi: HybridProduct[] = [];

    if (akcijosResult.status === 'fulfilled') {
        const { byStore } = akcijosResult.value;
        const mapAkcijos = (products: any[]): HybridProduct[] =>
            products.map(p => ({
                ...p,
                validFrom: p.validFrom ? formatDate(p.validFrom) : null,
                validTo: p.validTo ? formatDate(p.validTo) : null,
                scrapedAt: p.scrapedAt?.toISOString?.() || NOW_ISO,
            }));

        akcijosMaxima = mapAkcijos(byStore.maxima || []);
        akcijosLidl = mapAkcijos(byStore.lidl || []);
        akcijosIki = mapAkcijos(byStore.iki || []);
        akcijosNorfa = mapAkcijos(byStore.norfa || []);
        akcijosRimi = mapAkcijos(byStore.rimi || []);
    } else {
        console.error('[Akcijos.lt] FAILED:', akcijosResult.reason);
    }

    // Choose best source per store (direct if available, akcijos.lt fallback)
    const iki = ikiProducts.length > 0 ? ikiProducts : akcijosIki;
    const norfa = norfaProducts.length > 0 ? norfaProducts : akcijosNorfa;
    const rimi = rimiProducts.length > 0 ? rimiProducts : akcijosRimi;
    const maxima = akcijosMaxima;
    const lidl = akcijosLidl;

    // Log source selection
    console.log('\n=== Source Selection ===');
    console.log(`  IKI:    ${ikiProducts.length > 0 ? 'Direct API' : 'Akcijos.lt fallback'} (${iki.length} products)`);
    console.log(`  Norfa:  ${norfaProducts.length > 0 ? 'Direct HTML' : 'Akcijos.lt fallback'} (${norfa.length} products)`);
    console.log(`  Rimi:   ${rimiProducts.length > 0 ? 'Direct HTML' : 'Akcijos.lt fallback'} (${rimi.length} products)`);
    console.log(`  Maxima: Akcijos.lt (${maxima.length} products)`);
    console.log(`  Lidl:   Akcijos.lt (${lidl.length} products)`);

    // Unify categories across all stores
    const stores = { iki, norfa, rimi, maxima, lidl };
    for (const products of Object.values(stores)) {
        for (const p of products) {
            p.category = unifyCategory(p);
        }
    }

    // Assign deal type labels to products that don't have one
    for (const products of Object.values(stores)) {
        for (const p of products) {
            if (p.dealType) continue;
            if (p.discountPercent && p.discountPercent > 0) {
                // Has discount % but no label - generic discount
                p.dealType = 'NUOLAIDA';
            } else {
                // No discount %, no original price - fixed promo price
                p.dealType = 'AKCIJA';
            }
        }
    }

    // Global dedup: remove exact duplicates (same store + name + price + deal type)
    // Keeps the first occurrence (prefers entry with more data)
    for (const [storeName, products] of Object.entries(stores)) {
        const seen = new Set<string>();
        const before = products.length;
        const deduplicated = products.filter(p => {
            const key = `${p.name}|${p.discountPrice}|${p.dealType}`;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });
        (stores as any)[storeName] = deduplicated;
        if (before !== deduplicated.length) {
            console.log(`[Dedup] ${storeName}: removed ${before - deduplicated.length} duplicates (${before} -> ${deduplicated.length})`);
        }
    }

    // Save per-store JSON files
    let total = 0;

    for (const [storeName, products] of Object.entries(stores)) {
        const filename = `./${storeName}_products.json`;
        fs.writeFileSync(filename, JSON.stringify(products, null, 2));
        console.log(`Saved ${products.length} products to ${filename}`);
        total += products.length;
    }

    // Save combined file (use stores object which has deduped data)
    const all = Object.values(stores).flat();
    fs.writeFileSync('./all_products.json', JSON.stringify(all, null, 2));

    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`\n=== TOTAL: ${total} products in ${duration}s ===`);
}

main().catch(err => {
    console.error('FATAL ERROR:', err);
    process.exit(1);
});
