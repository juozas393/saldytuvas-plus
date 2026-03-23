/**
 * IKI Lithuania Scraper Adapter
 * 
 * Scrapes food promotions from iki.lt weekly offers page.
 * IKI uses Bootstrap-based layout with `.akcijoskortele` product cards.
 * Price structure: .price_int + .price_cents for discount/original prices.
 * Some products only have discount % without specific prices.
 */

import { BaseAdapter } from '../../core/BaseAdapter.js';
import { Product, StoreName } from '../../core/types.js';
import { DiscoveredSection, filterFoodSections } from '../../core/sectionClassifier.js';

const IKI_CONFIG = {
    // Discovery entry point
    discoveryUrl: 'https://iki.lt/akcijos/',
    // Fallback sections if discovery finds nothing
    fallbackSections: [
        { name: 'Savaitės akcijos', url: 'https://iki.lt/akcijos/savaites-akcijos/' },
        { name: 'Savaitgalio pasiūlymai', url: 'https://iki.lt/akcijos/savaitgalio-akcijos/' },
    ],
};

interface IkiScrapedProduct {
    name: string;
    description: string | null;
    discountPrice: number | null;
    originalPrice: number | null;
    discountPercent: string | null;
    validDates: string | null;
    imageUrl: string | null;
    productUrl: string | null;
    unitInfo: string | null;
}

export class IkiAdapter extends BaseAdapter {
    readonly storeName: StoreName = 'iki';
    readonly baseUrl = 'https://iki.lt/akcijos/';
    readonly displayName = 'IKI';

    /**
     * Discover promotional sections dynamically from /akcijos/ page
     */
    private async discoverSections(): Promise<DiscoveredSection[]> {
        if (!this.page) throw new Error('Browser not initialized');

        console.log(`[${this.displayName}] Discovering sections from ${IKI_CONFIG.discoveryUrl}`);
        await this.navigateWithRetry(IKI_CONFIG.discoveryUrl);
        await this.handleCookieConsent();
        await this.page.waitForTimeout(2000);

        // Find promotion section links (exclude category filters)
        const rawLinks = await this.page.evaluate(() => {
            const links: { name: string; url: string }[] = [];
            const anchors = document.querySelectorAll('a[href*="/akcijos/"], a[href*="/specialios-akcijos/"]');
            for (let i = 0; i < anchors.length; i++) {
                const a = anchors[i] as HTMLAnchorElement;
                const href = a.href;
                const text = a.textContent?.trim() || '';
                // Skip category filter links and generic "Visos kategorijos"
                if (href.includes('/akciju-kategorijos/')) continue;
                if (text === 'Visos kategorijos') continue;
                if (href && text.length > 2) {
                    links.push({ name: text, url: href });
                }
            }
            return links;
        });

        // Deduplicate by URL
        const seen = new Set<string>();
        const unique: DiscoveredSection[] = [];
        for (const link of rawLinks) {
            const baseUrl = link.url.replace(/\/+$/, '');
            if (!seen.has(baseUrl)) {
                seen.add(baseUrl);
                unique.push(link);
            }
        }

        const foodSections = filterFoodSections(unique, this.displayName);

        if (foodSections.length === 0) {
            console.log(`[${this.displayName}] Discovery found 0 sections, using fallbacks`);
            return IKI_CONFIG.fallbackSections;
        }

        return foodSections;
    }

    async scrapeOffers(): Promise<Product[]> {
        if (!this.page) throw new Error('Browser not initialized');

        console.log(`[${this.displayName}] Scraping promotions from IKI`);

        // Step 1: Discover sections dynamically
        const sections = await this.discoverSections();

        const allRawProducts: IkiScrapedProduct[] = [];

        for (const section of sections) {
            console.log(`[${this.displayName}] Scraping section: ${section.name}`);
            await this.navigateWithRetry(section.url);
            await this.page.waitForTimeout(3000);

            // Scroll to load all lazy content
            await this.scrollEntirePage();

            const products = await this.extractProducts();
            console.log(`[${this.displayName}]   Found ${products.length} products in ${section.name}`);
            allRawProducts.push(...products);

            await this.delay();
        }

        console.log(`[${this.displayName}] Total raw products: ${allRawProducts.length}`);

        const allProducts = allRawProducts.map(p => this.convertToProduct(p));
        const uniqueProducts = this.deduplicateProducts(allProducts);
        console.log(`[${this.displayName}] Total unique products: ${uniqueProducts.length}`);

        // Keep all products that have at least a discount % or a price
        const validProducts = uniqueProducts.filter(p =>
            p.discountPrice > 0 || p.discountPercent !== null
        );
        console.log(`[${this.displayName}] Valid products: ${validProducts.length}`);

        return validProducts;
    }

    private async scrollEntirePage(): Promise<void> {
        if (!this.page) return;

        let previousProductCount = 0;
        let stableRounds = 0;
        const maxAttempts = 50; // Safety limit

        for (let attempt = 0; attempt < maxAttempts; attempt++) {
            // Scroll incrementally through the page
            const viewportHeight = await this.page.evaluate(() => window.innerHeight);
            const totalHeight = await this.page.evaluate(() => document.body.scrollHeight);

            for (let pos = 0; pos < totalHeight; pos += viewportHeight * 0.7) {
                await this.page.evaluate((y) => window.scrollTo(0, y), pos);
                await this.page.waitForTimeout(150);
            }

            // Scroll to absolute bottom
            await this.page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
            await this.page.waitForTimeout(1000);

            // Try to click "load more" buttons
            try {
                const loadMoreSelectors = [
                    'button:has-text("Rodyti daugiau")',
                    'button:has-text("Daugiau")',
                    'button:has-text("Krauti daugiau")',
                    '[class*="load-more"]',
                    '[class*="show-more"]',
                ];
                for (const sel of loadMoreSelectors) {
                    const btn = await this.page.$(sel);
                    if (btn) {
                        await btn.click();
                        console.log(`[${this.displayName}]   Clicked load-more button`);
                        await this.page.waitForTimeout(2000);
                        break;
                    }
                }
            } catch { /* no button */ }

            // Count product cards
            const currentCount = await this.page.evaluate(() => {
                return document.querySelectorAll('.akcijoskortele, [class*="product-card"], [class*="offer-card"]').length;
            });

            if (currentCount === previousProductCount) {
                stableRounds++;
                if (stableRounds >= 3) {
                    console.log(`[${this.displayName}]   All content loaded (${currentCount} cards after ${attempt + 1} scroll rounds)`);
                    break;
                }
            } else {
                console.log(`[${this.displayName}]   Loaded ${currentCount} cards (round ${attempt + 1})`);
                stableRounds = 0;
                previousProductCount = currentCount;
            }
        }

        // Scroll back to top
        await this.page.evaluate(() => window.scrollTo(0, 0));
        await this.page.waitForTimeout(300);
    }

    private async handleCookieConsent(): Promise<void> {
        if (!this.page) return;

        try {
            const selectors = [
                'button:has-text("Sutinku")',
                'button:has-text("SUTINKU")',
                '#CybotCookiebotDialogBodyLevelButtonLevelOptinAllowAll',
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
        } catch { /* no consent needed */ }
    }

    /**
     * Extract products using IKI-specific selectors (ES5-safe evaluate)
     * 
     * DOM Structure:
     * .akcijoskortele (card container)
     *   .akcija_bg
     *     .akcija_title (product name)
     *     .akcija_description (description + validity)
     *     .price_int / .price_cents (prices)
     *     .akcija__image .card-img-top (image)
     *     .promo_shop_block a (buy link)
     */
    private async extractProducts(): Promise<IkiScrapedProduct[]> {
        if (!this.page) throw new Error('Browser not initialized');

        const rawProducts = await this.page.evaluate(() => {
            var products = [];
            var cards = document.querySelectorAll('.akcijoskortele');

            for (var i = 0; i < cards.length; i++) {
                var card = cards[i];
                try {
                    // Get product name
                    var nameEl = card.querySelector('.akcija_title');
                    var name = nameEl ? nameEl.textContent.trim() : '';
                    if (!name || name.length < 2) continue;

                    // Get description and validity dates
                    var descEls = card.querySelectorAll('.akcija_description');
                    var description = null;
                    var validDates = null;

                    for (var d = 0; d < descEls.length; d++) {
                        var descText = descEls[d].textContent.trim();
                        if (descText.indexOf('Galioja') !== -1) {
                            validDates = descText;
                        } else if (descText.length > 2 && !description) {
                            description = descText;
                        }
                    }

                    // --- DISCOUNT PRICE: use proper DOM selectors ---
                    var discountPrice = null;
                    var priceWrapper = card.querySelector('.price_block_wrapper');
                    if (priceWrapper) {
                        // Get direct price_int child (not the one inside price_old_block)
                        var priceIntEl = priceWrapper.querySelector(':scope > .price_int, :scope > div > .price_int');
                        var priceCentsEl = priceWrapper.querySelector(':scope > .price_cents, :scope > div > .price_cents');

                        // Fallback: get any price_int not inside price_old_block
                        if (!priceIntEl) {
                            var allPriceInts = priceWrapper.querySelectorAll('.price_int');
                            var oldBlock = priceWrapper.querySelector('.price_old_block');
                            for (var pi = 0; pi < allPriceInts.length; pi++) {
                                if (!oldBlock || !oldBlock.contains(allPriceInts[pi])) {
                                    priceIntEl = allPriceInts[pi];
                                    break;
                                }
                            }
                        }
                        if (!priceCentsEl) {
                            var allPriceCents = priceWrapper.querySelectorAll('.price_cents');
                            var oldBlock2 = priceWrapper.querySelector('.price_old_block');
                            for (var pc = 0; pc < allPriceCents.length; pc++) {
                                if (!oldBlock2 || !oldBlock2.contains(allPriceCents[pc])) {
                                    priceCentsEl = allPriceCents[pc];
                                    break;
                                }
                            }
                        }

                        if (priceIntEl) {
                            var intVal = priceIntEl.textContent.replace(/[^0-9]/g, '');
                            var centsVal = priceCentsEl ? priceCentsEl.textContent.replace(/[^0-9]/g, '') : '00';
                            if (intVal) {
                                discountPrice = parseFloat(intVal + '.' + centsVal.padStart(2, '0'));
                            }
                        }
                    }

                    // --- ORIGINAL PRICE: from price_old_block ---
                    var originalPrice = null;
                    var oldPriceBlock = card.querySelector('.price_old_block');
                    if (oldPriceBlock) {
                        var oldIntEl = oldPriceBlock.querySelector('.price_int');
                        var oldCentsEl = oldPriceBlock.querySelector('.price_cents');
                        if (oldIntEl) {
                            var oldIntVal = oldIntEl.textContent.replace(/[^0-9]/g, '');
                            var oldCentsVal = oldCentsEl ? oldCentsEl.textContent.replace(/[^0-9]/g, '') : '00';
                            if (oldIntVal) {
                                originalPrice = parseFloat(oldIntVal + '.' + oldCentsVal.padStart(2, '0'));
                            }
                        }
                    }

                    // --- DISCOUNT PERCENTAGE: from percentage_tag or price_block_red_wrapper ---
                    var discountPercent = null;
                    var percEl = card.querySelector('.percentage_tag, .price_block_red_wrapper');
                    if (percEl) {
                        var percText = percEl.textContent.trim();
                        var percMatch = percText.match(/-\s*(\d+)\s*%/);
                        if (percMatch) {
                            discountPercent = '-' + percMatch[1] + '%';
                        }
                    }
                    // Fallback: text-based search
                    if (!discountPercent) {
                        var cardText = card.textContent || '';
                        var fallbackMatch = cardText.match(/-\s*(\d+)\s*%/);
                        if (fallbackMatch) {
                            discountPercent = '-' + fallbackMatch[1] + '%';
                        }
                    }

                    // Also check for "1+1" type deals
                    if (!discountPercent) {
                        var dealMatch = (card.textContent || '').match(/(\d\+\d)/);
                        if (dealMatch) {
                            discountPercent = dealMatch[1];
                        }
                    }

                    // --- LOYALTY CARD: check for .akcija-loyalty class ---
                    var requiresLoyaltyCard = card.classList.contains('akcija-loyalty');

                    // --- Must have SOME kind of discount indicator ---
                    if (!discountPercent && !originalPrice && !requiresLoyaltyCard) {
                        continue; // Skip non-discounted products
                    }

                    // Get image — skip SVG icons and theme assets
                    var imageUrl = null;
                    var allImgs = card.querySelectorAll('img');
                    for (var im = 0; im < allImgs.length; im++) {
                        var src = allImgs[im].getAttribute('src') || allImgs[im].getAttribute('data-src') || allImgs[im].getAttribute('data-lazy-src') || '';
                        if (src && src.indexOf('.svg') === -1 && src.indexOf('/themes/') === -1 && src.indexOf('assets/svg') === -1 && src.length > 10) {
                            imageUrl = src;
                            break;
                        }
                    }

                    // Get product URL (buy link)
                    var linkEl = card.querySelector('.promo_shop_block a, a[href*="lastmile"], a[href*="pirkti"]');
                    var productUrl = linkEl ? linkEl.getAttribute('href') : null;

                    // Get unit info from description
                    var unitInfo = null;
                    if (description) {
                        var unitMatch = description.match(/(\d+(?:[,\.]\d+)?\s*(?:g|kg|l|ml|vnt))/i);
                        if (unitMatch) {
                            unitInfo = unitMatch[1];
                        }
                    }

                    products.push({
                        name: name,
                        description: description,
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

        return rawProducts as IkiScrapedProduct[];
    }

    private convertToProduct(raw: IkiScrapedProduct): Product {
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
            description: raw.description,
            storeProductId: null,
            productUrl: raw.productUrl,
            sourceSection: 'Savaitės akcijos',
        });
    }

    private parseDates(dateStr: string | null): { validFrom: Date | null; validTo: Date | null } {
        if (!dateStr) return { validFrom: null, validTo: null };

        try {
            // "Galioja: 03.09 - 03.15" format
            const rangeMatch = dateStr.match(/(\d{2})[.\s](\d{2})\s*[-–]\s*(\d{2})[.\s](\d{2})/);
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
