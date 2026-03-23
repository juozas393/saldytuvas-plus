# 🔍 REALYBĖS PATIKRA - Kas tikrai yra sistemoje?

> **SVARBU:** Šis dokumentas rodo, kas **REALIAI YRA** sukurtas, kas **PLANUOJAMA**, o kas **DAR NEPLANUOTA**.

---

## ✅ KAS JAU YRA (Sukurta)

### UI Pages (StatelessWidget su mock data)
- ✅ `DashboardPage` - Pagrindinis ekranas (mock data)
- ✅ `InventoryPage` - Inventoriaus ekranas (mock products)
- ✅ `MealPlannerPage` - Mitybos planavimo ekranas (tik placeholder)
- ✅ `ShoppingListPage` - Pirkinių sąrašo ekranas (tik placeholder)
- ✅ `ReceiptsPage` - Čekių ekranas (tik placeholder)
- ✅ `ScanPage` - Skanavimo ekranas (tik placeholder)
- ✅ `PromotionsPage` - Akcijų ekranas (tik placeholder)
- ✅ `ProfilePage` - Profilio ekranas (tik placeholder)
- ✅ `SettingsPage` - Nustatymų ekranas (tik placeholder)
- ✅ `NotificationCenterPage` - Pranešimų centras (tik placeholder)

### Struktūra
- ✅ Feature folder'iai su `pages/` struktūra
- ✅ `lib/features/` organizacija pagal funkcines sritis
- ✅ Basic Material 3 theme setup

---

## ❌ KAS NĖRA (Dar nesukurta)

### BLoC Controllers - VISI TRŪKSTA
- ❌ `DashboardBloc`
- ❌ `InventoryBloc`
- ❌ `MealPlannerBloc`
- ❌ `RecipeBloc`
- ❌ `ShoppingListBloc`
- ❌ `ReceiptBloc`
- ❌ `BudgetBloc`
- ❌ `ScanBloc`
- ❌ `PromotionsBloc`
- ❌ `AuthBloc`
- ❌ `ProfileBloc`
- ❌ `SettingsBloc`

### Services - VISI TRŪKSTA
- ❌ `MealPlanningService`
- ❌ `ShoppingListService`
- ❌ `FoodRecognitionService`
- ❌ `ReceiptParsingService`
- ❌ `ImageProcessingService`
- ❌ `OCRService`
- ❌ `BarcodeScannerService`
- ❌ `NutritionService`
- ❌ `HealthScoreService`
- ❌ `DealsUpdateJob`
- ❌ `DealsScraperService`
- ❌ `ProductMatchingService`
- ❌ `GeminiService`
- ❌ `SpoonacularService`
- ❌ `OpenFoodFactsService`

### Repositories - VISI TRŪKSTA
- ❌ Visi repository interfeisai
- ❌ Visos repository implementacijos (Supabase)

### Use Cases - VISI TRŪKSTA
- ❌ `AddProductUseCase`
- ❌ `UpdateProductUseCase`
- ❌ `DeleteProductUseCase`
- ❌ `GenerateMealPlanUseCase`
- ❌ `RecognizeFoodUseCase`
- ❌ `ScanReceiptUseCase`

### API Integrations - VISI TRŪKSTA
- ❌ Supabase konfigūracija ir klientas
- ❌ Gemini API integracija
- ❌ Spoonacular API integracija
- ❌ Open Food Facts API integracija
- ❌ OCR bibliotekos (Tesseract/ML Kit)

### Dependencies - TRŪKSTA
- ❌ `flutter_bloc` (BLoC state management)
- ❌ `supabase_flutter` (backend)
- ❌ `google_generative_ai` (Gemini AI)
- ❌ `mobile_scanner` (barcode scanning)
- ❌ `image_picker` (nuotraukų pasirinkimas)
- ❌ OCR bibliotekos
- ❌ Kitų services dependencies

---

## 📋 PLANUOJAMA (Pagal dokumentaciją)

### Fase 1: Core Infrastructure (Pirmiausia)
1. Supabase setup ir konfigūracija
2. BLoC dependency ir basic setup
3. Repository pattern implementacija
4. Basic authentication (AuthBloc)

### Fase 2: Inventory Feature (Antra prioriteto)
1. InventoryBloc
2. IInventoryRepository + Supabase implementacija
3. Product model ir DTOs
4. Inventory CRUD operacijos

### Fase 3: Scan Feature (Trečia prioriteto)
1. ScanBloc
2. BarcodeScannerService (mobile_scanner)
3. OpenFoodFactsService (produktų duomenys)
4. Image picker integracija

### Fase 4: Receipt Feature (Ketvirta prioriteto)
1. ReceiptBloc
2. ReceiptParsingService
3. OCR integracija (Tesseract/ML Kit)
4. Gemini API integracija (AI parsing)
5. BudgetBloc ir biudžeto funkcionalumas

### Fase 5: Meal Planning (Penkta prioriteto - SUDĖTINGIAUSIA)
1. MealPlannerBloc
2. GeminiService + SpoonacularService
3. MealPlanningService (hibridinis flow)
4. ShoppingListService (trūkstamų ingredientų generavimas)

### Fase 6: Promotions (Šešta prioriteto)
1. PromotionsBloc
2. DealsScraperService (scraping)
3. Background job sistema

---

## ⚠️ SVARBU - Realistiškas įvertinimas

### Ką TIKRAI padarysime (realistiškai):
1. ✅ **Inventory su CRUD** - Realistiška, nes paprasta
2. ✅ **Barcode scanning** - Realistiška, nes yra geros bibliotekos
3. ✅ **Basic receipt scanning** - Realistiška, bet bus paprastas variantas
4. ✅ **Budget tracking** - Realistiška, nes tiesiog duomenų saugojimas
5. ⚠️ **Meal planning su Gemini** - **SUDĖTINGA**, reikės daug darbo ir testavimo
6. ⚠️ **OCR + AI receipt parsing** - **SUDĖTINGA**, bus daug edge case'ų
7. ❓ **Promotions scraping** - **NEAIŠKU**, priklauso nuo parduotuvių politikos

### Ką GALBŪT nepadarysime arba supaprastinsime:
1. ❌ **Health Score Service** - Galbūt per daug sudėtinga pradžiai
2. ❌ **Advanced meal planning hibridinis flow** - Gali būti per sudėtinga, pradėti nuo paprasto
3. ❌ **Product matching su RapidFuzz** - Gali būti overkill
4. ❌ **Multiple OCR providers** - Galbūt pradėti tik nuo vieno (ML Kit)

---

## 🎯 REKOMENDACIJA - Realistiškas planas

### MVP (Minimum Viable Product) - Fokusas ant pagrindinių funkcijų:

1. **Core**
   - Auth (login/register)
   - Supabase setup
   - Basic navigation

2. **Inventory** (PAGRINDINĖ FUNKCIJA)
   - Produktų pridėjimas (ranka + barcode)
   - Produktų sąrašas
   - Galiojimo datų valdymas
   - Bazine filter/search

3. **Scan**
   - Barcode scanning
   - Produktų pridėjimas iš Open Food Facts

4. **Receipts** (SUPAPRASTINTA VERSIJA)
   - Rankinis čekių įvedimas
   - Biudžeto sekimas (išlaidos pagal kategorijas)

5. **Shopping List** (PAPRASČIAUSIA VERSIJA)
   - Rankinis pirkinių sąrašo valdymas
   - Produktų pažymėjimas kaip "reikalingas"

### Po MVP - Pridėti:
- Meal planning (paprastas variantas be AI)
- Receipt OCR (jei bus laiko)
- Promotions (jei bus laiko)

---

## 📊 Statistika

| Kategorija | Sukurta | Planuojama | Neaišku |
|-----------|---------|------------|---------|
| **Pages** | 10 | 0 | 0 |
| **BLoC Controllers** | 0 | 12 | 0 |
| **Services** | 0 | 16 | 3-5 |
| **Repositories** | 0 | 10+ | 0 |
| **Use Cases** | 0 | 6 | 0 |
| **API Integrations** | 0 | 5+ | 2-3 |
| **Dependencies** | 1 (flutter) | 15+ | 5+ |

**Realus darbas likęs:** ~80-90% projekto

---

**Išvada:** Dokumentas `mvc_robustness_structure.md` yra **VISION/PLANAS**, ne reali sistema. Didžioji dalis dar nėra implementuota.





























