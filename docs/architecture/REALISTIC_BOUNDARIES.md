# 🎯 REALISTIŠKI BOUNDARIES - Tik įgyvendinamų funkcijų planas

> **Tikslas:** Aprašyti tik **TIKRAI ĮGYVENDINAMUS** boundaries (langus), be per sudėtingų AI/OCR funkcijų MVP etape.

---

## 📋 Langų (Boundaries) Patikra - Visi iš jūsų diagramos

### ✅ VISI LANGAI IŠ NUOTRAUKOS YRA DABAR APRAŠYTI:

| # | Langas iš nuotraukos | Yra dokumente? | Status |
|---|----------------------|----------------|--------|
| 1 | **Akcijų langas** | ✅ Taip | `PromotionsPage` (sukurtas) |
| 2 | **Inventoriaus langas** | ✅ Taip | `InventoryPage` (sukurtas) |
| 3 | **Kvito ir biudžeto langas** | ✅ Taip | `ReceiptsPage` + `BudgetPage` |
| 4 | **Mitybos planavimo langas** | ✅ Taip | `MealPlannerPage` (sukurtas) |
| 6 | **Nustatymų langas** | ✅ Taip | `SettingsPage` (sukurtas) |
| 7 | **Pagrindinis langas** | ✅ Taip | `DashboardPage` (sukurtas) |
| 8 | **Parduotuvės akcijų langas** | ✅ Taip | `StorePromotionsPage` (planuojamas) |
| 9 | **Patiekalo kortelės langas** | ✅ Taip | `MealDetailPage` (planuojamas) |
| 10 | **Pirkinių sąrašo langas** | ✅ Taip | `ShoppingListPage` (sukurtas) |
| 11 | **Prisijungimo langas** | ✅ Taip | `LoginPage` (planuojamas) |
| 12 | **Produkto kortelės langas** | ✅ Taip | `ProductDetailPage` (planuojamas) |
| 13 | **Produkto pridėjimo langas** | ✅ Taip | `AddProductPage` (planuojamas) |
| 14 | **Profilio langas** | ✅ Taip | `ProfilePage` (sukurtas) |
| 15 | **Recepto pridėjimo langas** | ✅ Taip | `AddRecipePage` (planuojamas) |

**IŠVADA:** ✅ Visi 14 langų yra aprašyti!

> **Pastaba:** "Namų langas" buvo pašalintas kaip dublikatas - tai tas pats langas kaip "Pagrindinis langas" (`DashboardPage`).

---

## 🎯 REALISTIŠKAS MVP - Boundaries su ĮGYVENDINAMOMIS FUNKCIJOMIS

### UI Boundaries (Langai) - MVP Versija

| Langas | MVP Funkcionalumas | Controller | API Boundaries (MVP) | Realistiška? |
|--------|-------------------|------------|----------------------|--------------|
| **Pagrindinis langas** | Dashboard su santraukomis | `DashboardBloc` | `Supabase API Boundary` | ✅ Taip |
| **Inventoriaus langas** | Produktų sąrašas, filtravimas | `InventoryBloc` | `Supabase API Boundary`, `Open Food Facts API` (barcode) | ✅ Taip |
| **Produkto pridėjimo langas** | Rankinis pridėjimas + Barcode scanning | `InventoryBloc` | `Open Food Facts API Boundary` | ✅ Taip |
| **Produkto kortelės langas** | Detalės, redagavimas, ištrynimas | `InventoryBloc` | `Supabase API Boundary` | ✅ Taip |
| **Mitybos planavimo langas** | **Rankinis** valgių planavimas (BE AI) | `MealPlannerBloc` | `Supabase API Boundary` | ✅ Taip (supaprastinta) |
| **Patiekalo kortelės langas** | Valgio detalės, redagavimas | `MealPlannerBloc` | `Supabase API Boundary` | ✅ Taip |
| **Recepto pridėjimo langas** | **Rankinis** recepto įvedimas (BE AI) | `RecipeBloc` | `Supabase API Boundary` | ✅ Taip (supaprastinta) |
| **Pirkinių sąrašo langas** | Rankinis produktų pridėjimas | `ShoppingListBloc` | `Supabase API Boundary` | ✅ Taip |
| **Kvito langas** | **Rankinis** čekio įvedimas (BE OCR) | `ReceiptBloc` | `Supabase API Boundary` | ✅ Taip (supaprastinta) |
| **Biudžeto langas** | Išlaidų sekimas, diagramos | `BudgetBloc` | `Supabase API Boundary` | ✅ Taip |
| **Akcijų langas** | Akcijų peržiūra | `PromotionsBloc` | `Supabase API Boundary` | ✅ Taip |
| **Parduotuvės akcijų langas** | Filtruota pagal parduotuvę | `PromotionsBloc` | `Supabase API Boundary` | ✅ Taip |
| **Skanavimo langas** | **Tik Barcode** scanning (BE OCR) | `ScanBloc` | `Mobile Scanner Boundary`, `Open Food Facts API` | ✅ Taip (supaprastinta) |
| **Prisijungimo langas** | Login/Register | `AuthBloc` | `Supabase API Boundary` (Auth) | ✅ Taip |
| **Profilio langas** | Profilio redagavimas | `ProfileBloc` | `Supabase API Boundary` | ✅ Taip |
| **Nustatymų langas** | Aplikacijos nustatymai | `SettingsBloc` | `Storage Boundary` (local) | ✅ Taip |

---

## 🔄 API Boundaries - MVP Versija (Tik įgyvendinamų)

### External API Boundaries (MVP)

| API Boundary | MVP Funkcionalumas | Realistiška? | Pastaba |
|--------------|-------------------|--------------|---------|
| **Supabase API Boundary** | DB, Auth, Storage | ✅ Taip | **BŪTINAS** - core backend |
| **Open Food Facts API Boundary** | Produktų duomenys pagal barcode | ✅ Taip | Nemokamas, gerai dokumentuotas |
| **Mobile Scanner Boundary** | Barcode skaitymas | ✅ Taip | `mobile_scanner` paketas |

### ❌ KĄ PALIEKAME VĖLESNEI FASEI (NE MVP)

| API Boundary | Kodėl ne MVP? | Kada pridėsime? |
|--------------|---------------|-----------------|
| **Gemini API Boundary** | Brangus, sudėtingas | Po MVP, kai pridėsime AI features |
| **Spoonacular API Boundary** | Mokamas API | Po MVP, kai pridėsime AI meal planning |
| **Tesseract OCR Boundary** | Sudėtingas, daug edge case'ų | Po MVP, kai pridėsime OCR |
| **ML Kit OCR Boundary** | Sudėtingas, daug edge case'ų | Po MVP, kai pridėsime OCR |
| **Parduotuvės svetainės Boundary** | Legal issues, scraping | Po MVP, jei reikės auto scraping |

---

## 📊 Controller'iai - MVP Versija

### BLoC Controllers (MVP)

| Controller | MVP Funkcionalumas | Priklausomybės (MVP) | Realistiška? |
|------------|-------------------|---------------------|--------------|
| **AuthBloc** | Login, Register, Logout | `SupabaseAuthRepository` | ✅ Taip |
| **DashboardBloc** | Santraukos (inventory, receipts) | `IInventoryRepository`, `IReceiptRepository` | ✅ Taip |
| **InventoryBloc** | CRUD produktų, barcode scanning | `IInventoryRepository`, `BarcodeScannerService`, `OpenFoodFactsService` | ✅ Taip |
| **ReceiptBloc** | Rankinis čekių įvedimas | `IReceiptRepository` | ✅ Taip (supaprastinta) |
| **BudgetBloc** | Išlaidų sekimas | `IBudgetRepository` | ✅ Taip |
| **ShoppingListBloc** | Rankinis pirkinių sąrašas | `IShoppingListRepository` | ✅ Taip |
| **MealPlannerBloc** | Rankinis valgių planavimas | `IMealPlanRepository` | ✅ Taip (supaprastinta) |
| **RecipeBloc** | Rankinis receptų valdymas | `IRecipeRepository` | ✅ Taip (supaprastinta) |
| **PromotionsBloc** | Rankinis akcijų valdymas | `IDealRepository` | ✅ Taip (supaprastinta) |
| **ScanBloc** | Tik barcode scanning | `BarcodeScannerService`, `OpenFoodFactsService` | ✅ Taip (supaprastinta) |
| **ProfileBloc** | Profilio redagavimas | `IProfileRepository` | ✅ Taip |
| **SettingsBloc** | Local settings | `Storage Boundary` | ✅ Taip |

**IŠ VISO MVP:** 12 BLoC controller'ių (visi įgyvendinami)

### Services (MVP)

| Service | MVP Funkcionalumas | Realistiška? |
|---------|-------------------|--------------|
| **BarcodeScannerService** | Barcode skaitymas | ✅ Taip |
| **OpenFoodFactsService** | Produktų duomenys | ✅ Taip |

**IŠ VISO MVP:** 2 Services (labai supaprastinta)

### ❌ Services kurie NE MVP (per sudėtingi):

- `MealPlanningService` - reikia AI
- `ReceiptParsingService` - reikia OCR + AI
- `FoodRecognitionService` - reikia AI
- `OCRService` - sudėtingas
- `GeminiService` - brangus
- `SpoonacularService` - mokamas
- `DealsScraperService` - legal issues

---

## ✅ MVP API Boundaries Summary

### Tikrai įgyvendinami MVP:

1. ✅ **Supabase API Boundary** - Backend (DB, Auth)
2. ✅ **Open Food Facts API Boundary** - Nemokamas produktų duomenų API
3. ✅ **Mobile Scanner Boundary** - Barcode scanning

**IŠ VISO:** 3 API Boundaries (labai paprasta ir realistiška)

---

## 🎯 Išvada

### Ką TIKRAI padarysime MVP etape:

1. ✅ **Visus 16 langų** (boundaries) - visi aprašyti ir planuojami
2. ✅ **12 BLoC Controller'ius** - visi realistiški
3. ✅ **3 API Boundaries** - Supabase, Open Food Facts, Mobile Scanner
4. ✅ **2 Services** - BarcodeScanner, OpenFoodFacts

### Ką PALIEKAME PO MVP:

- ❌ AI features (Gemini)
- ❌ OCR features
- ❌ Automatic scraping
- ❌ Advanced meal planning

**REALISTIŠKAIS:** ✅ Taip, viską galima padaryti per 4-6 mėnesius MVP etape.

---

**Data:** 2025-01-XX  
**Status:** Tikrasis įgyvendinamas planas



