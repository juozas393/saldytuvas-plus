/**
 * Akcijos.lt API Adapter
 * 
 * Uses api.akcijos.lt/search/searchProducts to fetch promotions
 * from all Lithuanian stores with accurate dates, prices, and images.
 * Replaces individual store scrapers (Rimi, IKI, Lidl, Norfa).
 */

import { Product, StoreName } from '../../core/types.js';

// Store name mapping from Akcijos.lt → our StoreName
const STORE_MAP: Record<string, StoreName> = {
    'Maxima': 'maxima',
    'Iki': 'iki',
    'Rimi': 'rimi',
    'Lidl': 'lidl',
    'Norfa': 'norfa',
};

// Only include these stores
const TARGET_STORES = new Set(Object.keys(STORE_MAP));

// Lithuanian food search terms — comprehensive list for maximum product discovery
const FOOD_KEYWORDS = [
    // Pieno produktai
    'pienas', 'sviestas', 'grietinė', 'grietinėlė', 'jogurtas', 'kefyras',
    'varškė', 'sūris', 'kiaušiniai', 'mozzarella', 'mascarpone', 'parmezanas',
    'feta', 'gouda', 'ementalis', 'čederis', 'kamemberts', 'bri',
    'sūrelis', 'skuta', 'išrūgos', 'pienelis', 'kremas',
    // Mėsa ir mėsos gaminiai
    'kiauliena', 'jautiena', 'vištiena', 'kalakutiena', 'mėsa', 'faršas',
    'dešra', 'kumpis', 'šoninė', 'dešrelės', 'skilandis', 'kumpio',
    'karbonadą', 'šonkauliukai', 'sprandinė', 'nugarinė', 'filė',
    'kepenys', 'pjausnys', 'kotletas', 'kebabas',
    'rūkytas', 'vytintas', 'virtas',
    // Žuvis ir jūros gėrybės
    'žuvis', 'lašiša', 'silkė', 'krevetės', 'menkė', 'tunų',
    'upėtakis', 'skumbrė', 'pangasius', 'karpis', 'lydeka',
    // Vaisiai ir uogos
    'obuoliai', 'bananai', 'braškės', 'vynuogės', 'apelsinai',
    'citrina', 'avokadas', 'arbūzas', 'melionas', 'persikai',
    'nektarinai', 'mangai', 'ananasai', 'kiviai', 'kriaušės',
    'slyvos', 'vyšnios', 'mėlynės', 'aviečiai', 'spanguolės',
    // Daržovės
    'pomidorai', 'agurkai', 'bulvės', 'morkos', 'svogūnai',
    'paprikos', 'salotos', 'kopūstai', 'brokoliai', 'žiediniai kopūstai',
    'cukinija', 'baklažanai', 'ridikai', 'špinatai', 'česnakų',
    'burokėliai', 'petražolės', 'krapai', 'rukola', 'kukurūzai',
    'grybai', 'pievagrybiai',
    // Duona ir kepiniai
    'duona', 'batonas', 'bandelės', 'pyragėliai', 'croissant',
    'lavašas', 'pita', 'tortilija', 'sumuštinis',
    // Bakalėja
    'miltai', 'cukrus', 'ryžiai', 'makaronai', 'aliejus', 'actas',
    'druska', 'pipirai', 'padažas', 'kečupas', 'majonezas',
    'konservai', 'dribsniai', 'muesli', 'košė', 'kruopos',
    'grikiai', 'avižos', 'sojos', 'pomidorų',
    // Šaldytas maistas
    'šaldytas', 'šaldyti', 'ledai', 'pica', 'koldūnai', 'cepelinai',
    'blynai', 'šaldyta daržovių', 'šaldyta žuvis',
    // Saldumynai ir užkandžiai
    'šokoladas', 'saldainiai', 'sausainiai', 'pyragas', 'tortas',
    'traškučiai', 'riešutai', 'desertas', 'marmeladas',
    'batonėlis', 'vaflis', 'meduolis', 'biskvitas',
    // Augaliniai / vegetariški
    'tofu', 'hummusas', 'augalinis', 'veganas',
    // Kiti maisto produktai
    'medus', 'uogienė', 'margarinas', 'grūdai', 'trapučiai',
    'majonezo', 'garstyčios', 'citrinų', 'alyvuogės',
    // Populiarūs Lietuvos brendai — padeda rasti produktus per pavadinimą
    'ROKIŠKIO', 'DVARO', 'VILKYŠKIŲ', 'ŽEMAITIJOS', 'PILOS',
    'KARUMS', 'AMRITA', 'MLEKOVITA', 'PRESIDENT',
    'RIMI', 'IKI', 'BIOVELA', 'KREKENAVOS',
    // Bendriniai terminai (matavimo vienetai, kainos)
    '1 kg', '500 g', '250 g', '200 g', '100 g',
    'vnt', 'rieb', 'ekologiškas',
    // Papildomi raktažodžiai dėl platesnio padengimo
    'marinuotas', 'rauginti', 'sūdyta', 'gruzdintas',
    'keptas', 'troškinta', 'šviežia', 'natūralus',
    'naminis', 'lietuviškas', 'fermentinis',
];

// Exclude categories that are not food
// Exclude categories that are not food — uses partial matching (includes)
const EXCLUDED_CATEGORY_PATTERNS = [
    'gėrim', 'alkohol', 'kava', 'arbata', 'sultys', 'nektar',
    'buitin', 'chemij', 'valym',
    'kosmetik', 'higien', 'asmens',
    'vaist', 'medicinin', 'vitamin', 'papild',
    'gyvūn', 'kūdiki', 'vaik',
    'namų apyvok', 'įvairios',
    'drabužiai', 'avalyn', 'tekstil',
    'kita', // catch-all for non-food items
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

export class AkcijosLtAdapter {
    private allProducts: Map<string, Product> = new Map();

    async run(): Promise<{ products: Product[]; byStore: Record<string, Product[]> }> {
        console.log(`[Akcijos.lt] Starting API scrape with ${FOOD_KEYWORDS.length} keywords...`);
        const startTime = Date.now();

        for (let i = 0; i < FOOD_KEYWORDS.length; i++) {
            const keyword = FOOD_KEYWORDS[i];
            try {
                await this.searchKeyword(keyword);
                // Small delay between requests
                if (i < FOOD_KEYWORDS.length - 1) {
                    await new Promise(r => setTimeout(r, 300));
                }
            } catch (err) {
                console.error(`[Akcijos.lt] Error searching "${keyword}":`, err);
            }

            // Progress log every 10 keywords
            if ((i + 1) % 10 === 0) {
                console.log(`[Akcijos.lt] Progress: ${i + 1}/${FOOD_KEYWORDS.length} keywords, ${this.allProducts.size} unique products`);
            }
        }

        const products = Array.from(this.allProducts.values());
        const duration = Date.now() - startTime;

        // Group by store
        const byStore: Record<string, Product[]> = {};
        for (const p of products) {
            if (!byStore[p.store]) byStore[p.store] = [];
            byStore[p.store].push(p);
        }

        console.log(`[Akcijos.lt] Done in ${(duration / 1000).toFixed(1)}s`);
        console.log(`[Akcijos.lt] Total unique products: ${products.length}`);
        for (const [store, storeProducts] of Object.entries(byStore)) {
            console.log(`  ${store}: ${storeProducts.length} products`);
        }

        return { products, byStore };
    }

    private async searchKeyword(keyword: string): Promise<void> {
        const url = `https://api.akcijos.lt/search/searchProducts?term=${encodeURIComponent(keyword)}`;
        const resp = await fetch(url);
        if (!resp.ok) {
            console.warn(`[Akcijos.lt] HTTP ${resp.status} for "${keyword}"`);
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

                // Skip drinks/coffee/alcohol by name or tags
                if (this.isDrinkOrCoffee(item)) continue;

                // Skip non-food products by name
                if (this.isNonFoodProduct(item)) continue;

                // Must have a price
                if (!item.price || item.price <= 0) continue;

                const product = this.convertToProduct(item);
                this.allProducts.set(item.id, product);
            }
        }
    }

    private isNonFoodProduct(item: AkcijosProduct): boolean {
        const name = (item.productName || '').toLowerCase();
        const nonFoodTerms = [
            'skutimosi', 'skustuvo', 'galvutės', 'orkaitė', 'gruzdintuvė',
            'mikrobang', 'indaplov', 'skalbi', 'dulki', 'siurbl',
            'lygintuv', 'šaldytuv', 'ventiliator', 'radiator', 'šildytuv',
            'lemput', 'baterij', 'įranki', 'gręžtuv', 'pjūkl', 'žoliapjov',
            'dekoratyvin', 'valikl', 'šepet', 'šluot', 'kempinė',
            'servetėl', 'rankšluost', 'popierius', 'maišeli', 'dėžut',
            'kibir', 'skalbini', 'plovikl', 'muilas', 'šampūnas',
            'dušo', 'dezodorant', 'dantų', 'burnos', 'plaukų',
            'odos', 'veido', 'kūno', 'nagų', 'makiažo', 'lūpų',
            'somat', 'fairy', 'finish', // cleaning brands
        ];
        return nonFoodTerms.some(term => name.includes(term));
    }

    private isDrinkOrCoffee(item: AkcijosProduct): boolean {
        const name = (item.productName || '').toLowerCase();
        const category = (item.category || '').toLowerCase();
        const drinkPatterns = /\b(kava|kavos|coffee|arbata|arbatos|sultys|gėrimas|gėrim|limonadas|vanduo|vandens|mineralin|gazuot|alus|alaus|vynas|vynų|degtinė|brendis|viskis|konjak|šampan|sidras|energin|cola|pepsi|fanta|sprite|redbull|monster|kakava|cappuccino|espresso)\b/i;

        if (drinkPatterns.test(name)) return true;
        if (category.includes('gėrim') || category.includes('alkohol') || category.includes('kava') || category.includes('arbata')) return true;

        return false;
    }

    private convertToProduct(item: AkcijosProduct): Product {
        const storeName = STORE_MAP[item.storeName] || 'maxima';

        // Convert Unix timestamps to Dates
        const validFrom = item.dateStart ? new Date(item.dateStart * 1000) : null;
        const validTo = item.dateEnd ? new Date(item.dateEnd * 1000) : null;

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

        // Map deal type (skip percentage-only values, they're redundant with discountPercent)
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
