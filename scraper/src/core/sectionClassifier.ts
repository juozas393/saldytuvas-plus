/**
 * Section Classifier — Dynamic Discovery Utility
 * 
 * Determines whether a discovered promotional section is food-related.
 * Uses blacklist approach: if section name clearly matches non-food keywords → skip.
 * Everything else (food + unclear) → include for scraping.
 */

export interface DiscoveredSection {
    name: string;
    url: string;
}

/**
 * Non-food section keywords (Lithuanian).
 * If a section name contains ANY of these → skip.
 */
const NON_FOOD_SECTION_BLACKLIST = [
    // Cosmetics & hygiene
    'kosmetik', 'higien', 'grožio', 'parfumer',
    // Household & pets
    'namų ūkio', 'gyvūn', 'valymo', 'skalbimo',
    // Kids non-food
    'kūdikių', 'žaisla', 'vaikų prekės',
    // Electronics & tech
    'technik', 'elektronik', 'kompiuter', 'telefonų',
    // Clothing & footwear
    'drabužiai', 'avalyn', 'tekstil', 'rūbai',
    // Auto
    'automobil', 'transporto',
    // Construction & repair
    'statyb', 'remontas', 'įranki', 'santechnik',
    // Sports
    'sporto', 'treniruoč',
    // Garden (non-food)
    'sodo įranki', 'sodo technik',
];

/**
 * Checks if a section name is food-related (inclusive by default).
 * Returns true for food sections AND unclear sections.
 * Returns false ONLY for clearly non-food sections.
 */
export function isFoodSection(sectionName: string): boolean {
    const lower = sectionName.toLowerCase();
    for (const keyword of NON_FOOD_SECTION_BLACKLIST) {
        if (lower.includes(keyword)) return false;
    }
    return true;
}

/**
 * Filters discovered sections to keep only food-relevant ones.
 * Logs what was included/excluded for debugging.
 */
export function filterFoodSections(
    sections: DiscoveredSection[],
    storeName: string
): DiscoveredSection[] {
    const included: DiscoveredSection[] = [];
    const excluded: DiscoveredSection[] = [];

    for (const section of sections) {
        if (isFoodSection(section.name)) {
            included.push(section);
        } else {
            excluded.push(section);
        }
    }

    if (excluded.length > 0) {
        console.log(`[${storeName}] Excluded non-food sections: ${excluded.map(s => s.name).join(', ')}`);
    }
    console.log(`[${storeName}] Discovered ${included.length} food sections: ${included.map(s => s.name).join(', ')}`);

    return included;
}
