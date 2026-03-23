# 🍽️ Mitybos Langas (Nutrition Screen)

## 📍 Vieta
- **Failas:** `mobile/app/(tabs)/nutrition.tsx`
- **Tab:** "Mityba" (3-ias tab'as)
- **Icon:** `meal-plan`

---

## 🎯 Pagrindinis Tikslas

Mitybos langas yra **entry point** į mitybos planavimo sistemą. Jis turėtų rodyti:
1. **Dabartinio mitybos plano peržiūrą** (jei yra aktyvus planas)
2. **Mitybos analizę** (kalorijos, makroelementai, progress)
3. **Greitą navigaciją** į mitybos planavimą

---

## 📋 Funkcionalumas (Pagal Workspace Rules)

### 1. **Dabartinio Mitybos Plano Peržiūra**

Jei vartotojas turi aktyvų mitybos planą (dabartinė data patenka į `plan_start_date` - `plan_end_date`):

#### A. **Šiandienos Valgiai**
- **Breakfast** (Pusryčiai)
- **Lunch** (Pietūs)  
- **Dinner** (Vakarienė)

Kiekvienam valgiui:
- Recepto pavadinimas
- Kalorijos (pvz., "450 kcal")
- 3 variantai (jei yra) - galimybė pasirinkti kitą variantą
- Status: `completed` / `pending` (checkbox)
- Confidence indikatorius (Gemini vs Spoonacular)

#### B. **Dienos Suvestinė**
- **Kalorijų balansas:**
  - Tikslinės kalorijos (pvz., 2000 kcal)
  - Suvalgytos kalorijos (pvz., 1450 kcal)
  - Likę kalorijos (pvz., 550 kcal)
  - Progress bar
- **Makroelementai:**
  - Baltymai (g) + progress
  - Angliavandeniai (g) + progress
  - Riebalai (g) + progress

#### C. **Savaitės Peržiūra** (Optional)
- Kalendorius su 7 dienomis
- Kiekviena diena rodo:
  - Valgių skaičius
  - Kalorijų suma
  - Status (visi suvalgyti / dalis / nieko)

---

### 2. **Mitybos Analizė**

#### A. **Statistikos Kortelės**
- **Šiandien:**
  - Suvalgytos kalorijos
  - Makroelementų pasiskirstymas
  - Valgių completion rate (pvz., "2/3 suvalgyti")
- **Šią savaitę:**
  - Vidutinės dienos kalorijos
  - Sėkmės streak (dienų skaičius, kai visi valgiai suvalgyti)
  - Makroelementų vidurkiai

#### B. **Ingredientų Integracija**
- Rodo, kiek ingredientų iš inventoriaus bus panaudota
- Pvz.: "5 iš 8 ingredientų jau turite šaldytuve"
- Linkas į shopping list (trūkstami ingredientai)

---

### 3. **Greita Navigacija**

#### A. **Mygtukai**
- **"Mitybos planavimas"** (Primary) → `/meal-planning`
  - Jei nėra plano: "Sukurti naują planą"
  - Jei yra planas: "Redaguoti planą"
- **"Peržiūrėti receptus"** (Secondary) → `/recipes` (jei yra)
- **"Shopping List"** (Secondary) → `/shopping-list` (jei yra trūkstamų ingredientų)

---

## 🔄 Integracija su Meal Planning Hibridiniu Srautu

Pagal **Workspace Rules §18** (Meal Planning Hibridinis Srautas):

### 1. **Duomenų Šaltiniai**
- **Gemini AI:** Generuoja `meal-intent` JSON pagal vartotojo profilį
- **Spoonacular API:** Gauna 3 receptų variantus kiekvienam valgiui
- **MealPlanningService:** Sujungia variantus ir perskaičiuoja kalorijas

### 2. **Kalorijų Balansas**
- Dienos kalorijos = vartotojo tikslas **±3%**
- Kiekvienas valgis turi nurodytą kalorijų diapazoną
- Rodo, ar planas atitinka tikslą

### 3. **Variantų Rodymas**
- Max **3 opcijos per valgį**
- Sorted pagal:
  1. Kalorijas (artimiausias tikslui)
  2. Ingredientų sutapimą (kiek turimų ingredientų)
- Confidence indikatoriai (Gemini vs Spoonacular)

---

## 📊 UI Komponentai

### 1. **Header**
- Pavadinimas: "Mitybos informacija"
- Optional: Date picker (peržiūrėti kitą dieną/savaitę)

### 2. **Today's Meals Card**
- 3 valgiai (breakfast/lunch/dinner)
- Kiekvienas valgis:
  - Recepto pavadinimas
  - Kalorijos
  - Checkbox (completed/pending)
  - "Keisti variantą" mygtukas (jei yra 3 variantai)

### 3. **Nutrition Summary Card**
- Kalorijų progress bar
- Makroelementų progress bars
- Ingredientų integracijos indikatorius

### 4. **Stats Cards**
- Šiandienos statistikos
- Savaitės statistikos
- Streak indikatorius

### 5. **Action Buttons**
- "Mitybos planavimas" (Primary)
- "Shopping List" (Secondary, jei reikia)
- "Peržiūrėti receptus" (Secondary)

---

## 🔗 Integracijos

### 1. **Inventory Integration**
- Rodo, kurie ingredientai jau yra šaldytuve
- Panaudojimo procentas (pvz., "60% ingredientų turite")

### 2. **Shopping List Integration**
- Trūkstami ingredientai automatiškai pridedami į shopping list
- Linkas į shopping list su trūkstamų ingredientų skaičiumi

### 3. **Meal Planning Integration**
- Navigacija į `/meal-planning` ekraną
- Jei nėra plano → rodo "Sukurti naują planą"
- Jei yra planas → rodo "Redaguoti planą"

---

## 📱 Dabartinė Būklė

**Dabar (`nutrition.tsx`):**
- ✅ Basic UI struktūra
- ✅ Empty state su pranešimu
- ✅ Mygtukas "Mitybos planavimas" → `/meal-planning`
- ❌ Nėra mitybos plano peržiūros
- ❌ Nėra statistikos
- ❌ Nėra kalorijų/makroelementų rodymo

---

## 🎯 Rekomenduojamas Funkcionalumas (MVP)

### Fase 1: Basic Peržiūra
1. **Aktyvaus plano rodymas** (jei yra)
   - Šiandienos valgiai su checkbox'ais
   - Kalorijų suvestinė
2. **Navigacija** į meal planning

### Fase 2: Statistikos
1. **Kalorijų progress bar**
2. **Makroelementų rodymas**
3. **Streak indikatorius**

### Fase 3: Integracijos
1. **Inventory integration** (ingredientų panaudojimas)
2. **Shopping list integration** (trūkstami ingredientai)
3. **Variantų pasirinkimas** (3 variantai per valgį)

---

## 🏗️ Architektūra (Pagal Jūsų Magic Systems)

### **React Native Versija (Clean Architecture):**

Pagal `docs/architecture/COMPLETE_ARCHITECTURE_OVERVIEW.md` ir `MEALPLAN_NO_DUPLICATION.md`:

#### **Struktūra:**
```
mobile/src/
├── features/
│   └── nutrition/  (arba meal-planning/)
│       ├── components/     ← UI komponentai
│       ├── hooks/          ← Custom hooks (React Native BLoC ekvivalentas)
│       │   └── useMealPlanning.ts  ← MealPlanningController ekvivalentas
│       ├── services/       ← Business logic
│       └── types/          ← TypeScript types (Entities)
├── services/
│   ├── meal-planning.service.ts  ← MealPlanningService (hibridinis srautas)
│   ├── gemini.service.ts         ← GeminiServiceBoundary
│   └── spoonacular.service.ts   ← SpoonacularServiceBoundary
└── core/
    └── storage/
        └── local-storage.ts      ← LocalStorage (nėra Supabase)
```

#### **Priklausomybės (Pagal Architektūrą):**
```
NutritionPage (View)
  ↓
useMealPlanning hook (Controller ekvivalentas)
  ↓
MealPlanningService (Services)
  ↓
  ├── GeminiService (ExternalServices)
  ├── SpoonacularService (ExternalServices)
  └── IMealPlanRepository (DataAccess) → LocalStorage
```

#### **MealPlanningController Ekvivalentas:**
React Native naudoja **custom hook** vietoj BLoC:

```typescript
// mobile/src/features/meal-planning/hooks/useMealPlanning.ts
export const useMealPlanning = () => {
  // Read-only peržiūra (Member)
  const { mealPlan, isLoading, error } = useMealPlanQuery();
  
  // Admin CRUD (jei reikia)
  const createMealPlan = useCreateMealPlan();
  const updateMealPlan = useUpdateMealPlan();
  const deleteMealPlan = useDeleteMealPlan();
  
  return {
    mealPlan,
    isLoading,
    error,
    // Admin methods (tik jei permissions)
  };
};
```

#### **NutritionPage Naudojimas:**
```typescript
// mobile/app/(tabs)/nutrition.tsx
export default function NutritionScreen() {
  const { mealPlan, isLoading } = useMealPlanning(); // ← Controller ekvivalentas
  
  // Tik peržiūra (read-only)
  if (isLoading) return <LoadingState />;
  if (!mealPlan) return <EmptyState />;
  
  return (
    <View>
      <TodayMeals meals={mealPlan.todayMeals} />
      <NutritionSummary plan={mealPlan} />
      <Button onPress={() => router.push('/meal-planning')} />
    </View>
  );
}
```

---

## 📝 Pastabos

- **Nėra Supabase** šiame projekte (pagal workspace rules)
- **Duomenys:** LocalStorage arba mock data (dev)
- **AI integracija:** Gemini + Spoonacular (pagal hibridinį srautą)
- **Performance:** Lazy render, memoization, O(1) lookups
- **Architektūra:** Clean Architecture su React Native hooks (BLoC ekvivalentas)

---

**Versija:** 1.0.1  
**Atnaujinta:** 2025-01-06  
**Status:** Planuojama / Development  
**Architektūra:** Clean Architecture (React Native hooks ekvivalentas BLoC)

