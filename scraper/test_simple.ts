/**
 * Simple test script to debug Lidl scraping
 */

import { chromium } from 'playwright';

async function test() {
    console.log('Starting simple test...');

    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        locale: 'lt-LT',
    });
    const page = await context.newPage();

    console.log('Navigating to Lidl...');
    await page.goto('https://www.lidl.lt/c/visos-sios-savaites-akcijos/a10023711', {
        waitUntil: 'domcontentloaded',
        timeout: 30000,
    });

    // Wait and scroll
    console.log('Waiting for content...');
    await page.waitForTimeout(3000);

    // Try to accept cookies
    try {
        const btn = await page.$('button:has-text("SUTINKU")');
        if (btn) {
            await btn.click();
            console.log('Clicked cookie consent');
            await page.waitForTimeout(1000);
        }
    } catch (e) {
        console.log('No cookie button found');
    }

    // Scroll
    console.log('Scrolling...');
    for (let i = 0; i < 3; i++) {
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        await page.waitForTimeout(1500);
    }

    // Count elements
    const count = await page.evaluate(() => document.querySelectorAll('.product-grid-box').length);
    console.log(`Found ${count} product elements`);

    // Simple extraction
    console.log('Extracting products...');
    const products = await page.evaluate(() => {
        const items: any[] = [];
        document.querySelectorAll('.product-grid-box').forEach((card, idx) => {
            if (idx < 5) { // Just first 5
                const name = card.querySelector('.product-grid-box__title')?.textContent?.trim() || '';
                const price = card.querySelector('.ods-price__value')?.textContent?.trim() || '';
                items.push({ name, price });
            }
        });
        return items;
    });

    console.log('Products found:', products.length);
    console.log('Sample:', JSON.stringify(products, null, 2));

    await browser.close();
    console.log('Done!');
}

test().catch(console.error);
