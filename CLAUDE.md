# Project Rules - Šaldytuvas Plus

## Projekto esmė
Mitybos planavimo asistentas: šaldytuvo turinys -> receptų pasiūlymai -> valgiaraštis -> pirkinių sąrašas. Naudotojas fotografuoja produktus/maistą, Gemini atpažįsta, sistema skaičiuoja makro + kainą pagal LT (IKI) duomenis ir parodo šeimai (household) pritaikytus pasiūlymus.

## Stack
- `mobile/` - Expo React Native (app router: `mobile/app/(tabs)/*`), veikia ir kaip web (Vercel).
- `mobile/src/` - visa logika: `features/{family,inventory,nutrition}` + `core/{services,config,network,utils}` + `components` + `theme`.
- `supabase/` - Postgres + Edge Functions + migracijos. Repozitorijos sluoksnis - `mobile/src/features/*/repositories/`.
- `scraper/` - IKI akcijų scraping, rezultatai patenka į `mobile/src/data/iki_products.json`.

## Architektūros principai
- **Feature-first**: naujas kodas eina į atitinkamą `features/<sritis>/{components,repositories,utils,types}`. NIEKADA neduok naujų failų į root'ą be priežasties.
- **Repositoriai abstrahuoja Supabase**: UI niekada nekviečia `supabase.from(...)` tiesiogiai. Visos užklausos - per repository metodą (grąžina tipintą rezultatą).
- **Tipai `types/` viduje**: `Meal`, `Product`, `Recipe`, `HouseholdMember` ir t.t. - vienas šaltinis per feature'ą.
- **Platform parity**: kai rašai komponentą, tikrink ar veiks su `Platform.OS === 'web'`. Jei `react-native-*` paketas web'e luža - apsidrausk su Platform.OS check'u arba alternatyviu renderiu (pvz. Modal vietoj Alert.alert).
- **Lithuanian locale**: visi prompt'ai Gemini'ui, Spoonacular fallback'ai, datos, kainos - LT formatu. IKI kainų paieška - per `estimate-meal-cost.ts` stem'intą tokenizerį (ą/č/ę/ė/į/š/ų/ū/ž -> ASCII + prefix match).

## Design
- **Dizaino šaltinis**: `mobile/src/theme/` - spalvos, tarpai, typography, shadows. NIEKADA neharcode'ink `#FF6B35` ar `16px` komponente; naudok `theme.colors.primary`, `theme.spacing.md`.
- **Viena veiksmo forma**: vienos funkcijos - vienas CTA (pvz. „Išsaugoti"), ne trys panašūs. Destruktyvūs veiksmai - raudonas outline + patvirtinimas per sheet'ą (ne `Alert.alert` - neveikia web'e).
- **Touch target'ai**: min 44x44 dp/pt (Apple HIG + Material). Mažesni ikonėlių mygtukai - `hitSlop`.
- **Dark/light auto**: naudok `useColorScheme()` + `theme` variantus. Jokio hardcode `#FFFFFF`.
- **LT tipografija**: lietuviškos raidės (ąčęėįšųūž) turi normaliai tilpti - tikrink ar font'as jas palaiko, jokio `letterSpacing`, kuris ardo kerning'ą.
- **Empty states**: kiekvienas tuščias sąrašas turi iliustraciją/ikoną + paaiškinimą LT + CTA (pvz. „Pirmiausia pridėk produktų į šaldytuvą").
- **Ikonos**: vienas paketas (`lucide-react-native` arba `@expo/vector-icons`), ne mix'inti.

## Loading / Async UX
- **Skeleton ne spinner**: dashboard/list'ai - skeleton komponentas (matyk `DashboardSkeleton` `index.tsx`). Spinner'is tik momentiniams veiksmams (mygtuko loading state).
- **Optimistinis UI**: inventoriaus/meal'o/shopping pokyčiai - atnaujink state iškart, Supabase užklausa eina fone. Jei nepavyksta - rollback + user-readable error (`„Nepavyko išsaugoti, bandyk dar kartą"`).
- **Debounce'ink inputs**: paieška, filtras - 300ms debounce. Jokio onChange -> fetch per simbolį.
- **Lazy indeksai**: dideli JSON (pvz. `iki_products.json`, 3000+ prekių) - tokenizuok pirmą kartą kviečiant, ne modulio top level'e. Pavyzdys: `getProductIndex()` su `productIndex` cache.
- **Memoize**: FlatList'ų `renderItem`, sunkūs callback'ai - `React.useCallback`; pure presentational komponentai - `React.memo`. `FlatList` - `keyExtractor`, `getItemLayout` kai aukštis fiksuotas.
- **Batch Supabase**: vienas `select` su `eq`/`in`/`or` vietoj kelių kvietimų for'e. Naudok `.select('col1,col2')` - ne `*`.
- **Offline-first**: Supabase krenta -> rodyk cache'ą (`AsyncStorage`), ne balta ekraną. Užrašas „Atnaujinta prieš Xmin".

## Logic
- **Pure functions utils'uose**: `features/*/utils/*.ts` - jokių side effect'ų, jokio state'o. Input -> output, lengva testuoti.
- **State lokaliai, shared kontekste**: komponento state'as - `useState`. Per kelis screen'us - React Context (matyk `mobile/src/context/`). Globalių store'ų (Redux/Zustand) nereikia - projektas per mažas.
- **Derived state - `useMemo`**: neskaičiuok to paties kiekviename render'e (pvz. filtruotas sąrašas, sumos).
- **Effect'ai su dep'ais**: `useEffect` visada su pilnu `deps` masyvu. Jei reikia „tik kartą" - `useMount` helper arba aiškus komentaras KODĖL.
- **Repozitoriai abstrahuoja Supabase**: UI niekada nekviečia `supabase.from(...)` tiesiogiai. Visos užklausos - per repository metodą (grąžina tipintą rezultatą).
- **Feature flags / config**: `core/config/` - env'ai, API URL'ai, timeouts. Ne hardcode komponente.

## Validation / Patikrinimai
- **Input boundary**: kiekvienas user input (TextInput, API response, deep link) - validate'ink PRIEŠ naudojant. Pvz. foto replace sheet'e makro reikšmės tikrinamos su `Number.isFinite`.
- **Zod ar manual narrow'ing**: išorinių duomenų tipai (Gemini response, Supabase row) - schema patikra arba type guard, ne `as`.
- **Ribos**: kainos, kalorijos, kiekiai - aiškūs min/max (pvz. `estimate-meal-cost.ts`: cap 8€/porcija, min 0.80€ jei ≥3 ingredientai).
- **AI rezultatai - patvirtinimas**: Gemini/Spoonacular grąžina - rodyk naudotojui confirmation sheet'ą su `confidence`. Jokio silent-write.
- **Form error'ai inline**: input'o apačioje, raudona, LT („Įvesk skaičių didesnį už 0"). Ne toast virš input'o.
- **Supabase RLS kaip antroji linija**: UI tikrina pirma, RLS gaudymui. Abu būtini.

## Security
- **Secrets - tik `.env`**: `SUPABASE_ANON_KEY`, `GEMINI_API_KEY`, `SPOONACULAR_KEY` - niekada į kodą, niekada į commit'ą. `.env.*` turi būti `.gitignore`.
- **Supabase**: naudok ANON key kliente (ne SERVICE_ROLE - tas tik Edge Function'uose). RLS įjungtas VISOMS lentelėms: `user_id = auth.uid()` policy.
- **API key'ai mobile'e**: Gemini/Spoonacular - per Supabase Edge Function proxy, ne tiesiogiai iš app'o (key'as nuskaitomas iš bundle'o).
- **Input sanitization**: SQL - Supabase jau param'ina, bet jei konstruoji raw `.filter()` string'ą - escape'ink. Niekada neimk user input į `rpc` kaip raw string.
- **Auth state**: tikrink `session` prieš kiekvieną mutation'ą. Jei `null` -> redirect į `/login`.
- **Foto upload**: limit size (≤5MB), content-type check, Storage bucket su RLS (`auth.uid()` subfolder).
- **Error log'uose - jokių PII**: `logger.error('failed to fetch meal', err)` - OK. `logger.error('failed for user', { email })` - NE. Naudok `user_id` tik.
- **Clipboard / deep link'ai**: jei priimi iš jų - validate'ink kaip any other input.

## Kodo kokybė
- **TypeScript strict**: jokių `any` naujame kode. Jei tipas iš išorės (pvz. Supabase raw row) - `interface` + narrow'inimas.
- **Klaidų apdorojimas**: `try/catch` async'e + `logger.error` (`mobile/src/core/utils/logger.ts`, ne `console.log`) + naudotojui rodyk trumpą LT pranešimą (ne stack trace).
- **Konstantos**: magiški skaičiai (kainų cap'ai, confidence threshold'ai, porcijų kiekiai) - į `core/config/` arba modulio viršų su komentaru, KODĖL būtent tokia reikšmė.

## Kodo kokybė
- **TypeScript strict**: jokių `any` naujame kode. Jei tipas iš išorės (pvz. Supabase raw row) - `interface` + narrow'inimas.
- **Klaidų apdorojimas**: `try/catch` async'e + `logger.error` (`mobile/src/core/utils/logger.ts`, ne `console.log`) + naudotojui rodyk trumpą LT pranešimą (ne stack trace).
- **Gemini/AI rezultatai**: visada tikrink `confidence` ir rodyk naudotojui patvirtinimo sheet'ą (matyk `PhotoReplaceConfirmSheet`). Jokių silent-write į bazę.
- **Konstantos**: magiški skaičiai (kainų cap'ai, confidence threshold'ai, porcijų kiekiai) - į `core/config/` arba modulio viršų su komentaru, KODĖL būtent tokia reikšmė.

## Resource efficiency (Claude darbui)
- **Edit > Write**: jei failas egzistuoja, naudok `Edit`. `Write` tik naujiems failams arba pilnam rewrite'ui.
- **Read tik reikia**: jei žinai eilutes - `offset`+`limit`. Nelaikink viso 800-eilučių komponento kontekste, jei dirbi tik su vienu helper'iu.
- **Grep > Agent**: konkreti paieška (simbolis, string'as) - `Grep`. `Agent` tik open-ended klausimams per kelis failus.
- **Paraleliai**: nepriklausomi tool call'ai - vienoje žinutėje (kelios `Bash`/`Read` iškart).
- **Netikrink save**: jei `Edit` grąžino OK - nebekartok `Read`. Harness'as žino.
- **Jokio auto-build/auto-deploy**: `npm install`, `eas build`, `vercel deploy`, migracijų vykdymas - tik jei naudotojas AIŠKIAI paprašo. Lint/typecheck galima siūlyti, bet ne vykdyti savo iniciatyva.

## Writing Style
- Konkrečiai apie šią sistemą (mitybos planavimas, šaldytuvas, šeima, IKI kainos) - jokių bendrinių „modern app" frazių.
- Nuomonė - konkreti: „čia krenta į fallback, nes ingredientų tokenizer'is nerado atitikmens", ne „gal būtų geriau patikrinti".

## Terminology
- „naudotojas", niekada „vartotojas".
- „šaldytuvas", „valgiaraštis", „pirkinių sąrašas", „akcijos" - LT domeno žodynas.
- Kodo komentaruose LT OK, bet technikai („stem", „tokenize", „optimistic update") - angliškai, kad nebūtų painiavos.

## Git discipline
- Commit'ai - loginiai blokai, ne per-file. Vienas commit = viena funkcija/fix'as.
- Žinutės LT, imperatyvu: „prideda IKI kainų estimator'ių PhotoReplace sheet'ui", ne „added stuff".
- Nekomituok `node_modules/`, `.env`, `ios/Pods/`, `android/build/`, `_test_*.json`, `_deploy_payload.json`, ekrano nuotraukų į root'ą.

## Testavimo lentelės ir UML diagramų atitikimas (BAKALAURO PROJEKTUI)

Kai naudotojas prašo testavimo scenarijaus pagal panaudojimo atvejį arba klausia „ar veikia kaip diagramoje", PRIVALOMA:

1. **Diagramos yra etalonas** - jei kodas neatitinka, taisyti KODĄ, ne perrašyti scenarijų ar diagramą.
2. **Detali patikra prieš teiginį** - prieš sakant „kodas atitinka diagramą", privaloma:
   - Perskaityti diagramą (visus swimlanes, decision'us, alt/opt šakas)
   - Suformuluoti reikalavimų sąrašą
   - Surasti realų kodą (`grep` + `Read` keliuose failuose, ne tik viename)
   - Patikrinti KIEKVIENĄ reikalavimą prieš diagramą
   - Jei trūksta - taisyti kodą (pvz. pridėti `uiConfirm` patvirtinimo dialogą, validacijos klaidas, alternatyvius kelius)
3. **Niekada neteigti, kad veikia, patikrinus tik vieną-du raktus** - tikrinti VISAS šakas: alt, opt, decision, validacijos klaidos, klaidos atvejai.
4. **UI tekstai turi tiksliai atitikti** - jei mygtukas vadinasi „Tęsti su Google", scenarijuje rašyti tą pavadinimą, ne „Prisijungti su Google paskyra".
5. **Lentelės forma**: paprasta, be markdown `|---|` separatorių - tab'ais atskirtos eilutės kopijavimui į Word. Prieš lentelę - vienas sakinys su „prieš sąlyga". Be „Išvada" eilutės, be detalių techninių klasių pavadinimų (jei nepasakyta kitaip).
6. **Lietuviškos kabutės** „ " (U+201E + U+201C) - per Bash'ą su Python, kad nebūtų auto-konvertuotos į " ".

**Kodėl svarbu:** recenzentas tikrins ar realybė atitinka diagramas. Bet kuris neatitikimas - prastas vertinimas. Paviršutiniškas tikrinimas sukels klaidingą įspūdį, kad viskas veikia, kai realiai trūksta dialogų, validacijų ar sąlygų.

## Ko NEDARYTI
- Nedėti naujo `<View>` su absoliučiu pozicionavimu virš esamų sheet'ų - naudoti `Modal` per React Native API.
- Nekartoti to paties info dviejuose dashboard card'uose (pvz. „produktų skaičius" jau yra „Šaldytuvo sudėtis" - atskiro card'o nereikia).
- Neperrrašyti `spoonacularService.ts` pilnai - jis jau su LT fallback'ais; pridėk eksportą/metodą, ne rewrite'ą.
- Nediegi naujų libs be reikalo: jei galima su `Animated` API - nereikia `reanimated`. Jei galima su `fetch` - nereikia `axios`.
- Neišvalyk `Bakalauras/`, `FB/`, `Ataskait*` katalogų - tai baigiamojo darbo failai, ne kodas.
