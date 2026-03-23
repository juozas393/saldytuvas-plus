/**
 * Common types for all store scrapers
 */

export type StoreName = 'lidl' | 'maxima' | 'rimi' | 'iki' | 'norfa';

export interface Product {
    /** Store identifier */
    store: StoreName;

    /** Product name */
    name: string;

    /** Original price before discount (in EUR) */
    originalPrice: number | null;

    /** Discounted price (in EUR) */
    discountPrice: number;

    /** Discount percentage (0-100) */
    discountPercent: number | null;

    /** When the offer starts */
    validFrom: Date | null;

    /** When the offer ends */
    validTo: Date | null;

    /** Product category */
    category: string | null;

    /** Product image URL */
    imageUrl: string | null;

    /** Unit of measurement (kg, vnt, l, etc.) */
    unit: string | null;

    /** Price per unit (e.g., €/kg) */
    pricePerUnit: string | null;

    /** Additional description or notes */
    description: string | null;

    /** Unique product identifier from the store */
    storeProductId: string | null;

    /** URL to the product page */
    productUrl: string | null;

    /** Source section/catalog name where this product was found */
    sourceSection: string | null;

    /** Deal type badge text (e.g., "1+1", "2+1", "SUMAŽINTA", "SUPER KAINA!") */
    dealType: string | null;

    /** When this record was scraped */
    scrapedAt: Date;
}

export interface ScrapeResult {
    store: StoreName;
    success: boolean;
    products: Product[];
    totalProducts: number;
    scrapedAt: Date;
    duration: number; // in milliseconds
    errors: string[];
}

export interface ScraperConfig {
    headless: boolean;
    slowMo: number;
    requestDelayMin: number;
    requestDelayMax: number;
    maxRetries: number;
    timeout: number;
}

export const DEFAULT_CONFIG: ScraperConfig = {
    headless: true,
    slowMo: 0,
    requestDelayMin: 2000,
    requestDelayMax: 5000,
    maxRetries: 3,
    timeout: 30000,
};
