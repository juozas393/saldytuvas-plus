/**
 * IKI DOM Inspector - discovers actual CSS selectors
 */
import { chromium } from 'playwright';

async function main() {
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
        locale: 'lt-LT',
        timezoneId: 'Europe/Vilnius',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    });
    const page = await context.newPage();

    // Capture console logs
    page.on('console', msg => console.log('BROWSER:', msg.text()));

    console.log('Navigating to IKI...');
    await page.goto('https://iki.lt/akcijos/savaites-akcijos/', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(3000);

    // Try cookie consent
    try {
        const btn = await page.$('button:has-text("Sutinku")');
        if (btn) { await btn.click(); await page.waitForTimeout(1000); console.log('Cookie accepted'); }
    } catch { }

    // Scroll
    for (let i = 0; i < 5; i++) {
        await page.evaluate((y) => window.scrollTo(0, y), i * 800);
        await page.waitForTimeout(500);
    }

    await page.waitForTimeout(2000);

    // Dump DOM structure
    const domInfo = await page.evaluate(() => {
        var results = [];

        // 1. Get all elements with class names
        var allElements = document.querySelectorAll('[class]');
        var classCount = {};
        for (var i = 0; i < allElements.length; i++) {
            var classes = allElements[i].className;
            if (typeof classes === 'string') {
                var parts = classes.split(' ');
                for (var j = 0; j < parts.length; j++) {
                    var cls = parts[j].trim();
                    if (cls && cls.length > 2) {
                        classCount[cls] = (classCount[cls] || 0) + 1;
                    }
                }
            }
        }

        // 2. Find elements that look like product cards (contain price-like text)
        var potentialCards = [];
        var allDivs = document.querySelectorAll('div, article, li, section');
        for (var k = 0; k < allDivs.length; k++) {
            var el = allDivs[k];
            var text = el.innerText || '';
            var hasPrice = text.match(/\d+[,\.]\d{2}\s*€/) || text.match(/Eur\//) || text.match(/Galioja/);
            if (hasPrice && text.length < 500 && text.length > 20) {
                potentialCards.push({
                    tag: el.tagName,
                    classes: el.className,
                    text: text.substring(0, 200),
                    childCount: el.children.length,
                    html: el.outerHTML.substring(0, 500),
                });
            }
        }

        // 3. Look for images with src
        var images = document.querySelectorAll('img[src*="iki"], img[src*="product"], img[data-src]');
        var imgInfo = [];
        for (var m = 0; m < Math.min(images.length, 5); m++) {
            var img = images[m];
            imgInfo.push({
                src: img.src || img.getAttribute('data-src'),
                alt: img.alt,
                parentClasses: img.parentElement ? img.parentElement.className : '',
            });
        }

        return {
            title: document.title,
            url: window.location.href,
            totalElements: document.querySelectorAll('*').length,
            topClasses: Object.entries(classCount)
                .sort(function (a, b) { return b[1] - a[1]; })
                .slice(0, 50)
                .map(function (e) { return e[0] + ': ' + e[1]; }),
            potentialProductCards: potentialCards.slice(0, 10),
            productImages: imgInfo,
            bodyText: document.body.innerText.substring(0, 2000),
        };
    });

    const fs = await import('fs');
    fs.writeFileSync('./iki_dom_debug.json', JSON.stringify(domInfo, null, 2));
    console.log('DOM info saved to iki_dom_debug.json');
    console.log('Title:', domInfo.title);
    console.log('URL:', domInfo.url);
    console.log('Total elements:', domInfo.totalElements);
    console.log('Top classes:', domInfo.topClasses.slice(0, 20).join(', '));
    console.log('Potential product cards:', domInfo.potentialProductCards.length);

    if (domInfo.potentialProductCards.length > 0) {
        console.log('\n=== FIRST PRODUCT CARD ===');
        console.log('Tag:', domInfo.potentialProductCards[0].tag);
        console.log('Classes:', domInfo.potentialProductCards[0].classes);
        console.log('Text:', domInfo.potentialProductCards[0].text);
        console.log('HTML:', domInfo.potentialProductCards[0].html);
    }

    await browser.close();
}

main().catch(err => { console.error('ERROR:', err); process.exit(1); });
