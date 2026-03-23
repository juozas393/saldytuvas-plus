/**
 * Norfa Lithuania Scraper Adapter
 * 
 * Scrapes food promotions from norfa.lt/akciju-puslapiai/.
 * Norfa uses Cloudflare protection and an age-verification modal.
 * Product content is JS-rendered, requires waiting for hydration.
 */

import { BaseAdapter } from '../../core/BaseAdapter.js';
import { Product, StoreName } from '../../core/types.js';
import { DiscoveredSection, filterFoodSections } from '../../core/sectionClassifier.js';

const NORFA_CONFIG = {
    // First section to navigate to (also used for in-page discovery)
    startUrl: 'https://www.norfa.lt/akciju-puslapiai/akcijos/',
    // Fallback sections if discovery finds nothing extra
    fallbackSections: [
        { name: 'Akcijos', url: 'https://www.norfa.lt/akciju-puslapiai/akcijos/' },
        { name: 'Praktiški pasiūlymai', url: 'https://www.norfa.lt/akciju-puslapiai/praktiski-pasiulymai/' },
    ],
    maxScrollAttempts: 10,
};

interface NorfaScrapedProduct {
    name: string;
    discountPrice: number | null;
    originalPrice: number | null;
    discountPercent: string | null;
    imageUrl: string | null;
    productUrl: string | null;
    validDates: string | null;
    unitInfo: string | null;
}

export class NorfaAdapter extends BaseAdapter {
    readonly storeName: StoreName = 'norfa';
    readonly baseUrl = 'https://www.norfa.lt/akcijos';
    readonly displayName = 'Norfa';

    /**
     * Discover additional sections from navigation links on the current page
     */
    private async discoverSectionsFromPage(): Promise<DiscoveredSection[]> {
        if (!this.page) return [];

        const rawLinks = await this.page.evaluate(() => {
            const links: { name: string; url: string }[] = [];
            const anchors = document.querySelectorAll('a[href*="/akciju-puslapiai/"]');
            for (let i = 0; i < anchors.length; i++) {
                const a = anchors[i] as HTMLAnchorElement;
                const href = a.href;
                const text = a.textContent?.trim() || '';
                if (href && text.length > 2) {
                    links.push({ name: text, url: href });
                }
            }
            return links;
        });

        // Deduplicate by base URL
        const seen = new Set<string>();
        const unique: DiscoveredSection[] = [];
        for (const link of rawLinks) {
            const baseUrl = link.url.split('?')[0].replace(/\/+$/, '');
            if (!seen.has(baseUrl)) {
                seen.add(baseUrl);
                unique.push(link);
            }
        }

        return filterFoodSections(unique, this.displayName);
    }

    /**
     * Main scraping method
     */
    async scrapeOffers(): Promise<Product[]> {
        if (!this.page) throw new Error('Browser not initialized');

        console.log(`[${this.displayName}] Scraping promotions from Norfa`);

        // Step 1: Navigate to start page and handle consent + age gate
        await this.navigateWithRetry(NORFA_CONFIG.startUrl);
        await this.handleAgeVerification();
        await this.handleCookieConsent();
        await this.page.waitForTimeout(2000);

        // Step 2: Discover sections from the nav links on THIS page
        const discoveredSections = await this.discoverSectionsFromPage();
        const sections = discoveredSections.length > 0
            ? discoveredSections
            : NORFA_CONFIG.fallbackSections;

        // Step 3: Scrape each section
        const allRawProducts: NorfaScrapedProduct[] = [];
        const scrapedUrls = new Set<string>();

        for (const section of sections) {
            const normalizedUrl = section.url.split('?')[0].replace(/\/+$/, '');
            if (scrapedUrls.has(normalizedUrl)) continue;
            scrapedUrls.add(normalizedUrl);

            console.log(`[${this.displayName}] Scraping section: ${section.name}`);

            // Only navigate if this isn't the page we're already on
            const currentUrl = this.page.url().split('?')[0].replace(/\/+$/, '');
            if (currentUrl !== normalizedUrl) {
                await this.navigateWithRetry(section.url);
                await this.handleAgeVerification();
                await this.handleCookieConsent();
                await this.page.waitForTimeout(3000);
            }

            // Scroll to load all content
            await this.loadAllContent();

            // Extract products
            const products = await this.extractProducts();
            console.log(`[${this.displayName}]   Found ${products.length} products in ${section.name}`);
            allRawProducts.push(...products);

            await this.delay();
        }

        console.log(`[${this.displayName}] Total raw products: ${allRawProducts.length}`);

        // Step 3: Convert
        const allProducts = allRawProducts.map(p => this.convertToProduct(p));

        // Step 4: Deduplicate
        const uniqueProducts = this.deduplicateProducts(allProducts);
        console.log(`[${this.displayName}] Total unique products: ${uniqueProducts.length}`);

        // Step 5: Filter to food-only products (exclude non-food junk)
        // ── Non-food BRAND names (always non-food when these appear) ──
        const NON_FOOD_BRANDS = [
            'ingco', 'onex', 'clatronic', 'bomann', 'esperanza', 'emos',
            'prohelfer', 'glamour', 'philips', 'red bull racing',
            'tefal', 'princess',
        ];
        // ── Non-food KEYWORDS (tools, electronics, hygiene, cleaning, garden, clothing) ──
        const NON_FOOD_KEYWORDS = [
            // Tools & hardware
            'purkštuv', 'atsuktuv', 'replės', 'gręžtuv', 'pjūklas', 'terkšlė',
            'gulsčiukas', 'mentelė', 'trintuvas', 'spaustuvas', 'šalmas',
            'suvirinimo', 'montavimo', 'švitrini', 'įranki',
            // Electronics & appliances
            'skustuvas', 'ausinės', 'ausinių', 'džiovintuvas', 'garintuvas',
            'kirpimo mašinėlė', 'kolonėlė', 'klaviatūra', 'pelė onex',
            'irigatorius', 'virdulys', 'orkaitė', 'grilis onex', 'plaktuvas clatronic',
            'plakiklis bomann', 'kavamalė', 'kavos malūnėlis', 'mėsmalė',
            'lygintuvas',
            'belaidės tws', 'bluetooth', 'durų skambutis',
            'įkrovikl', 'elementai gp', 'baterij', 'akumuliator',
            // Cleaning & household
            'šiukšlių maišai', 'šluostė', 'skalbimo gel', 'plovikl',
            'rankšluoščiai', 'tualetinis popierius',
            'oro gaiviklis', 'namų kvapas', 'indaplov',
            'drėgnos servetėlės', 'servetėlės superfresh',
            // Hygiene & cosmetics
            'ausų krapštukai', 'lūpų balzamas', 'dezodorantas', 'šampūnas',
            'veido kremas', 'kūno kremas', 'dantų pasta', 'plaukų dažai',
            'nagų lakas', 'kraikas',
            // Clothing & accessories
            'kojinės', 'pirštinės', 'šlepetės', 'avalynė', 'pėdkelnės',
            // Garden & outdoor
            'medeliams baltinti', 'šepetys medeliams', 'daiginimo padėklas',
            'aušinimo skystis',
            // Kitchenware (non-food containers)
            'stiklinis indas', 'stiklinis indelis', 'dubuo su trintuve',
            'termosas', 'stiklinė',
            // Supplements (not food)
            'maisto papildas',
            // Toys
            'žaislas', 'lego', 'dėlionė',
        ];

        const validProducts = uniqueProducts.filter(p => {
            if (p.discountPrice <= 0) return false;
            const nameLower = p.name.toLowerCase();
            // Check brand blacklist
            for (const brand of NON_FOOD_BRANDS) {
                if (nameLower.includes(brand)) return false;
            }
            // Check keyword blacklist
            for (const kw of NON_FOOD_KEYWORDS) {
                if (nameLower.includes(kw)) return false;
            }
            return true;
        });
        console.log(`[${this.displayName}] Valid food products: ${validProducts.length}`);

        return validProducts;
    }

    /**
     * Handle age verification modal ("Ar Jums jau yra 20 metų?" → "TAIP")
     */
    private async handleAgeVerification(): Promise<void> {
        if (!this.page) return;

        try {
            await this.page.waitForTimeout(1000);
            const selectors = [
                'button:has-text("TAIP")',
                'button:has-text("Taip")',
                'a:has-text("TAIP")',
                'a:has-text("Taip")',
                '[class*="age-verify"] button',
                '[class*="age"] a',
            ];

            for (const sel of selectors) {
                try {
                    const btn = await this.page.$(sel);
                    if (btn) {
                        await btn.click();
                        console.log(`[${this.displayName}] Passed age verification`);
                        await this.page.waitForTimeout(1000);
                        return;
                    }
                } catch { /* try next */ }
            }
        } catch (error) {
            // Age gate might not appear
        }
    }

    /**
     * Handle cookie consent
     */
    private async handleCookieConsent(): Promise<void> {
        if (!this.page) return;

        try {
            const selectors = [
                'button:has-text("Sutinku")',
                'button:has-text("SUTINKU")',
                'button:has-text("Priimti")',
                '#CybotCookiebotDialogBodyLevelButtonLevelOptinAllowAll',
                '[class*="accept"]',
            ];

            for (const sel of selectors) {
                try {
                    const btn = await this.page.$(sel);
                    if (btn) {
                        await btn.click();
                        console.log(`[${this.displayName}] Accepted cookie consent`);
                        await this.page.waitForTimeout(500);
                        return;
                    }
                } catch { /* try next */ }
            }
        } catch (error) {
            // No consent needed
        }
    }

    /**
     * Scroll and load all content
     */
    private async loadAllContent(): Promise<void> {
        if (!this.page) return;

        let previousCount = 0;
        let stableRounds = 0;

        for (let attempt = 0; attempt < NORFA_CONFIG.maxScrollAttempts; attempt++) {
            const viewportHeight = await this.page.evaluate(() => window.innerHeight);
            const totalHeight = await this.page.evaluate(() => document.body.scrollHeight);

            for (let pos = 0; pos < totalHeight; pos += viewportHeight * 0.5) {
                await this.page.evaluate((y) => window.scrollTo(0, y), pos);
                await this.page.waitForTimeout(200);
            }

            await this.page.waitForTimeout(1000);

            // Try load more
            try {
                const btn = await this.page.$('button:has-text("Daugiau"), [class*="load-more"], [class*="show-more"]');
                if (btn) {
                    await btn.click();
                    await this.page.waitForTimeout(2000);
                }
            } catch { /* no button */ }

            const currentCount = await this.page.evaluate(() => {
                return document.querySelectorAll('[class*="product"], [class*="card"], [class*="item"], article').length;
            });

            if (currentCount === previousCount) {
                stableRounds++;
                if (stableRounds >= 2) {
                    console.log(`[${this.displayName}] ✅ All content loaded (${currentCount} elements)`);
                    break;
                }
            } else {
                stableRounds = 0;
                previousCount = currentCount;
            }
        }
    }

    /**
     * Extract products using ES5-safe evaluate
     */
    private async extractProducts(): Promise<NorfaScrapedProduct[]> {
        if (!this.page) throw new Error('Browser not initialized');

        const rawProducts = await this.page.evaluate(() => {
            var products = [];

            // Norfa product cards
            var cards = document.querySelectorAll(
                '[class*="product"], [class*="offer"], [class*="card"], article, .akcija-item'
            );

            for (var i = 0; i < cards.length; i++) {
                var card = cards[i];
                try {
                    // Get name
                    var nameEl = card.querySelector('h3, h4, [class*="title"], [class*="name"], .product-name');
                    var name = nameEl ? nameEl.textContent.trim() : '';
                    if (!name || name.length < 3) continue;

                    // Skip if it's navigation/header text
                    if (name === 'Akcijos' || name === 'Praktiški pasiūlymai' || name.includes('Privatumo')) continue;

                    // Get discount price
                    var discountPrice = null;
                    var priceEls = card.querySelectorAll('[class*="price"], [class*="kaina"], .price, .sale-price, .new-price');
                    for (var p = 0; p < priceEls.length; p++) {
                        var priceText = priceEls[p].textContent || '';
                        var priceMatch = priceText.match(/(\d+)[,.](\d{2})\s*€?/);
                        if (priceMatch) {
                            var val = parseFloat(priceMatch[1] + '.' + priceMatch[2]);
                            if (!isNaN(val) && val > 0 && val < 1000) {
                                discountPrice = val;
                                break;
                            }
                        }
                    }

                    // Get original price
                    var originalPrice = null;
                    var oldEls = card.querySelectorAll('s, del, [class*="old"], [class*="original"], [class*="strike"], [class*="regular"]');
                    for (var o = 0; o < oldEls.length; o++) {
                        var oldText = oldEls[o].textContent || '';
                        var oldMatch = oldText.match(/(\d+)[,.](\d{2})/);
                        if (oldMatch) {
                            originalPrice = parseFloat(oldMatch[1] + '.' + oldMatch[2]);
                            break;
                        }
                    }

                    // Get discount %
                    var discountPercent = null;
                    var discEls = card.querySelectorAll('[class*="discount"], [class*="badge"], [class*="nuolaida"], [class*="percent"]');
                    for (var d = 0; d < discEls.length; d++) {
                        var discText = discEls[d].textContent || '';
                        var percMatch = discText.match(/-?\s*(\d+)\s*%/);
                        if (percMatch) {
                            discountPercent = '-' + percMatch[1] + '%';
                            break;
                        }
                    }

                    // Get validity dates
                    var validDates = null;
                    var dateEls = card.querySelectorAll('[class*="date"], [class*="valid"], time, small');
                    for (var dd = 0; dd < dateEls.length; dd++) {
                        var dateText = dateEls[dd].textContent || '';
                        if (dateText.match(/\d{2}[\.\-]\d{2}/)) {
                            validDates = dateText.trim();
                            break;
                        }
                    }

                    // Get image
                    var imgEl = card.querySelector('img');
                    var imageUrl = imgEl ? (imgEl.src || imgEl.getAttribute('data-src')) : null;

                    // Get product URL
                    var linkEl = card.querySelector('a[href]');
                    var productUrl = linkEl ? linkEl.getAttribute('href') : null;
                    if (productUrl && !productUrl.startsWith('http')) {
                        productUrl = 'https://www.norfa.lt' + productUrl;
                    }

                    // Get unit info
                    var unitInfo = null;
                    var allText = card.textContent || '';
                    var unitMatch = allText.match(/(\d+(?:[,\.]\d+)?\s*(?:g|kg|l|ml|vnt))/i);
                    if (unitMatch) {
                        unitInfo = unitMatch[1];
                    }

                    products.push({
                        name: name,
                        discountPrice: discountPrice,
                        originalPrice: originalPrice,
                        discountPercent: discountPercent,
                        validDates: validDates,
                        imageUrl: imageUrl,
                        productUrl: productUrl,
                        unitInfo: unitInfo,
                    });
                } catch (e) {
                    // Skip failed product
                }
            }

            return products;
        });

        return rawProducts as NorfaScrapedProduct[];
    }

    /**
     * Convert to standard Product format
     */
    private convertToProduct(raw: NorfaScrapedProduct): Product {
        const { validFrom, validTo } = this.parseDates(raw.validDates);

        let discountPercent: number | null = null;
        if (raw.discountPercent) {
            const match = raw.discountPercent.match(/(\d+)/);
            if (match) discountPercent = parseInt(match[1], 10);
        }
        if (!discountPercent && raw.originalPrice && raw.discountPrice) {
            discountPercent = this.calculateDiscount(raw.originalPrice, raw.discountPrice);
        }

        return this.createProduct({
            name: raw.name,
            originalPrice: raw.originalPrice,
            discountPrice: raw.discountPrice || 0,
            discountPercent,
            validFrom,
            validTo,
            category: null,
            imageUrl: raw.imageUrl,
            unit: raw.unitInfo,
            pricePerUnit: null,
            description: null,
            storeProductId: null,
            productUrl: raw.productUrl,
            sourceSection: 'Akcijos',
        });
    }

    /**
     * Parse date strings
     */
    private parseDates(dateStr: string | null): { validFrom: Date | null; validTo: Date | null } {
        if (!dateStr) return { validFrom: null, validTo: null };

        try {
            const rangeMatch = dateStr.match(/(\d{2})[.\-\s](\d{2})\s*[-–]\s*(\d{2})[.\-\s](\d{2})/);
            if (rangeMatch) {
                const currentYear = new Date().getFullYear();
                const fromMonth = parseInt(rangeMatch[1], 10) - 1;
                const fromDay = parseInt(rangeMatch[2], 10);
                const toMonth = parseInt(rangeMatch[3], 10) - 1;
                const toDay = parseInt(rangeMatch[4], 10);

                const validFrom = new Date(currentYear, fromMonth, fromDay);
                const validTo = new Date(currentYear, toMonth, toDay);
                if (validTo < validFrom) validTo.setFullYear(currentYear + 1);

                return { validFrom, validTo };
            }
            return { validFrom: null, validTo: null };
        } catch {
            return { validFrom: null, validTo: null };
        }
    }

    /**
     * Deduplicate by name+price
     */
    private deduplicateProducts(products: Product[]): Product[] {
        const seen = new Set<string>();
        return products.filter(p => {
            const key = `${p.name}-${p.discountPrice}`;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });
    }
}
