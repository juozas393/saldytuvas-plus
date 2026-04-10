/**
 * Akcijos.lt API Adapter (v3)
 *
 * Uses api.akcijos.lt/search/searchProducts to fetch promotions
 * from all Lithuanian stores.
 *
 * v3 improvements over v2:
 * - ~500 hyper-specific keywords (was 196 broad) for maximum coverage
 * - API returns max 10 items per store per keyword, so narrow terms
 *   that yield <10 results per store capture ALL matching products
 * - Removed wasteful broad terms (akcija, nuolaida, 1 kg, etc.)
 * - Added 47 brand-specific searches (SVALIA, PERGALE, VICIŪNAI, etc.)
 * - Added specific meat cuts, cheese types, pasta shapes, spices
 * - Parallel requests with concurrency limit (5 concurrent)
 * - 100ms delay between requests
 * - Pre-compiled regex and non-food terms at module level
 * - Fixed silent store fallback bug (v2)
 */

import { Product, StoreName } from '../../core/types.js';

// Store name mapping from Akcijos.lt → our StoreName
const STORE_MAP: Record<string, StoreName> = {
    'Maxima': 'maxima',
    'MAXIMA': 'maxima',
    'maxima': 'maxima',
    'Iki': 'iki',
    'IKI': 'iki',
    'iki': 'iki',
    'Rimi': 'rimi',
    'RIMI': 'rimi',
    'rimi': 'rimi',
    'Lidl': 'lidl',
    'LIDL': 'lidl',
    'lidl': 'lidl',
    'Norfa': 'norfa',
    'NORFA': 'norfa',
    'norfa': 'norfa',
};

// Only include these stores
const TARGET_STORES = new Set(Object.keys(STORE_MAP));

// Lithuanian food search terms - v3: ~500 hyper-specific keywords
// Strategy: narrow terms where each store has <10 results = we get ALL products
// Broad terms (akcija, nuolaida, 1 kg) removed - they hit the 10-item cap and miss 90%+ products
const FOOD_KEYWORDS = [
    // === PIENO PRODUKTAI ===
    // Baziniai (8)
    'pienas', 'sviestas', 'grietinė', 'grietinėlė', 'jogurtas', 'kefyras',
    'varškė', 'kiaušiniai',
    // Specifiniai sūriai (21)
    'sūris', 'mozzarella', 'mascarpone', 'parmezanas', 'feta', 'gouda',
    'ementalis', 'čederis', 'kamemberts', 'bri', 'sūrelis',
    'tilsit', 'edamas', 'rikotas', 'halumi', 'burrata', 'provolone',
    'lydytas sūris', 'rūkytas sūris', 'kreminis sūris', 'varškės sūris',
    // Specifiniai pieno gaminiai (16)
    'skuta', 'išrūgos', 'pienelis', 'kremas', 'smetona',
    'graikiškas jogurtas', 'geriamasis jogurtas',
    'probiotinis', 'acidofilas',
    'pasukos', 'varškės masė', 'varškės desertas', 'glazūruotas sūrelis',
    'pieno kokteilis', 'grietinėlės sūris',
    'sūdytas sviestas',

    // === MĖSA IR MĖSOS GAMINIAI ===
    // Baziniai (10)
    'kiauliena', 'jautiena', 'vištiena', 'kalakutiena', 'mėsa', 'faršas',
    'dešra', 'kumpis', 'šoninė', 'dešrelės',
    // Specifiniai pjūviai (18)
    'skilandis', 'šonkauliukai', 'sprandinė', 'nugarinė', 'filė',
    'kepenys', 'kotletas', 'kebabas',
    'vištienos krūtinėlė', 'vištienos blauzdelės', 'vištienos sparneliai',
    'kiaulienos sprandinė', 'kiaulienos kumpis',
    'jautienos antrekotė', 'jautienos nugarinė',
    'kalakutienos filė', 'kalakutienos krūtinėlė',
    'paukštiena',
    // Dešros ir gaminiai (16)
    'saliamis', 'chorizo', 'prosciutto', 'mortadela', 'servelatas',
    'sardelės', 'kupetinės dešrelės', 'kaimiška dešra',
    'kumpio riekelės', 'skilandis pjaustytas',
    'rūkytas kumpis', 'virtas kumpis',
    'mėsainiai', 'lašiniai',
    'rūkytas', 'vytintas',
    // Retesnė mėsa (7)
    'antiena', 'ėriena', 'triušiena', 'veršiena',
    'kepenėlės', 'širdelės', 'liežuvis',

    // === ŽUVIS IR JŪROS GĖRYBĖS ===
    // Baziniai (11)
    'žuvis', 'lašiša', 'silkė', 'krevetės', 'menkė', 'tunų',
    'upėtakis', 'skumbrė', 'pangasius', 'karpis', 'lydeka',
    // Specifiniai (20)
    'šprotai', 'sardines', 'ešerys', 'ungurys',
    'kalmarai', 'midijos',
    'lašišos filė', 'menkės filė', 'heko', 'tilapija',
    'stinta', 'ikrai', 'krabų lazdelės', 'surimi',
    'žuvies piršteliai', 'žuvies kepsnys',
    'rūkyta lašiša', 'rūkyta skumbrė',
    'silkė aliejuje', 'marinuota silkė',

    // === VAISIAI IR UOGOS ===
    'obuoliai', 'bananai', 'braškės', 'vynuogės', 'apelsinai',
    'citrina', 'avokadas', 'arbūzas', 'melionas', 'persikai',
    'nektarinai', 'mangai', 'ananasai', 'kiviai', 'kriaušės',
    'slyvos', 'vyšnios', 'mėlynės', 'aviečiai', 'spanguolės',

    // === DARŽOVĖS ===
    'pomidorai', 'agurkai', 'bulvės', 'morkos', 'svogūnai',
    'paprikos', 'salotos', 'kopūstai', 'brokoliai', 'žiediniai kopūstai',
    'cukinija', 'baklažanai', 'ridikai', 'špinatai', 'česnakų',
    'burokėliai', 'petražolės', 'krapai', 'rukola', 'kukurūzai',
    'grybai', 'pievagrybiai', 'moliūgas',

    // === DUONA IR KEPINIAI ===
    // Baziniai (9)
    'duona', 'batonas', 'bandelės', 'pyragėliai', 'croissant',
    'lavašas', 'pita', 'tortilija', 'sumuštinis',
    // Specifiniai (16)
    'ruginė duona', 'kvietinė duona', 'juoda duona',
    'duona su sėklomis', 'grūdėta duona',
    'spurgos', 'žagarėliai', 'krekeriai',
    'focaccia', 'ciabatta', 'briošas',
    'sluoksniuota tešla', 'pyragėlis su varške',
    'kibinai', 'čeburekai', 'šakotis',

    // === BAKALĖJA ===
    // Baziniai (15)
    'miltai', 'cukrus', 'ryžiai', 'makaronai', 'aliejus', 'actas',
    'druska', 'padažas', 'kečupas', 'majonezas',
    'konservai', 'dribsniai', 'muesli', 'kruopos', 'grikiai',
    // Specifiniai makaronai (10)
    'spagečiai', 'penne', 'fusilli', 'tagliatelle', 'lasanja',
    'farfalle', 'rigatoni', 'gnocchi',
    'vermišeliai', 'pilno grūdo makaronai',
    // Specifiniai ryžiai (6)
    'basmati', 'jasmine', 'ilgagrūdžiai',
    'rudieji ryžiai', 'laukiniai ryžiai',
    'kuskusas',
    // Specifiniai miltai ir kruopos (8)
    'rugių miltai', 'kvietiniai miltai', 'pilno grūdo miltai',
    'kukurūzų miltai', 'ryžių miltai',
    'manų kruopos', 'perlinės kruopos', 'miežinės kruopos',
    // Specifiniai aliejai (8)
    'alyvuogių aliejus', 'saulėgrąžų aliejus', 'rapsų aliejus',
    'kokosų aliejus', 'sezamo aliejus', 'linų aliejus',
    'extra virgin', 'šalto spaudimo',
    // Grūdiniai (6)
    'avižos', 'avižiniai dribsniai', 'kukurūzų dribsniai',
    'sėlenos', 'bulguras', 'grūdų mišinys',

    // === PADAŽAI IR PRIESKONIAI ===
    // Baziniai (6)
    'pipirai', 'prieskoniai', 'garstyčios', 'marinatas',
    'pomidorų pasta', 'pomidorų padažas',
    // Specifiniai padažai (12)
    'sojos padažas', 'sriracha', 'tabasco',
    'čili padažas', 'barbekiu padažas',
    'teriyaki', 'pesto', 'bolognese',
    'tataro padažas', 'česnakinis padažas',
    'balzamiko', 'ajvaro',
    // Specifiniai prieskoniai (16)
    'kurkuma', 'kalendra', 'kmynai', 'cinamonas', 'vanilė',
    'rožmarinas', 'bazilikas', 'oreganas', 'tymiano', 'majoranas',
    'čili pipirai', 'juodieji pipirai',
    'muskatas', 'karis',
    'česnako milteliai', 'prieskonių mišinys',
    // Actas (3)
    'obuolių actas', 'vyno actas', 'ryžių actas',

    // === KONSERVAI - SPECIFINIAI ===
    'konservuoti žirneliai', 'konservuoti kukurūzai', 'konservuoti pomidorai',
    'konservuotos pupelės', 'konservuotas tunas',
    'alyvuogės žalios', 'alyvuogės juodos', 'alyvuogės',
    'marinuoti agurkai', 'marinuoti pomidorai', 'marinuoti grybai',
    'kapotai pomidorai', 'pomidorų tyrė',
    'šprotai aliejuje', 'paštetas',

    // === ŠALDYTAS MAISTAS ===
    'ledai', 'pica', 'koldūnai', 'cepelinai', 'blynai',
    'šaldytos daržovės', 'šaldytos uogos', 'šaldytos krevetės',
    'šaldyti kotletai', 'šaldytos bulvytės', 'bulvių lazdelės',
    'kukuliai', 'virtiniai',
    'šaldyta pica', 'mini pica',
    'šaldyti žirneliai', 'šaldyti kukurūzai',

    // === SALDUMYNAI ===
    // Baziniai (10)
    'šokoladas', 'saldainiai', 'sausainiai', 'pyragas', 'tortas',
    'traškučiai', 'desertas', 'marmeladas', 'vaflis', 'meduolis',
    // Specifiniai šokoladai (4)
    'juodasis šokoladas', 'pieniškas šokoladas', 'baltas šokoladas',
    'šokoladiniai saldainiai',
    // Specifiniai saldumynai (10)
    'biskvitas', 'napoleonas', 'tinginys',
    'zefyrai', 'lukumas', 'pastilas', 'chalva',
    'triufeliai', 'marcipanas',
    'cukatos',

    // === UŽKANDŽIAI ===
    'riešutai', 'batonėlis', 'trapučiai',
    'kukurūzų traškučiai', 'ryžių traškučiai',
    'nachos', 'spraginti kukurūzai',

    // === RIEŠUTAI IR DŽIOVINTI VAISIAI ===
    'migdolai', 'graikiniai riešutai', 'lazdynų riešutai',
    'žemės riešutai', 'anakardžiai', 'pistacijos',
    'kedro riešutai', 'riešutų mišinys',
    'džiovintos slyvos', 'džiovinti abrikosai', 'džiovinti fikai',
    'džiovintos datulės', 'razinos',
    'saulėgrąžos', 'moliūgų sėklos', 'linų sėmenys', 'chia',
    'sezamas', 'sėklos',

    // === PUSRYČIAI ===
    'granola', 'avižinė košė', 'košė',
    'džemas', 'uogienė', 'medus',
    'šokoladinis kremas', 'nutella',
    'žemės riešutų sviestas',

    // === PARUOŠTAS MAISTAS IR SRIUBOS ===
    'sriuba', 'bulijonas', 'tirštoji sriuba', 'trinta sriuba',
    'vištienos sultinys', 'jautienos sultinys', 'daržovių sultinys',
    'sultinio kubeliai',
    'mišrainė', 'lazanija',
    'plovas', 'suši',

    // === AUGALINIAI / VEGETARIŠKI ===
    'tofu', 'hummusas', 'augalinis', 'veganas', 'falafel',

    // === DIETINIAI / EKO ===
    'ekologiškas', 'be gliuteno', 'be laktozės', 'be cukraus',

    // === SVIESTAS IR MARGARINAS ===
    'margarinas', 'RAMA', 'FLORA',

    // === ANKŠTINIAI IR GRŪDAI ===
    'pupelės', 'lęšiai', 'avinžirniai', 'žirniai',
    'sojos',

    // === DESERTAI ===
    'pudingas', 'želė', 'tiramisu',

    // === KEPIMO REIKMENYS ===
    'mielės', 'krakmolas', 'želatina', 'kepimo',
    'kakavos', 'milteliai', 'raugalas',

    // === PARUOŠIMO BŪDAI (siauros paieškos) ===
    'marinuotas', 'rauginti', 'sūdyta',
    'šviežia', 'natūralus', 'fermentinis',

    // === BRENDAI - PIENO (18) ===
    'ROKIŠKIO', 'DVARO', 'VILKYŠKIŲ', 'ŽEMAITIJOS', 'PILOS',
    'KARUMS', 'AMRITA', 'MLEKOVITA', 'PRESIDENT', 'DANONE',
    'SVALIA', 'VILVI', 'PIENO ŽVAIGŽDĖS', 'BALTASIS',
    'RAMBYNAS', 'VALIO', 'HOCHLAND', 'ACTIVIA',

    // === BRENDAI - MĖSA (8) ===
    'BIOVELA', 'KREKENAVOS', 'SNEKUTIS',
    'JUDEX', 'SAMSONAS', 'UTENOS MĖSA', 'ARVI',
    'MAŽOJI LIETUVA',

    // === BRENDAI - ŽUVIS IR ŠALDYTI (3) ===
    'VIČIUNAI', 'NORVELITA', 'MANTINGA',

    // === BRENDAI - SALDUMYNAI (10) ===
    'PERGALĖ', 'RŪTA', 'LAIMA',
    'KINDER', 'FERRERO', 'MILKA',
    'RITTER SPORT', 'LINDT', 'HARIBO',
    'DR. OETKER',

    // === BRENDAI - MAISTAS (14) ===
    'KNORR', 'BARILLA', 'SANTA MARIA', 'FAZER',
    'FELIX', 'HEINZ', 'HELLMANNS',
    'BONDUELLE', 'HORTEX', 'IGLO',
    'MAGGI', 'PODRAVKA', 'ROLTON',
    'TIKRAS',

    // === BRENDAI - UŽKANDŽIAI (3) ===
    'ESTRELLA', 'PRINGLES', 'CHEETOS',
];

// Category exclusion patterns (case-insensitive partial match)
const EXCLUDED_CATEGORY_PATTERNS = [
    'gėrim', 'alkohol', 'kava', 'arbata', 'sultys', 'nektar',
    'buitin', 'chemij', 'valym',
    'kosmetik', 'higien', 'asmens',
    'vaist', 'medicinin', 'vitamin', 'papild',
    'gyvūn', 'kūdiki', 'vaik',
    'namų apyvok', 'įvairios',
    'drabužiai', 'avalyn', 'tekstil',
    'kita',
];

// Pre-compiled regex for drink/coffee detection (v1 created this per-product call)
const DRINK_PATTERN = /\b(kava|kavos|coffee|arbata|arbatos|sultys|gėrimas|gėrim|limonadas|vanduo|vandens|mineralin|gazuot|alus|alaus|vynas|vynų|degtinė|brendis|viskis|konjak|šampan|sidras|energin|cola|pepsi|fanta|sprite|redbull|monster|kakava|cappuccino|espresso)\b/i;

// Pre-compiled non-food terms set for O(1) lookups
const NON_FOOD_TERMS = [
    'skutimosi', 'skustuvo', 'galvutės', 'orkaitė', 'gruzdintuvė',
    'mikrobang', 'indaplov', 'skalbi', 'dulki', 'siurbl',
    'lygintuv', 'šaldytuv', 'ventiliator', 'radiator', 'šildytuv',
    'lemput', 'baterij', 'įranki', 'gręžtuv', 'pjūkl', 'žoliapjov',
    'dekoratyvin', 'valikl', 'šepet', 'šluot', 'kempinė',
    'servetėl', 'rankšluost', 'popierius', 'maišeli', 'dėžut',
    'kibir', 'skalbini', 'plovikl', 'muilas', 'šampūnas',
    'dušo', 'dezodorant', 'dantų', 'burnos', 'plaukų',
    'odos', 'veido', 'kūno', 'nagų', 'makiažo', 'lūpų',
    'somat', 'fairy', 'finish',
];

interface AkcijosProduct {
    productName: string;
    price: number;
    oldPrice?: number;
    percentageDiscount?: number;
    dateStart: number;
    dateEnd?: number;
    storeName: string;
    storeIcon: string;
    category: string;
    brand?: string;
    imageUrl: string;
    weightValue?: number;
    weightUnit?: string;
    totalWeightKg?: number;
    unitPrice?: number;
    unitPriceUnit?: string;
    id: string;
    publicationTitle?: string;
    dealType?: string;
    tags?: string[];
}

interface AkcijosGroup {
    count: number;
    items: AkcijosProduct[];
    storeName: string;
    publicationTitle: string;
}

interface AkcijosResponse {
    found: number;
    results: AkcijosGroup[];
}

// Concurrency limiter for parallel requests
async function parallelMap<T, R>(
    items: T[],
    fn: (item: T) => Promise<R>,
    concurrency: number,
): Promise<R[]> {
    const results: R[] = [];
    let index = 0;

    async function worker() {
        while (index < items.length) {
            const i = index++;
            results[i] = await fn(items[i]);
        }
    }

    const workers = Array.from({ length: Math.min(concurrency, items.length) }, () => worker());
    await Promise.all(workers);
    return results;
}

export class AkcijosLtAdapter {
    private allProducts: Map<string, Product> = new Map();

    async run(): Promise<{ products: Product[]; byStore: Record<string, Product[]> }> {
        console.log(`[Akcijos.lt v3] Starting API scrape with ${FOOD_KEYWORDS.length} keywords (5 parallel)...`);
        const startTime = Date.now();

        let completed = 0;
        await parallelMap(
            FOOD_KEYWORDS,
            async (keyword) => {
                try {
                    await this.searchKeyword(keyword);
                } catch (err) {
                    console.error(`[Akcijos.lt v3] Error searching "${keyword}":`, err);
                }
                completed++;
                if (completed % 10 === 0) {
                    console.log(`[Akcijos.lt v3] Progress: ${completed}/${FOOD_KEYWORDS.length} keywords, ${this.allProducts.size} unique products`);
                }
                // Small delay to avoid hammering the API
                await new Promise(r => setTimeout(r, 100));
            },
            5, // 5 concurrent requests
        );

        const products = Array.from(this.allProducts.values());
        const duration = Date.now() - startTime;

        // Group by store
        const byStore: Record<string, Product[]> = {};
        for (const p of products) {
            if (!byStore[p.store]) byStore[p.store] = [];
            byStore[p.store].push(p);
        }

        console.log(`[Akcijos.lt v3] Done in ${(duration / 1000).toFixed(1)}s`);
        console.log(`[Akcijos.lt v3] Total unique products: ${products.length}`);
        for (const [store, storeProducts] of Object.entries(byStore)) {
            console.log(`  ${store}: ${storeProducts.length} products`);
        }

        return { products, byStore };
    }

    private async searchKeyword(keyword: string): Promise<void> {
        const url = `https://api.akcijos.lt/search/searchProducts?term=${encodeURIComponent(keyword)}`;
        const resp = await fetch(url);
        if (!resp.ok) {
            console.warn(`[Akcijos.lt v3] HTTP ${resp.status} for "${keyword}"`);
            return;
        }

        const data: AkcijosResponse = await resp.json();

        for (const group of data.results) {
            // Filter by target stores
            if (!TARGET_STORES.has(group.storeName)) continue;

            for (const item of group.items) {
                // Skip if already seen (dedup by ID)
                if (this.allProducts.has(item.id)) continue;

                // Skip excluded categories (partial match)
                const catLower = (item.category || '').toLowerCase();
                if (EXCLUDED_CATEGORY_PATTERNS.some(pat => catLower.includes(pat))) continue;

                // Skip drinks/coffee/alcohol by name or category
                if (this.isDrinkOrCoffee(item, catLower)) continue;

                // Skip non-food products by name
                if (this.isNonFoodProduct(item)) continue;

                // Must have a price
                if (!item.price || item.price <= 0) continue;

                const product = this.convertToProduct(item);
                if (product) {
                    this.allProducts.set(item.id, product);
                }
            }
        }
    }

    private isNonFoodProduct(item: AkcijosProduct): boolean {
        const name = (item.productName || '').toLowerCase();
        return NON_FOOD_TERMS.some(term => name.includes(term));
    }

    private isDrinkOrCoffee(item: AkcijosProduct, catLower: string): boolean {
        const name = (item.productName || '').toLowerCase();
        if (DRINK_PATTERN.test(name)) return true;
        if (catLower.includes('gėrim') || catLower.includes('alkohol')) return true;
        return false;
    }

    private convertToProduct(item: AkcijosProduct): Product | null {
        const storeName = STORE_MAP[item.storeName];
        if (!storeName) {
            // v2 fix: skip unknown stores instead of silently mapping to maxima
            return null;
        }

        // Convert Unix timestamps to Dates
        const validFrom = item.dateStart ? new Date(item.dateStart * 1000) : null;
        const validTo = item.dateEnd ? new Date(item.dateEnd * 1000) : null;

        // Sanity check: if year > 2100, timestamps are likely milliseconds not seconds
        if (validFrom && validFrom.getFullYear() > 2100) {
            return null; // bad timestamp, skip
        }

        // Calculate discount % if not provided
        let discountPercent = item.percentageDiscount || null;
        if (!discountPercent && item.oldPrice && item.price) {
            discountPercent = Math.round((1 - item.price / item.oldPrice) * 100);
        }

        // Build unit info
        let unit: string | null = null;
        if (item.weightValue && item.weightUnit) {
            unit = `${item.weightValue} ${item.weightUnit}`;
        }

        let pricePerUnit: string | null = null;
        if (item.unitPrice && item.unitPriceUnit) {
            pricePerUnit = `${item.unitPrice} ${item.unitPriceUnit}`;
        }

        // Map deal type (skip percentage-only values)
        let dealType: string | null = null;
        if (item.dealType && !/^-?\d+%$/.test(item.dealType.trim())) {
            dealType = item.dealType.trim();
        }

        return {
            store: storeName,
            name: item.productName,
            originalPrice: item.oldPrice || null,
            discountPrice: item.price,
            discountPercent,
            validFrom,
            validTo,
            category: item.category || null,
            imageUrl: item.imageUrl || null,
            unit,
            pricePerUnit,
            description: item.brand ? `${item.brand}` : null,
            storeProductId: item.id,
            productUrl: null,
            sourceSection: item.publicationTitle || 'Akcijos',
            dealType,
            scrapedAt: new Date(),
        };
    }
}
