/**
 * Lidl Lithuania Scraper Adapter
 * 
 * Scrapes food offers from lidl.lt catalog page with URL-based offset pagination.
 * Navigates to each page (?offset=0, 12, 24...) and collects products,
 * then filters to only keep real discounts (originalPrice > discountPrice).
 */

import { BaseAdapter } from '../../core/BaseAdapter.js';
import { Product, StoreName } from '../../core/types.js';
import { DiscoveredSection, filterFoodSections } from '../../core/sectionClassifier.js';

// Configuration
const LIDL_CONFIG = {
    // Discovery entry point — "Šiandien" main page
    discoveryUrl: 'https://www.lidl.lt/c/siandien/a10057800',
    // Fallback food catalog page
    fallbackCatalogUrl: 'https://www.lidl.lt/c/maistas-gerimai-ir-buities-prekes/s10068374',
    // Products per page
    pageSize: 12,
    // Max pages to prevent infinite loops
    maxPages: 20,
};

interface LidlScrapedProduct {
    name: string;
    originalPrice: number | null;
    discountPrice: number | null;
    discountPercent: string | null;
    imageUrl: string | null;
    validDates: string | null;
    unitInfo: string | null;
    isLidlPlus: boolean;
    productUrl: string | null;
}

export class LidlAdapter extends BaseAdapter {
    readonly storeName: StoreName = 'lidl';
    readonly baseUrl = LIDL_CONFIG.discoveryUrl;
    readonly displayName = 'Lidl';

    /**
     * Discover food catalog categories from Lidl's main page
     */
    private async discoverCatalogUrl(): Promise<string> {
        if (!this.page) throw new Error('Browser not initialized');

        console.log(`[${this.displayName}] Discovering categories from ${LIDL_CONFIG.discoveryUrl}`);
        await this.navigateWithRetry(LIDL_CONFIG.discoveryUrl);
        await this.handleCookieConsent();
        await this.page.waitForTimeout(1500);

        // Find sub-category links on the main page
        const rawLinks = await this.page.evaluate(() => {
            const links: { name: string; url: string }[] = [];
            // Lidl uses category cards/links with /c/ pattern
            const anchors = document.querySelectorAll('a[href*="/c/"]');
            for (let i = 0; i < anchors.length; i++) {
                const a = anchors[i] as HTMLAnchorElement;
                const href = a.href;
                const text = a.textContent?.trim() || '';
                if (href && text.length > 2 && href.includes('/s')) {
                    links.push({ name: text, url: href });
                }
            }
            return links;
        });

        // Deduplicate
        const seen = new Set<string>();
        const unique: DiscoveredSection[] = [];
        for (const link of rawLinks) {
            const baseUrl = link.url.split('?')[0];
            if (!seen.has(baseUrl)) {
                seen.add(baseUrl);
                unique.push(link);
            }
        }

        // Filter to food sections
        const foodSections = filterFoodSections(unique, this.displayName);

        if (foodSections.length > 0) {
            // Use the first food category (usually the food & beverages category)
            console.log(`[${this.displayName}] Using discovered URL: ${foodSections[0].name} => ${foodSections[0].url}`);
            return foodSections[0].url;
        }

        console.log(`[${this.displayName}] Discovery found no food categories, using fallback`);
        return LIDL_CONFIG.fallbackCatalogUrl;
    }

    /**
     * Main scraping method - URL-based offset pagination through food catalog
     */
    async scrapeOffers(): Promise<Product[]> {
        if (!this.page) throw new Error('Browser not initialized');

        console.log(`[${this.displayName}] Scraping food catalog with URL-based pagination`);

        // Step 1: Discover catalog URL dynamically
        const catalogUrl = await this.discoverCatalogUrl();

        // Step 2: Navigate to first page
        await this.navigateWithRetry(catalogUrl);
        await this.page.waitForTimeout(1000);

        // Step 2: Paginate through all offset pages, collecting products from each
        const allRawProducts: LidlScrapedProduct[] = [];
        let offset = 0;
        let emptyPages = 0;
        let cookieHandled = true; // Already handled on first page

        while (offset < LIDL_CONFIG.maxPages * LIDL_CONFIG.pageSize) {
            // Navigate to current offset page
            if (offset > 0) {
                const pageUrl = `${catalogUrl}?offset=${offset}`;
                console.log(`[${this.displayName}] Loading offset=${offset}...`);
                await this.navigateWithRetry(pageUrl);
                await this.page.waitForTimeout(1000);
            }

            // Scroll to load lazy content
            await this.scrollEntirePage();

            // Extract products from this page
            const pageProducts = await this.extractProducts();
            console.log(`[${this.displayName}]   Found ${pageProducts.length} products at offset=${offset}`);

            if (pageProducts.length === 0) {
                emptyPages++;
                if (emptyPages >= 2) {
                    console.log(`[${this.displayName}] ✅ No more products found, stopping pagination`);
                    break;
                }
            } else {
                emptyPages = 0;
                allRawProducts.push(...pageProducts);
            }

            offset += LIDL_CONFIG.pageSize;
        }

        console.log(`[${this.displayName}] Total raw products from all pages: ${allRawProducts.length}`);

        // Step 3: Convert to standard Product format
        const allProducts = allRawProducts.map(p => this.convertToProduct(p));

        // Step 4: Remove duplicates
        const uniqueProducts = this.deduplicateProducts(allProducts);
        console.log(`[${this.displayName}] Total unique products: ${uniqueProducts.length}`);

        // Step 5: Filter to only keep products with REAL discounts (originalPrice > discountPrice)
        const discountedProducts = uniqueProducts.filter(p =>
            p.originalPrice !== null &&
            p.originalPrice > 0 &&
            p.discountPrice !== null &&
            p.discountPrice > 0 &&
            p.originalPrice > p.discountPrice
        );
        console.log(`[${this.displayName}] Products with real discounts: ${discountedProducts.length}`);

        return discountedProducts;
    }

    /**
     * Scroll through entire page to trigger lazy loading
     */
    private async scrollEntirePage(): Promise<void> {
        if (!this.page) return;

        const viewportHeight = await this.page.evaluate(() => window.innerHeight);
        const totalHeight = await this.page.evaluate(() => document.body.scrollHeight);

        // Scroll through page to trigger lazy loading — needs enough time for images/prices to render
        for (let pos = 0; pos < totalHeight; pos += viewportHeight) {
            await this.page.evaluate((y) => window.scrollTo(0, y), pos);
            await this.page.waitForTimeout(150);
        }

        // Wait at bottom for final lazy loads, then scroll back up to ensure top products are in DOM
        await this.page.waitForTimeout(500);
        await this.page.evaluate(() => window.scrollTo(0, 0));
        await this.page.waitForTimeout(300);
    }

    /**
     * Handle cookie consent modal
     */
    private async handleCookieConsent(): Promise<void> {
        if (!this.page) return;

        try {
            const acceptButton = await this.page.$('button:has-text("SUTINKU")');
            if (acceptButton) {
                await acceptButton.click();
                console.log(`[${this.displayName}] Accepted cookie consent`);
                await this.page.waitForTimeout(500);
            }
        } catch (error) {
            // Cookie consent might not appear, that's okay
        }
    }

    /**
     * Extract products from the current page
     */
    private async extractProducts(): Promise<LidlScrapedProduct[]> {
        if (!this.page) throw new Error('Browser not initialized');

        // Use plain JS in evaluate - NO TypeScript types!
        const rawProducts = await this.page.evaluate(() => {
            var products = [];
            var cards = document.querySelectorAll('.product-grid-box');

            for (var i = 0; i < cards.length; i++) {
                var card = cards[i];

                // Get name
                var nameEl = card.querySelector('.product-grid-box__title');
                var name = nameEl ? nameEl.textContent.trim() : '';

                if (!name) continue;

                // Get DISCOUNTED price (current price)
                var discountPriceEl = card.querySelector('.ods-price__value');
                var discountPrice = null;
                if (discountPriceEl && discountPriceEl.textContent) {
                    var cleaned = discountPriceEl.textContent.replace(/[€\s]/g, '').replace(',', '.').trim();
                    var parsed = parseFloat(cleaned);
                    if (!isNaN(parsed)) discountPrice = parsed;
                }

                // Get ORIGINAL price (old price, crossed out)
                var originalPriceEl = card.querySelector('.ods-price__stroke-price s') ||
                    card.querySelector('.ods-price__stroke-price');
                var originalPrice = null;
                if (originalPriceEl && originalPriceEl.textContent) {
                    var cleanedOrig = originalPriceEl.textContent.replace(/[€\s]/g, '').replace(',', '.').trim();
                    var parsedOrig = parseFloat(cleanedOrig);
                    if (!isNaN(parsedOrig)) originalPrice = parsedOrig;
                }

                // Get VALIDITY DATES
                var datesEl = card.querySelector('.product-grid-box__availabilities .ods-badge__label') ||
                    card.querySelector('.ods-badge__label');
                var validDates = datesEl ? datesEl.textContent.trim() : null;

                // Get DISCOUNT PERCENTAGE
                var discountEl = card.querySelector('.ods-price__box-content-text-el');
                var discountPercent = null;
                if (discountEl && discountEl.textContent) {
                    var discText = discountEl.textContent.trim();
                    if (discText.includes('%') || discText.includes('-')) {
                        discountPercent = discText;
                    }
                }

                // Get image
                var imageEl = card.querySelector('img');
                var imageUrl = imageEl ? imageEl.src : null;

                // Get link
                var linkEl = card.querySelector('a');
                var productUrl = linkEl ? linkEl.href : null;

                // Get unit info (e.g., "250 g | 1 kg = 19,16 €")
                var unitEl = card.querySelector('.ods-price__footer');
                var unitInfo = unitEl ? unitEl.textContent.trim() : null;

                // Check if Lidl Plus exclusive
                var lidlPlusEl = card.querySelector('.ods-badge--lidl-plus');
                var isLidlPlus = !!lidlPlusEl;

                products.push({
                    name: name,
                    originalPrice: originalPrice,
                    discountPrice: discountPrice,
                    discountPercent: discountPercent,
                    imageUrl: imageUrl,
                    validDates: validDates,
                    unitInfo: unitInfo,
                    isLidlPlus: isLidlPlus,
                    productUrl: productUrl
                });
            }

            return products;
        });

        return rawProducts as LidlScrapedProduct[];
    }

    /**
     * Convert Lidl product to standard Product format
     */
    private convertToProduct(raw: LidlScrapedProduct): Product {
        // Parse validity dates
        const { validFrom, validTo } = this.parseDates(raw.validDates);

        // Parse discount percentage
        let discountPercent: number | null = null;
        if (raw.discountPercent) {
            const match = raw.discountPercent.match(/-?(\d+)/);
            if (match) {
                discountPercent = parseInt(match[1], 10);
            }
        }

        // Calculate discount if not provided
        if (!discountPercent && raw.originalPrice && raw.discountPrice) {
            discountPercent = this.calculateDiscount(raw.originalPrice, raw.discountPrice);
        }

        // Parse unit and pricePerUnit from footer (e.g., "250 g | 1 kg = 19,16 €")
        let { unit, pricePerUnit } = this.parseUnitInfo(raw.unitInfo);

        // Auto-calculate pricePerUnit when only weight is given (e.g., "200 g" without kg price)
        if (unit && !pricePerUnit && raw.discountPrice) {
            pricePerUnit = this.calculatePricePerUnit(unit, raw.discountPrice);
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
            unit,
            pricePerUnit,
            description: raw.isLidlPlus ? 'Lidl Plus pasiūlymas' : null,
            storeProductId: null,
            productUrl: raw.productUrl,
            sourceSection: 'Maistas, gėrimai ir buities prekės',
        });
    }

    /**
     * Parse date range string (e.g., "02 02 - 02 08" or "Nuo 02 12")
     */
    private parseDates(dateStr: string | null): { validFrom: Date | null; validTo: Date | null } {
        if (!dateStr) return { validFrom: null, validTo: null };

        try {
            // Try range format: "02 02 - 02 08"
            const rangeMatch = dateStr.match(/(\d{2})\s*(\d{2})\s*-\s*(\d{2})\s*(\d{2})/);
            if (rangeMatch) {
                const currentYear = new Date().getFullYear();
                const fromMonth = parseInt(rangeMatch[1], 10) - 1;
                const fromDay = parseInt(rangeMatch[2], 10);
                const toMonth = parseInt(rangeMatch[3], 10) - 1;
                const toDay = parseInt(rangeMatch[4], 10);

                const validFrom = new Date(currentYear, fromMonth, fromDay);
                const validTo = new Date(currentYear, toMonth, toDay);

                if (validTo < validFrom) {
                    validTo.setFullYear(currentYear + 1);
                }

                return { validFrom, validTo };
            }

            // Try "Nuo" format: "Nuo 02 12"
            const nuoMatch = dateStr.match(/Nuo\s+(\d{2})\s+(\d{2})/i);
            if (nuoMatch) {
                const currentYear = new Date().getFullYear();
                const month = parseInt(nuoMatch[1], 10) - 1;
                const day = parseInt(nuoMatch[2], 10);
                const validFrom = new Date(currentYear, month, day);
                return { validFrom, validTo: null };
            }

            return { validFrom: null, validTo: null };
        } catch (error) {
            return { validFrom: null, validTo: null };
        }
    }

    /**
     * Parse unit info from footer text (e.g., "250 g | 1 kg = 19,16 €")
     */
    private parseUnitInfo(unitInfo: string | null): { unit: string | null; pricePerUnit: string | null } {
        if (!unitInfo) return { unit: null, pricePerUnit: null };

        // Try to parse "250 g | 1 kg = 19,16 €" format
        const pipeMatch = unitInfo.match(/([\d.,]+\s*(?:g|kg|l|ml|vnt))\s*\|\s*(.+)/i);
        if (pipeMatch) {
            return {
                unit: pipeMatch[1].trim(),
                pricePerUnit: pipeMatch[2].trim(),
            };
        }

        // Try simple format "1 kg" or "500 g"
        const simpleMatch = unitInfo.match(/([\d.,]+\s*(?:g|kg|l|ml|vnt))/i);
        if (simpleMatch) {
            return {
                unit: simpleMatch[1].trim(),
                pricePerUnit: null,
            };
        }

        return { unit: null, pricePerUnit: unitInfo };
    }

    /**
     * Calculate price per kg/l from unit weight and price
     * e.g., "200 g" at 2.29€ → "1 kg = 11,45 €"
     */
    private calculatePricePerUnit(unit: string, price: number): string | null {
        const match = unit.match(/([\d.,]+)\s*(g|kg|ml|l)/i);
        if (!match) return null;

        const amount = parseFloat(match[1].replace(',', '.'));
        const unitType = match[2].toLowerCase();

        if (amount <= 0) return null;

        let perUnitPrice: number;
        let perUnitLabel: string;

        switch (unitType) {
            case 'g':
                perUnitPrice = (price / amount) * 1000; // price per kg
                perUnitLabel = '1 kg';
                break;
            case 'kg':
                perUnitPrice = price / amount;
                perUnitLabel = '1 kg';
                break;
            case 'ml':
                perUnitPrice = (price / amount) * 1000; // price per liter
                perUnitLabel = '1 l';
                break;
            case 'l':
                perUnitPrice = price / amount;
                perUnitLabel = '1 l';
                break;
            default:
                return null;
        }

        // Format with Lithuanian comma separator
        const formatted = perUnitPrice.toFixed(2).replace('.', ',');
        return `${perUnitLabel} = ${formatted} €`;
    }

    /**
     * Remove duplicate products by product URL or name+price combo
     */
    private deduplicateProducts(products: Product[]): Product[] {
        const seen = new Set<string>();
        return products.filter(p => {
            const key = p.productUrl || `${p.name}-${p.discountPrice}`;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });
    }
}
