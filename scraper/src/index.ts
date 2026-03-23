/**
 * Saldytuvas+ Universal Scraper
 * Main entry point for scraping all stores
 */

import { LidlAdapter } from './adapters/lidl/index.js';
import { IkiAdapter } from './adapters/iki/index.js';
import { RimiAdapter } from './adapters/rimi/index.js';
import { NorfaAdapter } from './adapters/norfa/index.js';
import { ScrapeResult, StoreName } from './core/types.js';

// Store adapters registry
const ADAPTERS = {
    lidl: LidlAdapter,
    iki: IkiAdapter,
    rimi: RimiAdapter,
    norfa: NorfaAdapter,
};

type AdapterKey = keyof typeof ADAPTERS;

interface ScraperOptions {
    stores?: StoreName[];
    headless?: boolean;
    saveToFile?: boolean;
    saveToSupabase?: boolean;
}

/**
 * Run scrapers for specified stores
 */
async function runScrapers(options: ScraperOptions = {}): Promise<ScrapeResult[]> {
    const {
        stores = ['lidl', 'iki', 'rimi', 'norfa'],
        headless = true,
    } = options;

    const results: ScrapeResult[] = [];

    console.log('🚀 Saldytuvas+ Scraper Starting');
    console.log(`📋 Stores to scrape: ${stores.join(', ')}`);
    console.log(`👻 Headless mode: ${headless}\n`);

    for (const storeName of stores) {
        const AdapterClass = ADAPTERS[storeName as AdapterKey];

        if (!AdapterClass) {
            console.log(`⚠️ No adapter found for store: ${storeName}`);
            continue;
        }

        console.log(`\n${'='.repeat(50)}`);
        console.log(`🏪 Scraping ${storeName.toUpperCase()}...`);
        console.log('='.repeat(50));

        const adapter = new AdapterClass({ headless });
        const result = await adapter.run();
        results.push(result);

        console.log(`\n✅ ${storeName}: ${result.totalProducts} products scraped`);
    }

    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('📊 SUMMARY');
    console.log('='.repeat(50));

    let totalProducts = 0;
    for (const result of results) {
        const status = result.success ? '✅' : '❌';
        console.log(`${status} ${result.store}: ${result.totalProducts} products (${result.duration}ms)`);
        totalProducts += result.totalProducts;
    }

    console.log(`\n🎯 Total products scraped: ${totalProducts}`);

    return results;
}

/**
 * Parse CLI arguments
 */
function parseArgs(): ScraperOptions {
    const args = process.argv.slice(2);
    const options: ScraperOptions = {};

    for (const arg of args) {
        if (arg.startsWith('--store=')) {
            const store = arg.split('=')[1] as StoreName;
            options.stores = [store];
        }
        if (arg.startsWith('--stores=')) {
            const stores = arg.split('=')[1].split(',') as StoreName[];
            options.stores = stores;
        }
        if (arg === '--visible' || arg === '--no-headless') {
            options.headless = false;
        }
    }

    return options;
}

// Main execution
async function main() {
    const options = parseArgs();

    try {
        await runScrapers(options);
    } catch (error) {
        console.error('❌ Scraper failed:', error);
        process.exit(1);
    }
}

main();
