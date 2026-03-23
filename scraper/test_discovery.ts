/**
 * Test script: Show discovery results only (clean output)
 */

import 'dotenv/config';
import { chromium } from 'playwright';
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as fs from 'fs';

async function main() {
    const lines: string[] = [];
    const log = (msg: string) => { lines.push(msg); console.log(msg); };

    log('=== LIDL SECTION DISCOVERY TEST ===');
    log('');

    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        locale: 'lt-LT',
    });
    const page = await context.newPage();

    await page.goto('https://www.lidl.lt/', { waitUntil: 'domcontentloaded', timeout: 30000 });
    try {
        const acceptBtn = page.locator('button.cookie-alert-extended-button, [data-testid="cookie-accept-all"]');
        await acceptBtn.click({ timeout: 5000 });
    } catch { /* no cookie banner */ }
    await page.waitForTimeout(2000);

    const rawSections = await page.evaluate(() => {
        const links = Array.from(document.querySelectorAll('a[href*="/c/"]'));
        return links.map(l => ({
            name: l.textContent?.trim().toLowerCase() || '',
            url: (l as HTMLAnchorElement).href,
        })).filter(l => l.url.includes('lidl.lt/c/'));
    });

    const seenUrls = new Set<string>();
    const promoSections: Array<{ name: string; url: string }> = [];
    const catalogSections: Array<{ name: string; url: string }> = [];

    for (const section of rawSections) {
        if (seenUrls.has(section.url)) continue;
        seenUrls.add(section.url);

        const slug = section.url.replace(/.*\/c\//, '').replace(/\/[as]\d+$/, '');
        const cleanName = slug.replace(/-/g, ' ');

        if (/\/c\/[^/]+\/a\d+/.test(section.url)) {
            promoSections.push({ name: cleanName, url: section.url });
        } else if (/\/c\/[^/]+\/s\d+/.test(section.url)) {
            catalogSections.push({ name: cleanName, url: section.url });
        }
    }

    log(`TOTAL UNIQUE LINKS: ${seenUrls.size}`);
    log('');

    log(`--- PROMOTIONAL SECTIONS (/a... URLs) - ${promoSections.length} found ---`);
    promoSections.forEach((s, i) => log(`  ${i + 1}. "${s.name}" -> ${s.url}`));

    log('');
    log(`--- CATALOG SECTIONS (/s... URLs) - ${catalogSections.length} found ---`);
    catalogSections.forEach((s, i) => log(`  ${i + 1}. "${s.name}" -> ${s.url}`));

    // Keyword whitelist
    const promoKeywords = [
        'akcij', 'savait', 'super', 'deluxe', 'xxl', 'festival',
        'azij', 'itali', 'graik', 'meksik', 'mcennedy', 'kiti gerimai',
    ];

    log('');
    log('--- KEYWORD WHITELIST RESULTS ---');
    const selected: string[] = [];
    const skipped: string[] = [];

    for (const s of promoSections) {
        const match = promoKeywords.find(kw => s.name.includes(kw) || s.url.toLowerCase().includes(kw));
        if (match) {
            selected.push(s.name);
            log(`  [YES] "${s.name}" (keyword: "${match}")`);
        } else {
            skipped.push(s.name);
            log(`  [NO]  "${s.name}"`);
        }
    }
    log(`  -> Selected: ${selected.length} | Skipped: ${skipped.length}`);

    // Try AI
    log('');
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && promoSections.length > 0) {
        log('--- AI (GEMINI) CLASSIFICATION ---');
        try {
            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

            const sectionList = promoSections
                .map((s, i) => `${i + 1}. "${s.name}" (${s.url})`)
                .join('\n');

            const prompt = `Tu esi Lidl.lt parduotuves AKCIJU sekciju klasifikatorius.

Tavo uzduotis - nustatyti, kurios sekcijos yra SAVAITINES AKCIJOS arba SPECIALUS PASIULYMAI su MAISTO produktais, kuriuose yra NUOLAIDOS.

SKIRTUMAS:
- AKCIJU sekcijos = laikinos savaites/savaitgalio nuolaidos, temines savaites (pvz. "Italiska savaite"), specialus pasiulymai (pvz. "Deluxe", "Super savaitgalis") -> "yes"
- NUOLATINES KATALOGO kategorijos = pastovus asortimentas be specialiu nuolaidu (pvz. "Baltasis vynas", "Brendis ir viskis", "Degtine", "Raudonasis vynas") -> "no"
- MISRIOS sekcijos = gali tureti akcijiniu maisto produktu, bet neaisku (pvz. "Valentino dienos pasiulymai", "Azijos stiliaus produktai") -> "maybe"

Ne maisto sekcijos (drabuziai, baldai, irankiai, elektronika) -> visada "no".

Stai rastos sekcijos:
${sectionList}

SVARBU: Jei abejoji ar sekcija yra akcijine su maisto nuolaidomis - rasyk "maybe". Geriau patikrinti per daug nei per mazai.

Atsakyk JSON formatu: {"results": [{"index": 1, "classification": "yes/no/maybe"}]}
Tik JSON, be jokio papildomo teksto.`;

            const result = await model.generateContent(prompt);
            const text = result.response.text().trim();
            const jsonStr = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
            const parsed = JSON.parse(jsonStr) as { results: Array<{ index: number; classification: string }> };

            for (const r of parsed.results) {
                const s = promoSections[r.index - 1];
                if (!s) continue;
                const tag = r.classification === 'yes' ? '[YES]  ' :
                    r.classification === 'maybe' ? '[MAYBE]' : '[NO]   ';
                log(`  ${tag} "${s.name}" -> ${r.classification}`);
            }

            const aiYes = parsed.results.filter(r => r.classification === 'yes').length;
            const aiMaybe = parsed.results.filter(r => r.classification === 'maybe').length;
            const aiNo = parsed.results.filter(r => r.classification === 'no').length;
            log(`  -> YES: ${aiYes} | MAYBE: ${aiMaybe} | NO: ${aiNo}`);
            log(`  -> Would scrape: ${aiYes + aiMaybe} sections`);

        } catch (error: any) {
            log(`  AI unavailable: ${error.message?.substring(0, 150)}`);
        }
    } else {
        log('--- AI CLASSIFICATION: Skipped (no API key) ---');
    }

    log('');
    log('=== DONE ===');

    await browser.close();

    // Save to file
    fs.writeFileSync('./discovery_results.json', JSON.stringify({
        promoSections,
        catalogSections,
        keywordSelected: selected,
        keywordSkipped: skipped,
    }, null, 2));
}

main().catch(console.error);
