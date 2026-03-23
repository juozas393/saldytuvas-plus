/**
 * Browser utilities with anti-detection measures
 */

import { chromium, Browser, Page, BrowserContext } from 'playwright';
import { ScraperConfig, DEFAULT_CONFIG } from './types.js';

// Realistic user agents for rotation
const USER_AGENTS = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0',
];

// Common screen resolutions
const VIEWPORTS = [
    { width: 1920, height: 1080 },
    { width: 1366, height: 768 },
    { width: 1536, height: 864 },
    { width: 1440, height: 900 },
    { width: 1280, height: 720 },
];

/**
 * Get a random element from an array
 */
function getRandomElement<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Random delay between min and max milliseconds
 */
export function randomDelay(min: number, max: number): Promise<void> {
    const delay = Math.floor(Math.random() * (max - min + 1)) + min;
    return new Promise(resolve => setTimeout(resolve, delay));
}

/**
 * Create a stealthy browser instance with anti-detection measures
 */
export async function createBrowser(config: Partial<ScraperConfig> = {}): Promise<Browser> {
    const finalConfig = { ...DEFAULT_CONFIG, ...config };

    const browser = await chromium.launch({
        headless: finalConfig.headless,
        slowMo: finalConfig.slowMo,
        args: [
            '--disable-blink-features=AutomationControlled',
            '--disable-dev-shm-usage',
            '--disable-web-security',
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-accelerated-2d-canvas',
            '--disable-gpu',
            '--window-size=1920,1080',
        ],
    });

    return browser;
}

/**
 * Create a stealthy browser context with randomized fingerprint
 */
export async function createStealthContext(browser: Browser): Promise<BrowserContext> {
    const userAgent = getRandomElement(USER_AGENTS);
    const viewport = getRandomElement(VIEWPORTS);

    const context = await browser.newContext({
        userAgent,
        viewport,
        locale: 'lt-LT',
        timezoneId: 'Europe/Vilnius',
        geolocation: { latitude: 54.6872, longitude: 25.2797 }, // Vilnius
        permissions: ['geolocation'],
        extraHTTPHeaders: {
            'Accept-Language': 'lt-LT,lt;q=0.9,en-US;q=0.8,en;q=0.7',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
            'Accept-Encoding': 'gzip, deflate, br',
            'Cache-Control': 'max-age=0',
            'Sec-Ch-Ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
            'Sec-Ch-Ua-Mobile': '?0',
            'Sec-Ch-Ua-Platform': '"Windows"',
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'none',
            'Sec-Fetch-User': '?1',
            'Upgrade-Insecure-Requests': '1',
        },
    });

    return context;
}

/**
 * Create a page with anti-bot evasion scripts
 */
export async function createStealthPage(context: BrowserContext): Promise<Page> {
    const page = await context.newPage();

    // Override navigator.webdriver
    await page.addInitScript(() => {
        Object.defineProperty(navigator, 'webdriver', {
            get: () => undefined,
        });

        // Override chrome automation detection
        Object.defineProperty(navigator, 'plugins', {
            get: () => [
                { name: 'Chrome PDF Plugin', filename: 'internal-pdf-viewer' },
                { name: 'Chrome PDF Viewer', filename: 'mhjfbmdgcfjbbpaeojofohoefgiehjai' },
                { name: 'Native Client', filename: 'internal-nacl-plugin' },
            ],
        });

        // Override permissions
        const originalQuery = window.navigator.permissions.query;
        window.navigator.permissions.query = (parameters: any) => (
            parameters.name === 'notifications' ?
                Promise.resolve({ state: Notification.permission } as PermissionStatus) :
                originalQuery(parameters)
        );

        // Add language
        Object.defineProperty(navigator, 'languages', {
            get: () => ['lt-LT', 'lt', 'en-US', 'en'],
        });
    });

    return page;
}

/**
 * Full browser setup with stealth mode
 */
export async function setupBrowser(config: Partial<ScraperConfig> = {}): Promise<{
    browser: Browser;
    context: BrowserContext;
    page: Page;
}> {
    const browser = await createBrowser(config);
    const context = await createStealthContext(browser);
    const page = await createStealthPage(context);

    return { browser, context, page };
}

/**
 * Clean up browser resources
 */
export async function closeBrowser(browser: Browser): Promise<void> {
    try {
        await browser.close();
    } catch (error) {
        console.error('Error closing browser:', error);
    }
}
