/**
 * Rimi Scraper Runner
 * Direct execution script for Rimi scraping
 */

import 'dotenv/config';
import { RimiAdapter } from './RimiAdapter.js';
import * as fs from 'fs';

async function main() {
    console.log('Starting Rimi scraper...');

    const adapter = new RimiAdapter({
        headless: true,
        requestDelayMin: 3000,
        requestDelayMax: 6000,
    });

    const result = await adapter.run();

    const debugInfo = {
        success: result.success,
        totalProducts: result.totalProducts,
        duration: result.duration,
        errors: result.errors,
        sampleProducts: result.products.slice(0, 3),
    };
    fs.writeFileSync('./debug_rimi.json', JSON.stringify(debugInfo, null, 2));

    console.log('Scrape Results:');
    console.log(`Store: ${result.store}`);
    console.log(`Success: ${result.success}`);
    console.log(`Products found: ${result.totalProducts}`);
    console.log(`Duration: ${result.duration}ms`);
    console.log(`Errors: ${result.errors.length}`);

    if (result.errors.length > 0) {
        console.log('Errors:');
        result.errors.forEach(e => console.log(`  - ${e}`));
    }

    if (result.products.length > 0) {
        console.log('Sample Products (first 3):');
        result.products.slice(0, 3).forEach((p, i) => {
            console.log(`${i + 1}. ${p.name} - ${p.discountPrice} EUR (was ${p.originalPrice} EUR)`);
        });
    }

    const formatDate = (d: Date | null) => {
        if (!d) return null;
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const exportProducts = result.products.map(p => ({
        ...p,
        validFrom: formatDate(p.validFrom),
        validTo: formatDate(p.validTo),
        scrapedAt: p.scrapedAt.toISOString(),
    }));

    fs.writeFileSync('./rimi_products.json', JSON.stringify(exportProducts, null, 2));
    console.log('Results saved to: rimi_products.json');
}

main().catch(err => {
    console.error('FATAL ERROR:', err);
    process.exit(1);
});
