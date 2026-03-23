import { chromium } from 'playwright';

async function main() {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    await page.goto('https://www.lidl.lt/');
    await page.waitForTimeout(3000);

    // Accept cookies
    try {
        await page.click('#onetrust-accept-btn-handler', { timeout: 3000 });
    } catch (e) { }
    await page.waitForTimeout(1000);

    // Find all /c/ links
    const links = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('a[href*="/c/"]')).map(l => ({
            name: l.textContent?.trim()?.substring(0, 60) || '',
            url: (l as HTMLAnchorElement).href
        })).filter(l => l.url.includes('lidl.lt/c/'));
    });

    const seen = new Set<string>();
    const promoSections: Array<{ name: string; url: string }> = [];
    const catalogSections: Array<{ name: string; url: string }> = [];

    for (const l of links) {
        if (seen.has(l.url)) continue;
        seen.add(l.url);

        const isPromo = /\/c\/[^/]+\/a\d+/.test(l.url);
        if (isPromo) {
            promoSections.push(l);
        } else {
            catalogSections.push(l);
        }
    }

    console.log(`\n=== PROMOTIONAL SECTIONS (/a...) - ${promoSections.length} ===`);
    promoSections.forEach((s, i) => {
        const slug = s.url.split('/c/')[1] || s.url;
        console.log(`${i + 1}. "${s.name}" => ${slug}`);
    });

    console.log(`\n=== CATALOG SECTIONS (/s...) - ${catalogSections.length} ===`);
    catalogSections.forEach((s, i) => {
        const slug = s.url.split('/c/')[1] || s.url;
        console.log(`${i + 1}. "${s.name}" => ${slug}`);
    });

    // Check if super-savaitgalis exists
    const superSav = [...promoSections, ...catalogSections].filter(s =>
        s.url.includes('super-savaitgalis') || s.name.toLowerCase().includes('super savaitgalis')
    );
    console.log(`\n=== SUPER SAVAITGALIS CHECK ===`);
    if (superSav.length > 0) {
        superSav.forEach(s => console.log(`FOUND: "${s.name}" => ${s.url}`));
    } else {
        console.log('NOT FOUND in any section!');
    }

    await browser.close();
}

main().catch(console.error);
