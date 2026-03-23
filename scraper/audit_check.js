const stores = ['rimi', 'iki', 'lidl', 'norfa', 'maxima'];

console.log('=== NON-FOOD CHECK ===\n');
const nonFoodPatterns = /silvercrest|orkait|dulki|siurbl|indaplov|skalbi|šaldytuv|mikrobang|viryk|lygintuv|lemput|elektrin|baterij|įranki|gręžtuv|pjūkl|žoliapjov|purkštuv|ventiliator|radiator|šildytuv|rankšluost|pagalv|antklod|paklod|puod|keptuvė|laikmatis|termometr|maišytuv|valytuv|šepet|šluot|kibir|dėžut|indas|buitin|kosmetik|krepšel|telefonui|dėklas|ausinės|kabelis|žaislas/i;

for (const s of stores) {
    const d = require('./' + s + '_products.json');
    const nonfood = d.filter(p => nonFoodPatterns.test(p.name) || p.discountPrice > 30);
    if (nonfood.length > 0) {
        console.log(s.toUpperCase() + ' suspicious (' + nonfood.length + '):');
        nonfood.forEach(p => console.log('  ' + p.name.substring(0, 55) + ' | ' + p.discountPrice + '€ | ' + (p.category || '?')));
        console.log('');
    }
}

console.log('=== PRICE RANGES ===\n');
for (const s of stores) {
    const d = require('./' + s + '_products.json');
    const u1 = d.filter(p => p.discountPrice < 1).length;
    const u3 = d.filter(p => p.discountPrice >= 1 && p.discountPrice < 3).length;
    const u5 = d.filter(p => p.discountPrice >= 3 && p.discountPrice < 5).length;
    const u10 = d.filter(p => p.discountPrice >= 5 && p.discountPrice < 10).length;
    const u20 = d.filter(p => p.discountPrice >= 10 && p.discountPrice < 20).length;
    const over = d.filter(p => p.discountPrice >= 20).length;
    console.log(s.toUpperCase() + ': <1€:' + u1 + ' 1-3€:' + u3 + ' 3-5€:' + u5 + ' 5-10€:' + u10 + ' 10-20€:' + u20 + ' 20+€:' + over);
}

console.log('\n=== SAMPLE PRODUCTS (3 per store) ===\n');
for (const s of stores) {
    const d = require('./' + s + '_products.json');
    console.log(s.toUpperCase() + ':');
    d.slice(0, 3).forEach(p => {
        console.log('  ' + p.name.substring(0, 45) + ' | ' + p.discountPrice + '€' + (p.originalPrice ? ' (was ' + p.originalPrice + '€)' : '') + ' | ' + p.validFrom + ' -> ' + p.validTo);
    });
    console.log('');
}
