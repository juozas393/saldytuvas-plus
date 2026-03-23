/**
 * Akcijos.lt Unified Scraper Runner
 * Fetches all food promotions from all stores via API
 */

import { AkcijosLtAdapter } from './AkcijosLtAdapter.js';
import * as fs from 'fs';

async function main() {
    console.log('Starting Akcijos.lt unified scraper...');

    const adapter = new AkcijosLtAdapter();
    const { products, byStore } = await adapter.run();

    // Format dates for JSON export
    const formatDate = (d: Date | null) => {
        if (!d) return null;
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const formatProduct = (p: any) => ({
        ...p,
        validFrom: formatDate(p.validFrom),
        validTo: formatDate(p.validTo),
        scrapedAt: p.scrapedAt.toISOString(),
    });

    // Save per-store files
    for (const [store, storeProducts] of Object.entries(byStore)) {
        const exported = storeProducts.map(formatProduct);
        const filename = `./${store}_products.json`;
        fs.writeFileSync(filename, JSON.stringify(exported, null, 2));
        console.log(`Saved ${exported.length} products to ${filename}`);
    }

    // Save combined file
    const allExported = products.map(formatProduct);
    fs.writeFileSync('./all_products.json', JSON.stringify(allExported, null, 2));
    console.log(`Saved ${allExported.length} total products to all_products.json`);
}

main().catch(err => {
    console.error('FATAL ERROR:', err);
    process.exit(1);
});
