# 🍽️ Meal Planning Robustness Diagram - Argumentuota Analizė

> **Tikslas:** Nustatyti, kas **TURĖTŲ BŪTI** ir ko **NEREIKIA** robustness diagramoje pagal **ACTIVITY DIAGRAMĄ** (ne sequence diagramą).

> **SVARBU:** Robustness diagramos braižomos remiantis **activity diagramomis**, ne sequence diagramomis. Sequence diagramos braižomos **PO** robustness diagramų.

---

## 📊 **PAGRINDINIAI PRINCIPAI (BCE/ICONIX):**

### ✅ **Taisyklės:**
- **Actor → Boundary:** Vartotojas kalba tik su UI boundaries
- **Boundary → Control:** UI boundaries kalba tik su controlleriais
- **Control → Control:** Controlleriai gali kalbėtis tarpusavyje
- **Control → Entity:** Controlleriai manipuliuoja entity
- **Control → Service Boundary:** Controlleriai kalba su išoriniais servisais
- **Entity → Entity:** Entity gali turėti ryšius (kompozicija/agregacija)
- ❌ **Boundary → Entity:** Boundary niekada nekalba tiesiogiai su entity
- ❌ **Boundary → Boundary:** Boundary nekalba tiesiogiai su kitu boundary

---

## ✅ **KAS TURĖTŲ BŪTI (pagal activity diagramą):**

### 1. **ACTOR:**
```
✅ Šeimos narys
```
**Kodėl:** Activity diagramoje yra `|#FFE0B2|Šeimos narys|` (eilutė 11). Vartotojas inicijuoja visą procesą.

**SVARBU:** Jei **useris pradeda** (actor), tai **NENAUDOJA Member entity**. Member entity naudojamas tik tada, kai sistema turi manipuliuoti Member objektą (pvz., admin valdo šeimos narius). Čia useris tiesiog **naudojamas kaip actor**, ne entity.

---

### 2. **UI BOUNDARY:**
```
✅ MealPlanningPage <<boundary>>
```
**Kodėl:** Activity diagramoje yra veiksmai, kuriuos vartotojas atlieka per UI:
- `Atidaryti mitybos planavimo puslapį` (eilutė 13)
- `Atidaryti plano generavimo formą` (eilutė 25)
- `Suvesti tikslus` ir `Suvesti apribojimus` (eilutės 26-27)
- `Peržiūrėti sugeneruotą planą` (eilutė 55)
- `Patvirtinti arba atšaukti` (eilutė 56)

Tai yra UI boundary, kuris gauna vartotojo įvestį ir perduoda ją į Controller.

**Funkcijos (pagal activity diagramą):**
- Rodo formą su laukais (dienos, kalorijos, alergijos, dietType, preferences)
- Rodo sugeneruotą planą su variantais
- Rodo sėkmės/klaidos pranešimus

---

### 3. **CONTROLLER:**
```
✅ MealPlanningController <<control>>
```
**Kodėl:** Activity diagramoje yra veiksmai, kuriuos atlieka `|#C8E6C9|Posistemis|` (sistema):
- `Patikrinti ar yra esamas planas` (eilutė 16)
- `Validuoti įvestus duomenis` (eilutė 30)
- `Sukurti inventory snapshot` (eilutė 37)
- `Gauti esamą mitybos planą` (eilutė 78)
- `Sukurti Meal objektą` (eilutė 102)
- `Perjungti valgio locked būseną` (eilutė 105)
- `Pašalinti valgį iš plano` (eilutė 133)
- `Filtruoti užrakintus valgius` (eilutė 143)

Tai yra centrinis koordinatorius (Controller), kuris koordinuoja visus veiksmus.

**Funkcijos (pagal activity diagramą):**
- Validuoja įvestį (eilutė 30)
- Gauna inventoriaus duomenis iš DB (eilutė 34)
- Sukuria inventory snapshot (eilutė 37)
- Koordinuoja `MealPlanningService` (eilutės 45-49)
- Išsaugo planą į DB (eilutės 60, 109, 122, 136, 147)
- Koordinuoja `ShoppingListService` (eilutės 62-63, 150-151)

---

### 4. **SERVICE (Business Logic):**
```
✅ MealPlanningService <<control>>
```
**Kodėl:** Activity diagramoje yra `|#C8E6C9|MealPlanningService|` kaip atskiras participant (eilutės 45, 92, 142). Tai yra business logic service.

**Funkcijos (pagal activity diagramą):**
- `Generuoti meal-intent per Gemini API` (eilutė 46)
- `Ieškoti receptų per Spoonacular API (3 variantai per valgį)` (eilutė 47)
- `Sujungti variantus ir perskaičiuoti kalorijas` (eilutė 48)
- `Apskaičiuoti ingredientų panaudojimą` (eilutė 49)
- `Generuoti naujus 3 variantus` (eilutė 93)
- `Filtruoti užrakintus valgius` (eilutė 143)
- `Regeneruoti neužrakintus valgius` (eilutė 144)

**Ryšiai:**
- Kalba su `GeminiServiceBoundary` (eilutė 46)
- Kalba su `SpoonacularServiceBoundary` (eilutė 47)

---

### 5. **SERVICE BOUNDARIES (Išorinės sistemos):**
```
✅ GeminiServiceBoundary <<boundary>>
✅ SpoonacularServiceBoundary <<boundary>>
```
**Kodėl:** Activity diagramoje yra:
- `Generuoti meal-intent per Gemini API` (eilutė 46)
- `Ieškoti receptų per Spoonacular API` (eilutė 47)

**Funkcijos (pagal activity diagramą):**
- **Gemini:** Generuoja `meal-intent` JSON su struktūrizuotais pageidavimais (eilutė 46)
- **Spoonacular:** Ieško 3 receptų variantų kiekvienam valgiui (eilutė 47)

**Kodėl boundary, ne service:**
- Tai yra **išorinės sistemos** (API), ne mūsų sistemos dalis
- Pagal BCE/ICONIX principus, išorinės sistemos yra **boundaries**
- Pagal `manage_products_PILNA_SUMMA.md` principą: "Service Boundaries - tik išorinės sistemos"

---

### 6. **SERVICE (Shopping List):**
```
✅ ShoppingListService <<control>>
```
**Kodėl:** Activity diagramoje yra `|#C8E6C9|ShoppingListService|` kaip atskiras participant (eilutės 62, 150). Tai yra business logic service.

**Funkcijos (pagal activity diagramą):**
- `Sugeneruoti pirkinių sąrašą pagal trūkstamus ingredientus` (eilutė 63)
- `Atnaujinti pirkinių sąrašą pagal pakeitimus` (eilutė 151)

---

### 7. **ENTITIES:**
```
✅ InventoryEntity <<entity>>
✅ MealPlanEntity <<entity>> (arba NutritionPlan <<entity>>)
```
**Kodėl:** Activity diagramoje yra:
- `Gauti inventoriaus duomenis` (eilutė 34) → `InventoryEntity`
- `Sukurti inventory snapshot` (eilutė 37) → `InventoryEntity`
- `Įrašyti mitybos planą` (eilutė 60) → `MealPlanEntity`
- `Gauti esamą mitybos planą` (eilutė 78) → `MealPlanEntity`
- `Sukurti Meal objektą` (eilutė 102) → `MealPlanEntity` (kaip dalis)
- `Atnaujinti valgį plano duomenyse` (eilutė 109) → `MealPlanEntity`
- `Atnaujinti planą su nauju valgiu` (eilutė 122) → `MealPlanEntity`
- `Atnaujinti planą` (eilutės 136, 147) → `MealPlanEntity`

**Funkcijos (pagal activity diagramą):**
- **InventoryEntity:** Saugo inventoriaus duomenis, sukuria snapshot
- **MealPlanEntity:** Saugo mitybos plano duomenis (meals, dates, locked_meals)

**Pastaba:** `MealPlanEntity` yra tas pats kaip `NutritionPlan` architektūroje (žr. `CURRENT_DIAGRAM_STATUS.md`).

---

### 8. **DATABASE (Supabase):**
```
✅ Database (Supabase DB)
```
**Kodėl:** Activity diagramoje yra `|#E1BEE7|Supabase DB|` kaip atskiras participant (eilutės 33, 59, 65, 108, 121, 135, 146, 166, 169). Tai yra duomenų bazė.

**Funkcijos (pagal activity diagramą):**
- `Gauti inventoriaus duomenis` (eilutė 34) → `inventory_items` lentelė
- `Įrašyti mitybos planą` (eilutė 60) → `meal_plans` lentelė
- `Įrašyti shopping list` (eilutė 66) → `shopping_lists` lentelė
- `Atnaujinti valgį plano duomenyse` (eilutė 109) → `meal_plans` lentelė
- `Atnaujinti planą su nauju valgiu` (eilutė 122) → `meal_plans` lentelė
- `Atnaujinti planą` (eilutės 136, 147) → `meal_plans` lentelė
- `Ištrinti planą (soft delete)` (eilutė 167) → `meal_plans` lentelė
- `Ištrinti susijusį shopping list` (eilutė 170) → `shopping_lists` lentelė

**Pastaba:** Pagal `manage_products_PILNA_SUMMA.md` principą: "Supabase NĖRA boundary" - Supabase yra mūsų sistemos dalis (duomenų bazė), ne išorinė sistema. Tai implementacijos detalė. Database tiesiog yra duomenų bazė, ne boundary.

---

## ❌ **KO NEREIKIA (ir kodėl):**

### 1. **❌ Member Entity:**
```
❌ Member <<entity>>
```
**Kodėl NEREIKIA:**
- Activity diagramoje **NĖRA** `Member` entity kaip participant
- Activity diagramoje yra tik `|#FFE0B2|Šeimos narys|` kaip **actor**, ne entity
- Database užklausose naudojamas tik `user_id` kaip **parametras** (eilutė 34: `WHERE user_id = ?`), ne `Member` objektas
- `Member` entity naudojamas **kituose use case'uose** (pvz., `FamilyMembersController` - admin valdo šeimos narius), bet **NE** meal planning creation procese
- **SVARBU:** Jei **useris pradeda** (actor), tai **NENAUDOJA Member entity**. Member entity naudojamas tik tada, kai sistema turi manipuliuoti Member objektą (pvz., admin valdo šeimos narius, keičia Member profilio duomenis). Čia useris tiesiog **naudojamas kaip actor**, ne entity.

**Išvada:** ❌ **NEREIKIA** robustness diagramoje.

---

### 2. **❌ FoodRule Entity:**
```
❌ FoodRule <<entity>>
```
**Kodėl NEREIKIA:**
- Activity diagramoje **NĖRA** `FoodRule` entity kaip participant
- Activity diagramoje yra tik `Suvesti apribojimus: Alergijos, Dietos tipas, Pageidavimai` (eilutė 27) kaip **formos laukai**, ne `FoodRule` entity
- `FoodRule` entity naudojamas **kituose use case'uose**:
  - `FoodRulesController` (admin) - valdyti maisto taisykles (CRUD)
  - `FoodSubstituteController` (admin) - siūlyti pakaitalus
- Bet **NE** meal planning creation procese
- `allergies` ir `dietType` yra tiesiog **formos laukai** (string/array), ne `FoodRule` objektai
- `FoodRule` entity naudojamas tik tada, kai admin **valdo** maisto taisykles (sukuria, redaguoja, trina), bet ne kai vartotojas **naudoja** taisykles (tiesiog įveda alergijas ir dietType formoje)

**Išvada:** ❌ **NEREIKIA** robustness diagramoje.

---

### 3. **❌ SupabaseClient kaip Boundary:**
```
❌ SupabaseClient <<boundary>>
```
**Kodėl NEREIKIA:**
- Activity diagramoje `Supabase DB` yra kaip `|#E1BEE7|Supabase DB|` participant, bet robustness diagramoje **NĖRA boundary**
- Supabase yra **mūsų sistemos dalis** (duomenų bazė), ne išorinė sistema
- Pagal BCE/ICONIX principus, boundaries yra tik **išorinės sistemos** (API, išoriniai servisai)
- Pagal `manage_products_PILNA_SUMMA.md` principą: "Supabase NĖRA boundary" - Supabase yra mūsų sistemos dalis (duomenų bazė), ne išorinė sistema. Entity objektai tiesiog saugomi Supabase - tai implementacijos detalė.
- Database yra implementacijos detalė, ne boundary

**Išvada:** ❌ **NEREIKIA** robustness diagramoje kaip boundary. Database tiesiog yra duomenų bazė.

---

### 4. **❌ HealthEvaluationController:**
```
❌ HealthEvaluationController <<control>>
```
**Kodėl NEREIKIA:**
- Activity diagramoje **NĖRA** `HealthEvaluationController` kaip participant
- Health evaluation yra **atskiras use case**, ne meal planning creation dalis
- Health evaluation vyksta **automatiškai po** meal plan sukūrimo (per DB trigger), ne per meal planning creation procesą
- Activity diagramoje health evaluation nėra paminėtas

**Išvada:** ❌ **NEREIKIA** robustness diagramoje meal planning creation use case.

---

### 5. **❌ Recipe Entity:**
```
❌ Recipe <<entity>>
```
**Kodėl NEREIKIA:**
- Activity diagramoje **NĖRA** `Recipe` entity kaip participant
- `MealPlanningService` gauna receptus iš `SpoonacularServiceBoundary` (eilutė 47), bet tai yra **temporary data**, ne entity
- `Recipe` entity naudojamas **kituose use case'uose** (pvz., `RecipeController` - valdo receptų biblioteką), bet **NE** meal planning creation procese
- Meal plan saugo `meals` kaip JSON (eilutė 60), ne kaip `Recipe` objektus
- Activity diagramoje yra `Suvesti arba pasirinkti receptą` (eilutė 116), bet tai tiesiog **formos laukas**, ne `Recipe` entity

**Išvada:** ❌ **NEREIKIA** robustness diagramoje.

---

### 6. **❌ ShoppingList Entity:**
```
❌ ShoppingList <<entity>>
```
**Kodėl NEREIKIA (arba gali būti, bet nėra būtina):**
- Activity diagramoje `ShoppingListService` generuoja shopping list (eilutės 62-63, 150-151), bet tai yra **temporary data**, ne entity, kuris būtų naudojamas robustness diagramoje
- `ShoppingList` entity naudojamas **kituose use case'uose** (pvz., `ShoppingListBloc` - peržiūrėti shopping list), bet **NE** meal planning creation procese
- Meal planning creation procese shopping list tiesiog **išsaugomas į DB** (eilutė 66), bet entity nėra naudojamas robustness diagramoje
- Pagal `manage_products_PILNA.puml` pavyzdį, shopping list entity nėra naudojamas robustness diagramoje, jei jis nėra tiesiogiai manipuliuojamas per UI

**Išvada:** ❌ **NEREIKIA** robustness diagramoje (arba gali būti, jei norite parodyti, kad shopping list yra sukurtas, bet tai nėra būtina).

---

## 📊 **GALUTINĖ STRUKTŪRA (kas turėtų būti):**

### **ACTOR:**
1. ✅ Šeimos narys

### **UI BOUNDARIES:**
2. ✅ MealPlanningPage <<boundary>>

### **CONTROLLERS:**
3. ✅ MealPlanningController <<control>>

### **SERVICES (Business Logic):**
4. ✅ MealPlanningService <<control>>
5. ✅ ShoppingListService <<control>>

### **SERVICE BOUNDARIES (Išorinės sistemos):**
6. ✅ GeminiServiceBoundary <<boundary>>
7. ✅ SpoonacularServiceBoundary <<boundary>>

### **ENTITIES:**
8. ✅ InventoryEntity <<entity>>
9. ✅ MealPlanEntity <<entity>> (arba NutritionPlan <<entity>>)

### **DATABASE:**
10. ✅ Database (Supabase DB)

---

## 🔗 **RYŠIAI (pagal activity diagramą):**

### **Actor → Boundary:**
```
Šeimos narys --> MealPlanningPage : atidaro puslapį, atidaro formą, suveda duomenis, peržiūrėti planą, patvirtina/atšaukia
```

### **Boundary → Control:**
```
MealPlanningPage --> MealPlanningController : CreateMealPlanEvent, ConfirmMealPlanEvent, EditMealPlanEvent, DeleteMealPlanEvent
```

### **Control → Control (Services):**
```
MealPlanningController --> MealPlanningService : generateMealPlan(), regenerateMealVariants(), filterLockedMeals()
MealPlanningController --> ShoppingListService : generateShoppingList(), updateShoppingList()
```

### **Control → Service Boundary:**
```
MealPlanningService --> GeminiServiceBoundary : generateMealIntent()
MealPlanningService --> SpoonacularServiceBoundary : searchRecipes()
```

### **Control → Entity:**
```
MealPlanningController --> InventoryEntity : createSnapshot(), getInventoryData()
MealPlanningController --> MealPlanEntity : create(), update(), delete(), getMealPlan()
```

### **Control → Database:**
```
MealPlanningController --> Database : SELECT inventory_items, INSERT meal_plans, UPDATE meal_plans, DELETE meal_plans, INSERT shopping_lists, UPDATE shopping_lists
```

---

## ✅ **IŠVADA:**

**TURĖTŲ BŪTI:**
- ✅ Actor: Šeimos narys
- ✅ Boundary: MealPlanningPage
- ✅ Controller: MealPlanningController
- ✅ Services: MealPlanningService, ShoppingListService
- ✅ Service Boundaries: GeminiServiceBoundary, SpoonacularServiceBoundary
- ✅ Entities: InventoryEntity, MealPlanEntity
- ✅ Database: Supabase DB

**NEREIKIA:**
- ❌ Member Entity (naudojamas tik `userId` kaip parametras)
- ❌ FoodRule Entity (naudojami tik `allergies` ir `dietType` kaip parametrai)
- ❌ SupabaseClient kaip Boundary (database yra implementacijos detalė)
- ❌ HealthEvaluationController (atskiras use case)
- ❌ Recipe Entity (temporary data iš Spoonacular)
- ❌ ShoppingList Entity (nėra naudojamas robustness diagramoje)

---

**Versija:** 2025-01-XX  
**Autorius:** AI Assistant  
**Pagrindas:** `docs/diagrams/activity/manage_meal_plan.puml` + `docs/diagrams/robustness/manage_products_PILNA.puml` + architektūros dokumentai

**SVARBU:** Robustness diagramos braižomos remiantis **activity diagramomis**, ne sequence diagramomis. Sequence diagramos braižomos **PO** robustness diagramų.

