# Projekto struktūra pagal MVC / Robustumo diagramos principus

## ⚠️ SVARBU - ŠIS DOKUMENTAS YRA PLANAS/VISION

> **DĖMESIO:** Šis dokumentas aprašo **TIKSLĄ VIZIJĄ** ir **PLANĄ** sistemos architektūrai. **DIDŽIOJI DALIS KOMPONENTŲ DAR NĖRA SUKURTA.**
> 
> **Realaus projekto būklę** žiūrėkite: [`REALITY_CHECK.md`](./REALITY_CHECK.md)

### Kas yra šiame dokumente:
- ✅ **UI Boundaries (Langai)** - Dauguma page'ų jau sukurti (bet be logikos)
- ⚠️ **Controller'iai** - **VISI TRŪKSTA** (dar nėra sukurti)
- ⚠️ **API Boundaries** - **VISI TRŪKSTA** (dar nėra integruoti)
- ⚠️ **Services** - **VISI TRŪKSTA** (dar nėra sukurti)

### Tikslas:
Šis dokumentas skirtas **projektavimo tikslams** - suprasti sistemos struktūrą, priklausomybes ir srautus. Tai yra **roadmap**, ne aprašymas esamos sistemos.

---

## 📋 Apžvalga

Šis dokumentas suskirsto visus projekto komponentus pagal **Robustumo diagramos** principus:
- **Boundary** - sistemos ribos (API, DB, išorinės sistemos)
- **Controller** - verslo logika (BLoC, Services, Use Cases)
- **Entity** - duomenų modeliai (Models, DTOs)

---

## 🟦 BOUNDARY OBJEKTAI (Sistemos ribos)

### UI Ribos - Langai (User Interface Boundaries)

UI ribos (langai) yra sąsaja tarp vartotojo (actor) ir sistemos. Kiekvienas langas yra boundary, kuris gauna vartotojo įvestį ir perduoda ją į Controller'ius.

| Langas (Boundary) | Status | Aprašymas | Controller(iai) | API Boundary jungtys | Vieta |
|------------------|--------|-----------|-----------------|----------------------|-------|
| **Pagrindinis langas** | ✅ Sukurtas | Pagrindinis ekranas (dashboard) | `DashboardBloc` ⚠️ | `Supabase API Boundary` ❌ | `lib/features/dashboard/pages/dashboard_page.dart` |
| **Inventoriaus langas** | ✅ Sukurtas | Inventoriaus peržiūra ir valdymas | `InventoryBloc` ⚠️ | `Supabase API Boundary` ❌, `Open Food Facts API Boundary` ❌ | `lib/features/inventory/pages/inventory_page.dart` |
| **Produkto pridėjimo langas** | ❌ Nėra | Naujo produkto pridėjimas | `InventoryBloc` ⚠️ | `Open Food Facts API Boundary` ❌ (barcode) | `lib/features/inventory/pages/add_product_page.dart` |
| **Produkto kortelės langas** | ❌ Nėra | Produkto detalės ir redagavimas | `InventoryBloc` ⚠️ | `Supabase API Boundary` ❌ | `lib/features/inventory/pages/product_detail_page.dart` |
| **Mitybos planavimo langas** | ✅ Sukurtas (placeholder) | Valgių planavimas | `MealPlannerBloc` ⚠️ | `Supabase API Boundary` ❌, `Gemini API Boundary` ❌, `Spoonacular API Boundary` ❌ | `lib/features/meal_planner/pages/meal_planner_page.dart` |
| **Patiekalo kortelės langas** | ❌ Nėra | Patiekalo detalės | `MealPlannerBloc` ⚠️ | `Spoonacular API Boundary` ❌ | `lib/features/meal_planner/pages/meal_detail_page.dart` |
| **Recepto pridėjimo langas** | ❌ Nėra | Naujo recepto pridėjimas | `RecipeBloc` ⚠️ | `Gemini API Boundary` ❌, `Spoonacular API Boundary` ❌ | `lib/features/recipes/pages/add_recipe_page.dart` |
| **Pirkinių sąrašo langas** | ✅ Sukurtas (placeholder) | Pirkinių sąrašo peržiūra | `ShoppingListBloc` ⚠️ | `Supabase API Boundary` ❌ | `lib/features/shopping/pages/shopping_list_page.dart` |
| **Kvito ir biudžeto langas** | ✅ Sukurtas (placeholder) | Čekių peržiūra ir biudžeto valdymas | `ReceiptBloc` ⚠️, `BudgetBloc` ⚠️ | `Supabase API Boundary` ❌, `Gemini API Boundary` ❌, `Tesseract OCR Boundary` ❌, `ML Kit OCR Boundary` ❌ | `lib/features/receipts/pages/receipts_page.dart`, `lib/features/budget/pages/budget_page.dart` |
| **Akcijų langas** | ✅ Sukurtas (placeholder) | Bendras akcijų peržiūra | `PromotionsBloc` ⚠️ | `Supabase API Boundary` ❌ | `lib/features/promotions/pages/promotions_page.dart` |
| **Parduotuvės akcijų langas** | ❌ Nėra | Konkretios parduotuvės akcijos | `PromotionsBloc` ⚠️ | `Supabase API Boundary` ❌, `Parduotuvės svetainės Boundary` ❌ | `lib/features/promotions/pages/store_promotions_page.dart` |
| **Skanavimo langas** | ✅ Sukurtas (placeholder) | Barcode/OCR skanavimas | `ScanBloc` ⚠️ | `Mobile Scanner Boundary` ❌, `Image Picker Boundary` ❌, `Tesseract OCR Boundary` ❌, `ML Kit OCR Boundary` ❌, `Gemini API Boundary` ❌ | `lib/features/scan/pages/scan_page.dart` |
| **Prisijungimo langas** | ❌ Nėra | Autentifikacija | `AuthBloc` ⚠️ | `Supabase API Boundary` ❌ (Auth) | `lib/features/auth/pages/login_page.dart` |
| **Profilio langas** | ✅ Sukurtas (placeholder) | Vartotojo profilio valdymas | `ProfileBloc` ⚠️ | `Supabase API Boundary` ❌ | `lib/features/profile/pages/profile_page.dart` |
| **Nustatymų langas** | ✅ Sukurtas (placeholder) | Aplikacijos nustatymai | `SettingsBloc` ⚠️ | `Storage Boundary` ❌ (local settings) | `lib/features/settings/pages/settings_page.dart` |

**Legenda:**
- ✅ Sukurtas - UI ekranas yra sukurtas (bet dažniausiai be logikos, su mock data)
- ❌ Nėra - Komponentas dar neegzistuoja
- ⚠️ Planuojamas - Komponentas planuojamas, bet dar nesukurtas

### Išorinės sistemos (External API Boundaries)

Šie boundary objektai jungiasi su išorinėmis API ir sistemomis.

| Komponentas | Aprašymas | Naudoja Controller(iai) | Vieta |
|------------|-----------|-------------------------|-------|
| **Supabase API Boundary** | Duomenų bazės prieiga (DB, Auth, Storage) | Visi Repository → Visi BLoC | `lib/core/network/supabase_client.dart` |
| **Gemini API Boundary** | AI atpažinimas (maistas, čekiai, meal planning) | `GeminiService` → `FoodRecognitionService`, `ReceiptParsingService`, `MealPlanningService` | `lib/services/gemini_service.dart` |
| **Spoonacular API Boundary** | Receptų paieška ir detalės | `SpoonacularService` → `MealPlanningService`, `RecipeService` | `lib/services/spoonacular_service.dart` |
| **Open Food Facts API Boundary** | Produktų duomenys pagal barcode | `OpenFoodFactsService` → `BarcodeScannerService` → `InventoryBloc` | `lib/services/open_food_facts_service.dart` |
| **Parduotuvės svetainės Boundary** | Akcijų scraping (Maxima, Lidl, IKI, Rimi) | `DealsScraperService` → `DealsUpdateJob` | `scraper/collectors/` |
| **Tesseract OCR Boundary** | Tekstų atpažinimas | `OCRService` → `ReceiptParsingService` | `lib/features/scan/services/ocr_service.dart` |
| **ML Kit OCR Boundary** | Google ML Kit OCR | `OCRService` → `ReceiptParsingService` | `lib/features/scan/services/ml_kit_service.dart` |
| **Mobile Scanner Boundary** | Barcode skaitymas | `BarcodeScannerService` → `ScanBloc` | `lib/features/scan/services/barcode_scanner_service.dart` |

### Vidaus sistemos ribos (Internal Boundaries)

| Komponentas | Aprašymas | Naudoja Controller(iai) | Vieta |
|------------|-----------|-------------------------|-------|
| **Storage Boundary** | Vietinė duomenų saugykla (Hive, sqflite) | `SettingsBloc`, Cache repositories | `lib/core/storage/` |
| **Image Picker Boundary** | Nuotraukų pasirinkimas (kamera/galerija) | `ScanBloc`, `ReceiptBloc` | Flutter `image_picker` paketas |
| **Notification Boundary** | Pranešimų sistema | `NotificationService` → Visi BLoC | `lib/features/notifications/` |

---

## 🟩 CONTROLLER OBJEKTAI (Verslo logika)

Controller objektai valdo verslo logiką ir koordinuoja Boundary ir Entity objektus. Jie yra organizuoti į tris sluoksnius:

### BLoC / State Management (Presentation Layer Controllers)

BLoC objektai valdo UI būseną ir perduoda veiksmus į Services/Use Cases.

| Controller | Status | Naudojamas Languose | Priklausomybės | Vieta |
|------------|--------|---------------------|----------------|-------|
| **DashboardBloc** | ❌ Nėra | Pagrindinis langas | `IInventoryRepository` ❌, `IMealPlanRepository` ❌, `IReceiptRepository` ❌ | `lib/features/dashboard/bloc/` |
| **InventoryBloc** | ❌ Nėra | Inventoriaus langas, Produkto pridėjimo langas, Produkto kortelės langas | `IInventoryRepository` ❌, `BarcodeScannerService` ❌, `OpenFoodFactsService` ❌ | `lib/features/inventory/bloc/` |
| **MealPlannerBloc** | ❌ Nėra | Mitybos planavimo langas, Patiekalo kortelės langas | `IMealPlanRepository` ❌, `MealPlanningService` ❌ | `lib/features/meal_planner/bloc/` |
| **RecipeBloc** | ❌ Nėra | Recepto pridėjimo langas | `IRecipeRepository` ❌, `MealPlanningService` ❌ | `lib/features/recipes/bloc/` |
| **ShoppingListBloc** | ❌ Nėra | Pirkinių sąrašo langas | `IShoppingListRepository` ❌, `ShoppingListService` ❌ | `lib/features/shopping/bloc/` |
| **ReceiptBloc** | ❌ Nėra | Kvito ir biudžeto langas | `IReceiptRepository` ❌, `ReceiptParsingService` ❌, `BudgetBloc` ❌ | `lib/features/receipts/bloc/` |
| **BudgetBloc** | ❌ Nėra | Kvito ir biudžeto langas | `IBudgetRepository` ❌ | `lib/features/budget/bloc/` |
| **ScanBloc** | ❌ Nėra | Skanavimo langas | `BarcodeScannerService` ❌, `ImageProcessingService` ❌, `OCRService` ❌, `FoodRecognitionService` ❌ | `lib/features/scan/bloc/` |
| **PromotionsBloc** | ❌ Nėra | Akcijų langas, Parduotuvės akcijų langas | `IDealRepository` ❌ | `lib/features/promotions/bloc/` |
| **AuthBloc** | ❌ Nėra | Prisijungimo langas | `SupabaseAuthRepository` ❌ | `lib/features/auth/bloc/` |
| **ProfileBloc** | ❌ Nėra | Profilio langas | `IProfileRepository` ❌ | `lib/features/profile/bloc/` |
| **SettingsBloc** | ❌ Nėra | Nustatymų langas | `Storage Boundary` ❌ (local settings) | `lib/features/settings/bloc/` |

**Pastaba:** VISI BLoC Controller'iai **DAR NĖRA SUKURTI**. Tai yra planuojami komponentai.

### Services (Business Logic Controllers)

Services koordinuoja kelis Boundary objektus ir implementuoja sudėtingesnę verslo logiką.

| Service | Naudoja API Boundaries | Naudojamas BLoC | Vieta |
|---------|------------------------|-----------------|-------|
| **MealPlanningService** | `Gemini API Boundary`, `Spoonacular API Boundary`, `Supabase API Boundary` | `MealPlannerBloc` | `lib/services/meal_planning_service.dart` |
| **ShoppingListService** | `Supabase API Boundary` (inventory, meal plans) | `ShoppingListBloc` | `lib/services/shopping_list_service.dart` |
| **FoodRecognitionService** | `Gemini API Boundary`, `Image Picker Boundary` | `ScanBloc`, `InventoryBloc` | `lib/services/food_recognition_service.dart` |
| **ReceiptParsingService** | `Gemini API Boundary`, `Tesseract OCR Boundary`, `ML Kit OCR Boundary`, `Image Picker Boundary` | `ReceiptBloc` | `lib/services/receipt_parsing_service.dart` |
| **ImageProcessingService** | `Image Picker Boundary` | `ScanBloc`, `ReceiptBloc` | `lib/features/scan/services/image_processing_service.dart` |
| **OCRService** | `Tesseract OCR Boundary`, `ML Kit OCR Boundary` | `ReceiptParsingService` | `lib/features/scan/services/ocr_service.dart` |
| **BarcodeScannerService** | `Mobile Scanner Boundary`, `Open Food Facts API Boundary` | `ScanBloc`, `InventoryBloc` | `lib/features/scan/services/barcode_scanner_service.dart` |
| **NutritionService** | `Supabase API Boundary` (product data) | Visi BLoC (kaip helper) | `lib/services/nutrition_service.dart` |
| **HealthScoreService** | `Supabase API Boundary` (nutrition data) | `DashboardBloc`, `MealPlannerBloc` | `lib/services/health_score_service.dart` |
| **DealsUpdateJob** | `Supabase API Boundary`, `Parduotuvės svetainės Boundary` | Cron/Background job | `scraper/` arba `lib/services/deals_update_service.dart` |
| **DealsScraperService** | `Parduotuvės svetainės Boundary` (Maxima, Lidl, IKI, Rimi) | `DealsUpdateJob` | `scraper/collectors/` |
| **DealsNormalizer** | - (duomenų transformacija) | `DealsUpdateJob` | `scraper/normalizers/` |
| **ProductMatchingService** | `Supabase API Boundary` (product database) | `ReceiptParsingService`, `ShoppingListService` | `lib/services/product_matching_service.dart` |
| **GeminiService** | `Gemini API Boundary` | `MealPlanningService`, `FoodRecognitionService`, `ReceiptParsingService` | `lib/services/gemini_service.dart` |
| **SpoonacularService** | `Spoonacular API Boundary` | `MealPlanningService`, `RecipeBloc` | `lib/services/spoonacular_service.dart` |
| **OpenFoodFactsService** | `Open Food Facts API Boundary` | `BarcodeScannerService`, `InventoryBloc` | `lib/services/open_food_facts_service.dart` |

### Use Cases (Domain Layer Controllers)

| Komponentas | Aprašymas | Vieta |
|------------|-----------|-------|
| **AddProductUseCase** | Produkto pridėjimas | `lib/features/inventory/use_cases/add_product_use_case.dart` |
| **UpdateProductUseCase** | Produkto atnaujinimas | `lib/features/inventory/use_cases/update_product_use_case.dart` |
| **DeleteProductUseCase** | Produkto ištrynimas | `lib/features/inventory/use_cases/delete_product_use_case.dart` |
| **GenerateMealPlanUseCase** | Mitybos plano generavimas | `lib/features/meal_planner/use_cases/generate_meal_plan_use_case.dart` |
| **RecognizeFoodUseCase** | Maisto atpažinimas | `lib/features/scan/use_cases/recognize_food_use_case.dart` |
| **ScanReceiptUseCase** | Čekio skanavimas | `lib/features/receipts/use_cases/scan_receipt_use_case.dart` |

---

## 🟨 ENTITY OBJEKTAI (Duomenų modeliai)

### Domain Models (Business Entities)

| Komponentas | Aprašymas | Vieta |
|------------|-----------|-------|
| **Product** | Produkto modelis | `lib/features/inventory/models/product.dart` |
| **InventoryItem** | Inventoriaus elemento modelis | `lib/features/inventory/models/inventory_item.dart` |
| **Meal** | Valgio modelis | `lib/features/meal_planner/models/meal.dart` |
| **MealPlan** | Mitybos plano modelis | `lib/features/meal_planner/models/meal_plan.dart` |
| **Recipe** | Recepto modelis | `lib/features/recipes/models/recipe.dart` |
| **ShoppingListItem** | Pirkinių sąrašo elemento modelis | `lib/features/shopping/models/shopping_list_item.dart` |
| **Receipt** | Čekio modelis | `lib/features/receipts/models/receipt.dart` |
| **Deal** | Akcijos modelis | `lib/features/promotions/models/deal.dart` |
| **Budget** | Biudžeto modelis | `lib/features/budget/models/budget.dart` |
| **User** | Vartotojo modelis | `lib/features/profile/models/user.dart` |
| **NutritionInfo** | Maistinės vertės modelis | `lib/core/models/nutrition_info.dart` |
| **HealthScore** | Sveikumo įvertinio modelis | `lib/core/models/health_score.dart` |

### DTOs (Data Transfer Objects)

| Komponentas | Aprašymas | Vieta |
|------------|-----------|-------|
| **ProductDTO** | Produkto DTO (API response) | `lib/features/inventory/models/dto/product_dto.dart` |
| **MealPlanDTO** | Mitybos plano DTO | `lib/features/meal_planner/models/dto/meal_plan_dto.dart` |
| **ReceiptDTO** | Čekio DTO | `lib/features/receipts/models/dto/receipt_dto.dart` |
| **DealDTO** | Akcijos DTO | `lib/features/promotions/models/dto/deal_dto.dart` |

### Value Objects

| Komponentas | Aprašymas | Vieta |
|------------|-----------|-------|
| **Quantity** | Kiekio value object (g, ml, vnt) | `lib/core/models/value_objects/quantity.dart` |
| **Price** | Kainos value object | `lib/core/models/value_objects/price.dart` |
| **DateRange** | Datų intervalo value object | `lib/core/models/value_objects/date_range.dart` |

---

## 📊 Repository Pattern (Data Layer)

### Repository Interfaces (Domain Layer)

| Komponentas | Aprašymas | Vieta |
|------------|-----------|-------|
| **IInventoryRepository** | Inventoriaus repository interfeisas | `lib/features/inventory/repositories/i_inventory_repository.dart` |
| **IMealPlanRepository** | Mitybos plano repository interfeisas | `lib/features/meal_planner/repositories/i_meal_plan_repository.dart` |
| **IShoppingListRepository** | Pirkinių sąrašo repository interfeisas | `lib/features/shopping/repositories/i_shopping_list_repository.dart` |
| **IReceiptRepository** | Čekių repository interfeisas | `lib/features/receipts/repositories/i_receipt_repository.dart` |
| **IDealRepository** | Akcijų repository interfeisas | `lib/features/promotions/repositories/i_deal_repository.dart` |

### Repository Implementations (Data Layer)

| Komponentas | Aprašymas | Vieta |
|------------|-----------|-------|
| **SupabaseInventoryRepository** | Supabase inventoriaus implementacija | `lib/features/inventory/repositories/supabase_inventory_repository.dart` |
| **SupabaseMealPlanRepository** | Supabase mitybos plano implementacija | `lib/features/meal_planner/repositories/supabase_meal_plan_repository.dart` |
| **SupabaseShoppingListRepository** | Supabase pirkinių sąrašo implementacija | `lib/features/shopping/repositories/supabase_shopping_list_repository.dart` |
| **SupabaseReceiptRepository** | Supabase čekių implementacija | `lib/features/receipts/repositories/supabase_receipt_repository.dart` |
| **SupabaseDealRepository** | Supabase akcijų implementacija | `lib/features/promotions/repositories/supabase_deal_repository.dart` |

---

## 🎨 VIEW OBJEKTAI (Presentation Layer)

### Pages (Screens)

| Komponentas | Aprašymas | Vieta |
|------------|-----------|-------|
| **DashboardPage** | Pagrindinis ekranas | `lib/features/dashboard/pages/dashboard_page.dart` |
| **InventoryPage** | Inventoriaus ekranas | `lib/features/inventory/pages/inventory_page.dart` |
| **MealPlannerPage** | Mitybos planavimo ekranas | `lib/features/meal_planner/pages/meal_planner_page.dart` |
| **ShoppingListPage** | Pirkinių sąrašo ekranas | `lib/features/shopping/pages/shopping_list_page.dart` |
| **ReceiptsPage** | Čekių ekranas | `lib/features/receipts/pages/receipts_page.dart` |
| **ScanPage** | Skanavimo ekranas | `lib/features/scan/pages/scan_page.dart` |
| **PromotionsPage** | Akcijų ekranas | `lib/features/promotions/pages/promotions_page.dart` |
| **ProfilePage** | Profilio ekranas | `lib/features/profile/pages/profile_page.dart` |
| **SettingsPage** | Nustatymų ekranas | `lib/features/settings/pages/settings_page.dart` |

### Widgets (UI Components)

| Komponentas | Aprašymas | Vieta |
|------------|-----------|-------|
| **ProductCard** | Produkto kortelė | `lib/features/inventory/widgets/product_card.dart` |
| **MealCard** | Valgio kortelė | `lib/features/meal_planner/widgets/meal_card.dart` |
| **ShoppingListItemWidget** | Pirkinių sąrašo elemento widget'as | `lib/features/shopping/widgets/shopping_list_item_widget.dart` |
| **ReceiptCard** | Čekio kortelė | `lib/features/receipts/widgets/receipt_card.dart` |
| **DealCard** | Akcijos kortelė | `lib/features/promotions/widgets/deal_card.dart` |

---

## 🔗 API Boundaries Mapping - Kurių API naudoja kiekvienas langas?

Ši lentelė rodo, kurie API Boundary objektai naudojami kiekviename lange (per Controller'ius):

| Langas | BLoC Controller | Services | API Boundaries |
|--------|-----------------|----------|----------------|
| **Pagrindinis langas** | `DashboardBloc` | - | `Supabase API Boundary` (inventory, meal plans, receipts) |
| **Inventoriaus langas** | `InventoryBloc` | `OpenFoodFactsService`, `BarcodeScannerService` | `Supabase API Boundary`, `Open Food Facts API Boundary`, `Mobile Scanner Boundary` |
| **Produkto pridėjimo langas** | `InventoryBloc` | `OpenFoodFactsService` | `Open Food Facts API Boundary` (barcode), `Supabase API Boundary` |
| **Mitybos planavimo langas** | `MealPlannerBloc` | `MealPlanningService` | `Supabase API Boundary`, `Gemini API Boundary`, `Spoonacular API Boundary` |
| **Pirkinių sąrašo langas** | `ShoppingListBloc` | `ShoppingListService` | `Supabase API Boundary` |
| **Kvito ir biudžeto langas** | `ReceiptBloc`, `BudgetBloc` | `ReceiptParsingService` | `Supabase API Boundary`, `Gemini API Boundary`, `Tesseract OCR Boundary`, `ML Kit OCR Boundary`, `Image Picker Boundary` |
| **Akcijų langas** | `PromotionsBloc` | - | `Supabase API Boundary` |
| **Parduotuvės akcijų langas** | `PromotionsBloc` | `DealsScraperService` | `Supabase API Boundary`, `Parduotuvės svetainės Boundary` |
| **Skanavimo langas** | `ScanBloc` | `FoodRecognitionService`, `BarcodeScannerService`, `OCRService` | `Mobile Scanner Boundary`, `Image Picker Boundary`, `Gemini API Boundary`, `Open Food Facts API Boundary`, `Tesseract OCR Boundary`, `ML Kit OCR Boundary` |
| **Prisijungimo langas** | `AuthBloc` | - | `Supabase API Boundary` (Auth) |
| **Profilio langas** | `ProfileBloc` | - | `Supabase API Boundary` |
| **Nustatymų langas** | `SettingsBloc` | - | `Storage Boundary` (local) |

---

## 🔄 Srauto pavyzdžiai

### 1. Srauto pavyzdys: "Atpažinti maistą iš nuotraukos"

#### UI Boundary → Controller → API Boundary → Entity

1. **UI Boundary**: `Skanavimo langas` (ScanPage)
   - Vartotojas pasirenka nuotrauką

2. **API Boundary**: `Image Picker Boundary`
   - Gauna nuotrauką iš kameros/galerijos

3. **Controller**: `ScanBloc` → `FoodRecognitionService`
   - Apdoroja nuotrauką per `ImageProcessingService`

4. **API Boundary**: `Gemini API Boundary`
   - `FoodRecognitionService` siunčia nuotrauką į Gemini AI

5. **Entity**: `Product` (sukuriamas iš Gemini atsakymo)
   - `NutritionInfo` (maistinė vertė)
   - `HealthScore` (sveikumo įvertinys)

6. **Controller**: `NutritionService`
   - Normalizuoja maistinę vertę
   - Apskaičiuoja pagal kiekį

7. **API Boundary**: `Supabase API Boundary`
   - Įrašo `Product` į DB per `IInventoryRepository`

8. **UI Boundary**: `Inventoriaus langas` (InventoryPage)
   - Rodo produktą vartotojui per `InventoryBloc`

---

### 2. Srauto pavyzdys: "Generuoti mitybos planą"

#### UI Boundary → Controller → API Boundary → Entity

1. **UI Boundary**: `Mitybos planavimo langas` (MealPlannerPage)
   - Vartotojas nurodo tikslus (kalorijos, makro), apribojimus, pageidavimus

2. **Controller**: `MealPlannerBloc` → `GenerateMealPlanUseCase` → `MealPlanningService`
   - Struktūrizuoja vartotojo duomenis

3. **API Boundary**: `Gemini API Boundary`
   - `MealPlanningService` siunčia užklausą į Gemini AI
   - Gauna struktūrizuotą `meal-intent` JSON

4. **API Boundary**: `Spoonacular API Boundary`
   - `MealPlanningService` paima 3 receptų pasiūlymus kiekvienam valgiui

5. **Controller**: `MealPlanningService`
   - Sujungia Gemini + Spoonacular rezultatus
   - Skaičiuoja kalorijų balansą
   - Patikrina inventorių (trūkstami ingredientai)

6. **API Boundary**: `Supabase API Boundary`
   - Įrašo `MealPlan` į DB per `IMealPlanRepository`
   - Atnaujina `ShoppingList` per `ShoppingListService`

7. **UI Boundary**: `Mitybos planavimo langas`
   - Rodo 3 valgių variantus vartotojui per `MealPlannerBloc`

---

### 3. Srauto pavyzdys: "Nuskaityti čekį"

#### UI Boundary → Controller → API Boundary → Entity

1. **UI Boundary**: `Kvito ir biudžeto langas` (ReceiptsPage)
   - Vartotojas pasirenka nuotrauką arba kamerą

2. **API Boundary**: `Image Picker Boundary`
   - Gauna nuotrauką

3. **Controller**: `ReceiptBloc` → `ScanReceiptUseCase` → `ReceiptParsingService`
   - Apdoroja nuotrauką per `ImageProcessingService`

4. **API Boundary**: `Tesseract OCR Boundary` arba `ML Kit OCR Boundary`
   - `OCRService` atpažįsta tekstą iš nuotraukos

5. **API Boundary**: `Gemini API Boundary`
   - `ReceiptParsingService` siunčia OCR tekstą + nuotrauką į Gemini
   - Gemini klasifikuoja produktus, kainas, datą

6. **Entity**: `Receipt` (sukuriamas iš Gemini atsakymo)
   - `ReceiptItem` (produktai, kainos, kiekiai)

7. **Controller**: `ProductMatchingService`
   - Sujungia čekio produktus su DB produktais (RapidFuzz)

8. **API Boundary**: `Supabase API Boundary`
   - Įrašo `Receipt` į DB per `IReceiptRepository`
   - Atnaujina `Budget` per `BudgetBloc`
   - Prideda produktus į `Inventory` (jei vartotojas pasirenka)

9. **UI Boundary**: `Kvito ir biudžeto langas`
   - Rodo čekį ir biudžeto atnaujinimus vartotojui

---

---

## 📊 Controller'ių santrauka

### Visi Controller'iai sistemoje (pagal sluoksnius)

#### Presentation Layer Controllers (BLoC)
1. `DashboardBloc` - Pagrindinio ekrano valdymas
2. `InventoryBloc` - Inventoriaus valdymas
3. `MealPlannerBloc` - Mitybos planavimo valdymas
4. `RecipeBloc` - Receptų valdymas
5. `ShoppingListBloc` - Pirkinių sąrašo valdymas
6. `ReceiptBloc` - Čekių valdymas
7. `BudgetBloc` - Biudžeto valdymas
8. `ScanBloc` - Skanavimo valdymas
9. `PromotionsBloc` - Akcijų valdymas
10. `AuthBloc` - Autentifikacijos valdymas
11. `ProfileBloc` - Profilio valdymas
12. `SettingsBloc` - Nustatymų valdymas

#### Business Logic Controllers (Services)
1. `MealPlanningService` - Mitybos planų generavimas (Gemini + Spoonacular)
2. `ShoppingListService` - Pirkinių sąrašo generavimas
3. `FoodRecognitionService` - Maisto atpažinimas iš nuotraukos
4. `ReceiptParsingService` - Čekių parsavimas (OCR + Gemini)
5. `ImageProcessingService` - Nuotraukų apdorojimas
6. `OCRService` - OCR apdorojimas (Tesseract / ML Kit)
7. `BarcodeScannerService` - Barcode skaitymas
8. `NutritionService` - Maistinės vertės skaičiavimas
9. `HealthScoreService` - Sveikumo įvertinimas
10. `DealsUpdateJob` - Akcijų atnaujinimo job'as
11. `DealsScraperService` - Akcijų scraping
12. `DealsNormalizer` - Akcijų duomenų normalizavimas
13. `ProductMatchingService` - Produktų sutapimas
14. `GeminiService` - Gemini API wrapper
15. `SpoonacularService` - Spoonacular API wrapper
16. `OpenFoodFactsService` - Open Food Facts API wrapper

#### Domain Layer Controllers (Use Cases)
1. `AddProductUseCase` - Produkto pridėjimas
2. `UpdateProductUseCase` - Produkto atnaujinimas
3. `DeleteProductUseCase` - Produkto ištrynimas
4. `GenerateMealPlanUseCase` - Mitybos plano generavimas
5. `RecognizeFoodUseCase` - Maisto atpažinimas
6. `ScanReceiptUseCase` - Čekio skanavimas

**Iš viso**: 12 BLoC controller'ių + 16 Service controller'ių + 6 Use Case controller'iai = **34 controller'iai**

---

## 📝 Pastabos

- **Boundary** objektai visada yra sistemos ribos - jie nepriklauso nuo verslo logikos
- **Controller** objektai valdo verslo logiką ir koordinuoja Boundary ir Entity
- **Entity** objektai yra duomenų modeliai - jie neturi verslo logikos
- **UI Boundary** (langai) yra sąsaja tarp vartotojo (actor) ir sistemos - kiekvienas langas naudoja BLoC controller'ius
- **API Boundary** objektai jungiasi su išorinėmis sistemomis - jie naudojami per Services
- **View** objektai (Pages, Widgets) yra tik UI - jie tik rodo duomenis ir perduoda veiksmus į Controller

### Controller'ių hierarchija

```
UI Boundary (Langas)
    ↓
BLoC Controller (State Management)
    ↓
Use Case / Service (Business Logic)
    ↓
Repository Interface
    ↓
Repository Implementation
    ↓
API Boundary / External System
```

---

**Versija**: 2.0  
**Data**: 2025-01-XX  
**Autorius**: Projekto komanda
**Atnaujinta**: Pridėta UI Boundaries sekcija su visais langais ir API Boundaries mapping


