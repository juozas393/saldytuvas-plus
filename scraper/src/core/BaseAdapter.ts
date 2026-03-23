/**
 * Base adapter class for all store scrapers
 */

import { Browser, BrowserContext, Page } from 'playwright';
import { setupBrowser, closeBrowser, randomDelay } from './browser.js';
import { Product, ScrapeResult, ScraperConfig, StoreName, DEFAULT_CONFIG } from './types.js';

export abstract class BaseAdapter {
    protected browser: Browser | null = null;
    protected context: BrowserContext | null = null;
    protected page: Page | null = null;
    protected config: ScraperConfig;
    protected errors: string[] = [];

    abstract readonly storeName: StoreName;
    abstract readonly baseUrl: string;
    abstract readonly displayName: string;

    constructor(config: Partial<ScraperConfig> = {}) {
        this.config = { ...DEFAULT_CONFIG, ...config };
    }

    /**
     * Initialize the browser
     */
    async init(): Promise<void> {
        console.log(`[${this.displayName}] Initializing browser...`);
        const setup = await setupBrowser(this.config);
        this.browser = setup.browser;
        this.context = setup.context;
        this.page = setup.page;
        console.log(`[${this.displayName}] Browser ready`);
    }

    /**
     * Close the browser
     */
    async close(): Promise<void> {
        if (this.browser) {
            await closeBrowser(this.browser);
            this.browser = null;
            this.context = null;
            this.page = null;
            console.log(`[${this.displayName}] Browser closed`);
        }
    }

    /**
     * Main scraping method - must be implemented by each adapter
     */
    abstract scrapeOffers(): Promise<Product[]>;

    /**
     * Run the full scraping process
     */
    async run(): Promise<ScrapeResult> {
        const startTime = Date.now();
        this.errors = [];

        try {
            await this.init();
            console.log(`[${this.displayName}] Starting scrape...`);

            const products = await this.scrapeOffers();

            const duration = Date.now() - startTime;
            console.log(`[${this.displayName}] Scraped ${products.length} products in ${duration}ms`);

            return {
                store: this.storeName,
                success: true,
                products,
                totalProducts: products.length,
                scrapedAt: new Date(),
                duration,
                errors: this.errors,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.errors.push(errorMessage);
            console.error(`[${this.displayName}] Scrape failed:`, errorMessage);

            return {
                store: this.storeName,
                success: false,
                products: [],
                totalProducts: 0,
                scrapedAt: new Date(),
                duration: Date.now() - startTime,
                errors: this.errors,
            };
        } finally {
            await this.close();
        }
    }

    /**
     * Navigate to a URL with retry logic
     */
    protected async navigateWithRetry(url: string, retries = 3): Promise<void> {
        if (!this.page) throw new Error('Browser not initialized');

        for (let attempt = 1; attempt <= retries; attempt++) {
            try {
                console.log(`[${this.displayName}] Navigating to ${url} (attempt ${attempt})`);
                await this.page.goto(url, {
                    waitUntil: 'domcontentloaded',
                    timeout: this.config.timeout
                });
                return;
            } catch (error) {
                if (attempt === retries) throw error;
                console.log(`[${this.displayName}] Navigation failed, retrying...`);
                await this.delay();
            }
        }
    }

    /**
     * Wait for a random delay (anti-bot measure)
     */
    protected async delay(): Promise<void> {
        await randomDelay(this.config.requestDelayMin, this.config.requestDelayMax);
    }

    /**
     * Log an error without stopping execution
     */
    protected logError(message: string): void {
        console.error(`[${this.displayName}] ${message}`);
        this.errors.push(message);
    }

    /**
     * Parse price string to number
     */
    protected parsePrice(priceStr: string | null | undefined): number | null {
        if (!priceStr) return null;

        // Remove currency symbols, spaces, and convert comma to dot
        const cleaned = priceStr
            .replace(/[€$£\s]/g, '')
            .replace(',', '.')
            .trim();

        const price = parseFloat(cleaned);
        return isNaN(price) ? null : price;
    }

    /**
     * Calculate discount percentage
     */
    protected calculateDiscount(original: number | null, discounted: number): number | null {
        if (!original || original <= 0 || discounted <= 0) return null;
        return Math.round(((original - discounted) / original) * 100);
    }

    /**
     * Create a Product object with defaults
     */
    protected createProduct(partial: Partial<Product>): Product {
        return {
            store: this.storeName,
            name: partial.name || 'Unknown',
            originalPrice: partial.originalPrice ?? null,
            discountPrice: partial.discountPrice ?? 0,
            discountPercent: partial.discountPercent ?? null,
            validFrom: partial.validFrom ?? null,
            validTo: partial.validTo ?? null,
            category: partial.category ?? null,
            imageUrl: partial.imageUrl ?? null,
            unit: partial.unit ?? null,
            pricePerUnit: partial.pricePerUnit ?? null,
            description: partial.description ?? null,
            storeProductId: partial.storeProductId ?? null,
            productUrl: partial.productUrl ?? null,
            sourceSection: partial.sourceSection ?? null,
            dealType: partial.dealType ?? null,
            scrapedAt: new Date(),
        };
    }
}
