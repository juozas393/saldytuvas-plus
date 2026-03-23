/**
 * Rimi Lithuania Scraper Adapter
 * 
 * Scrapes food promotions from rimi.lt/akcijos.
 * Rimi uses Cloudflare protection, so extra stealth measures are needed.
 * Products are displayed in a grid with discount/original prices.
 */

import { BaseAdapter } from '../../core/BaseAdapter.js';
import { Product, StoreName } from '../../core/types.js';

const RIMI_BASE = 'https://www.rimi.lt/e-parduotuve/lt/akcijos';
const QUERY_PREFIX = ':relevance:assortmentStatus:inAssortment:inStockFlag:true:firstLevelCategory:';

// Only food-related categories
const FOOD_CATEGORIES = [
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

const PAGE_SIZE = 80;
const MAX_PAGES_PER_CATEGORY = 30;

interface RimiScrapedProduct {
    name: string;
    discountPrice: number | null;
    originalPrice: number | null;
    pricePerUnit: string | null;
    imageUrl: string | null;
    productUrl: string | null;
}

export class RimiAdapter extends BaseAdapter {
    readonly storeName: StoreName = 'rimi';
    readonly baseUrl = 'https://www.rimi.lt/akcijos';
    readonly displayName = 'Rimi';

    /**
     * Main scraping method — iterates through food categories with pagination
     */
    async scrapeOffers(): Promise<Product[]> {
        if (!this.page) throw new Error('Browser not initialized');

        console.log(`[${this.displayName}] Scraping food promotions from Rimi (${FOOD_CATEGORIES.length} categories)`);

        const allRawProducts: RimiScrapedProduct[] = [];
        let firstNav = true;

        for (const category of FOOD_CATEGORIES) {
            console.log(`[${this.displayName}] Category: ${category.name}`);

            for (let page = 1; page <= MAX_PAGES_PER_CATEGORY; page++) {
                const url = `${RIMI_BASE}?currentPage=${page}&pageSize=${PAGE_SIZE}&query=${QUERY_PREFIX}${category.query}`;

                await this.navigateWithRetry(url);
                if (firstNav) {
                    await this.handleCookieConsent();
                    firstNav = false;
                }
                await this.page.waitForTimeout(1500);

                // Scroll to load lazy images
                await this.loadAllProducts();

                // Extract products
                const products = await this.extractProducts();

                if (products.length === 0) {
                    console.log(`[${this.displayName}]   ${category.name} page ${page}: 0 products, moving to next category`);
                    break;
                }

                console.log(`[${this.displayName}]   ${category.name} page ${page}: ${products.length} products`);
                allRawProducts.push(...products);

                // If we got less than pageSize, no more pages
                if (products.length < PAGE_SIZE * 0.4) break;

                await this.delay();
            }
        }

        console.log(`[${this.displayName}] Total raw food products: ${allRawProducts.length}`);

        const allProducts = allRawProducts.map(p => this.convertToProduct(p));
        const uniqueProducts = this.deduplicateProducts(allProducts);
        console.log(`[${this.displayName}] Total unique products: ${uniqueProducts.length}`);

        const validProducts = uniqueProducts.filter(p => p.discountPrice > 0);

        // Exclude drinks, coffee, tea, alcohol by product name
        const DRINK_KEYWORDS = /\b(kava|kavos|coffee|arbata|arbatos|sultys|sul[čc]i[ųu]|g[eė]rimas|g[eė]rim|limonadas|vanduo|vandens|mineralin|gazuot|alus|al[aų]|vynas|vyn[oų]|degtinė|brendis|viskis|konjak|šamp[aū]n|sidras|energin|cola|pepsi|fanta|sprite|redbull|monster)\b/i;
        const foodProducts = validProducts.filter(p => !DRINK_KEYWORDS.test(p.name));
        console.log(`[${this.displayName}] After drink/coffee filter: ${foodProducts.length} (removed ${validProducts.length - foodProducts.length})`);

        return foodProducts;
    }

    /**
     * Quick scroll to trigger lazy image loading — products are already in DOM (server-side pagination)
     */
    private async loadAllProducts(): Promise<void> {
        if (!this.page) return;

        const viewportHeight = await this.page.evaluate(() => window.innerHeight);
        const totalHeight = await this.page.evaluate(() => document.body.scrollHeight);

        // Single fast scroll through the page to trigger lazy images
        for (let pos = 0; pos < totalHeight; pos += viewportHeight * 0.8) {
            await this.page.evaluate((y) => window.scrollTo(0, y), pos);
            await this.page.waitForTimeout(100);
        }

        // Scroll back to top
        await this.page.evaluate(() => window.scrollTo(0, 0));
        await this.page.waitForTimeout(200);
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
                'button:has-text("Priimti visus")',
                '#CybotCookiebotDialogBodyLevelButtonLevelOptinAllowAll',
                '[class*="accept-all"]',
                'button[data-testid="cookie-accept"]',
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
            // Consent might not appear
        }
    }

    /**
     * Extract products using Rimi's e-parduotuvė DOM structure
     */
    private async extractProducts(): Promise<RimiScrapedProduct[]> {
        if (!this.page) throw new Error('Browser not initialized');

        const rawProducts = await this.page.evaluate(() => {
            var products = [];

            // Rimi e-parduotuvė uses .product-grid__item (li) cards
            var cards = document.querySelectorAll('li.product-grid__item, li.card');

            for (var i = 0; i < cards.length; i++) {
                var card = cards[i];
                try {
                    // --- PRODUCT NAME: .card__name ---
                    var nameEl = card.querySelector('.card__name');
                    var name = nameEl ? nameEl.textContent.trim() : '';
                    if (!name || name.length < 3) continue;

                    // --- DISCOUNT/CURRENT PRICE: .price-tag.card__price ---
                    var discountPrice = null;
                    var priceTag = card.querySelector('.price-tag.card__price, .card__price');
                    if (priceTag) {
                        // Price structure: <span>0</span><div><sup>35</sup><span>€</span></div>
                        var wholeEl = priceTag.querySelector(':scope > span');
                        var centsEl = priceTag.querySelector('sup');
                        if (wholeEl) {
                            var whole = wholeEl.textContent.replace(/[^0-9]/g, '');
                            var cents = centsEl ? centsEl.textContent.replace(/[^0-9]/g, '') : '00';
                            if (whole) {
                                discountPrice = parseFloat(whole + '.' + cents.padStart(2, '0'));
                            }
                        }
                    }

                    // --- ORIGINAL PRICE (crossed out): .old-price-tag.card__old-price ---
                    var originalPrice = null;
                    var oldPriceTag = card.querySelector('.old-price-tag.card__old-price, .card__old-price');
                    if (oldPriceTag) {
                        var oldText = oldPriceTag.textContent || '';
                        var oldMatch = oldText.match(/(\d+)[,.](\d{2})/);
                        if (oldMatch) {
                            originalPrice = parseFloat(oldMatch[1] + '.' + oldMatch[2]);
                        }
                    }

                    // --- LOYALTY CARD PRICE: .price-label__price ---
                    var loyaltyPrice = null;
                    var loyaltyEl = card.querySelector('.price-label__price');
                    if (loyaltyEl) {
                        var majorEl = loyaltyEl.querySelector('.major');
                        var minorEl = loyaltyEl.querySelector('.minor .cents, .minor');
                        if (majorEl) {
                            var major = majorEl.textContent.replace(/[^0-9]/g, '');
                            var minor = minorEl ? minorEl.textContent.replace(/[^0-9]/g, '') : '00';
                            if (major) {
                                loyaltyPrice = parseFloat(major + '.' + minor.padStart(2, '0'));
                            }
                        }
                    }

                    // --- MUST BE A DISCOUNT PRODUCT ---
                    // Has old price (regular discount) OR has loyalty price (card discount)
                    var hasDiscount = (originalPrice !== null && discountPrice !== null && originalPrice > discountPrice);
                    var hasLoyaltyDiscount = (loyaltyPrice !== null && discountPrice !== null && loyaltyPrice < discountPrice);

                    if (!hasDiscount && !hasLoyaltyDiscount) {
                        continue; // Skip non-discounted products
                    }

                    // If it's a loyalty discount, use the loyalty price as the discount price
                    // and the regular price as the original price
                    if (hasLoyaltyDiscount && !hasDiscount) {
                        originalPrice = discountPrice;
                        discountPrice = loyaltyPrice;
                    }

                    // --- UNIT PRICE: .card__price-per (informational only) ---
                    var pricePerUnit = null;
                    var unitEl = card.querySelector('.card__price-per');
                    if (unitEl) {
                        pricePerUnit = unitEl.textContent.trim();
                    }

                    // --- IMAGE ---
                    var imgEl = card.querySelector('img');
                    var imageUrl = imgEl ? (imgEl.getAttribute('src') || imgEl.getAttribute('data-src')) : null;

                    // --- PRODUCT URL ---
                    var linkEl = card.tagName === 'A' ? card : card.querySelector('a[href]');
                    var productUrl = linkEl ? linkEl.getAttribute('href') : null;
                    if (productUrl && productUrl.indexOf('http') !== 0) {
                        productUrl = 'https://www.rimi.lt' + productUrl;
                    }

                    products.push({
                        name: name,
                        discountPrice: discountPrice,
                        originalPrice: originalPrice,
                        pricePerUnit: pricePerUnit,
                        imageUrl: imageUrl,
                        productUrl: productUrl,
                    });
                } catch (e) {
                    // Skip failed product
                }
            }

            return products;
        });

        return rawProducts as RimiScrapedProduct[];
    }

    /**
     * Convert to standard Product format
     */
    private convertToProduct(raw: RimiScrapedProduct): Product {
        let discountPercent: number | null = null;
        if (raw.originalPrice && raw.discountPrice) {
            discountPercent = this.calculateDiscount(raw.originalPrice, raw.discountPrice);
        }

        // Rimi doesn't show dates on list pages — set current week
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const daysUntilSunday = (7 - now.getDay()) % 7 || 7;
        const nextSunday = new Date(today);
        nextSunday.setDate(today.getDate() + daysUntilSunday);

        return this.createProduct({
            name: raw.name,
            originalPrice: raw.originalPrice,
            discountPrice: raw.discountPrice || 0,
            discountPercent,
            validFrom: today,
            validTo: nextSunday,
            category: null,
            imageUrl: raw.imageUrl,
            unit: null,
            pricePerUnit: raw.pricePerUnit,
            description: null,
            storeProductId: null,
            productUrl: raw.productUrl,
            sourceSection: 'Akcijos',
        });
    }

    /**
     * Deduplicate by URL or name+price
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
