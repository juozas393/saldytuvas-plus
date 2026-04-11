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
const NORFA_NON_FOOD = /\b(purkštuv|atsuktuv|replės|gręžtuv|pjūklas|terkšlė|gulsčiukas|šalmas|suvirinimo|švitrini|įranki|skustuvas|ausinės|ausinių|džiovintuvas|garintuvas|kolonėlė|klaviatūra|pelė onex|irigatorius|lygintuvas|bluetooth|įkrovikl|elementai gp|baterij|akumuliator|šiukšlių maišai|šluostė|skalbimo|plovikl|rankšluoščiai|tualetinis popierius|oro gaiviklis|indaplov|servetėlės|ausų krapštukai|dezodorantas|šampūnas|veido kremas|kūno kremas|dantų pasta|plaukų dažai|nagų lakas|kraikas|kojinės|pirštinės|šlepetės|avalynė|pėdkelnės|daiginimo|aušinimo skystis|stiklinis ind|termosas|maisto papildas|žaislas|lego|dėlionė|ingco|onex|clatronic|bomann|esperanza|emos|prohelfer|glamour|philips|tefal|princess)\b/i;

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

                // Discount %
                const discountEl = $el.find('.c-product__discount, .c-product__badge').first();
                const percMatch = discountEl.text().match(/-?\s*(\d+)\s*%/);
                const discountPercent = percMatch
                    ? parseInt(percMatch[1], 10)
                    : calcDiscount(originalPrice, discountPrice);

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

                // Filter non-food
                if (NORFA_NON_FOOD.test(name.toLowerCase())) return;
                if (!isFoodProduct(name)) return;

                allProducts.push({
                    store: 'norfa',
                    name,
                    originalPrice,
                    discountPrice,
                    discountPercent,
                    validFrom,
                    validTo,
                    category: null,
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
                    const priceTag = $card.find('.price-tag.card__price, .card__price').first();
                    const wholeEl = priceTag.children('span').first();
                    const centsEl = priceTag.find('sup').first();
                    const whole = wholeEl.text().replace(/[^0-9]/g, '');
                    const cents = centsEl.text().replace(/[^0-9]/g, '') || '00';
                    const discountPrice = whole ? parseFloat(`${whole}.${cents.padStart(2, '0')}`) : null;
                    if (!discountPrice || discountPrice <= 0) return;

                    // Old price
                    const oldTag = $card.find('.old-price-tag.card__old-price, .card__old-price').first();
                    const oldText = oldTag.text();
                    const oldMatch = oldText.match(/(\d+)[,.](\d{2})/);
                    const originalPrice = oldMatch ? parseFloat(`${oldMatch[1]}.${oldMatch[2]}`) : null;

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

                    // Unit price
                    const pricePerUnit = $card.find('.card__price-per').first().text().trim() || null;

                    // Image
                    const imgEl = $card.find('img').first();
                    const imageUrl = imgEl.attr('src') || imgEl.attr('data-src') || null;

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

    // Save per-store JSON files
    const stores = { iki, norfa, rimi, maxima, lidl };
    let total = 0;

    for (const [storeName, products] of Object.entries(stores)) {
        const filename = `./${storeName}_products.json`;
        fs.writeFileSync(filename, JSON.stringify(products, null, 2));
        console.log(`Saved ${products.length} products to ${filename}`);
        total += products.length;
    }

    // Save combined file
    const all = [...iki, ...norfa, ...rimi, ...maxima, ...lidl];
    fs.writeFileSync('./all_products.json', JSON.stringify(all, null, 2));

    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`\n=== TOTAL: ${total} products in ${duration}s ===`);
}

main().catch(err => {
    console.error('FATAL ERROR:', err);
    process.exit(1);
});
