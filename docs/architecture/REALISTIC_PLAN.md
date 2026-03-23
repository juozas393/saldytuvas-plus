# 🎯 REALISTIŠKAS ĮGYVENDINIMO PLANAS

> **Tikslas:** Aprašyti tik **TIKRAI ĮGYVENDINAMUS** komponentus, be per sudėtingų dalykų.

---

## 📋 Langų (Boundaries) Patikra

### Langai iš jūsų diagramos vs. Kas yra dokumente:

| # | Langas iš nuotraukos | Yra dokumente? | Pastaba |
|---|----------------------|----------------|---------|
| 1 | **Akcijų langas** | ✅ Taip | `PromotionsPage` |
| 2 | **Inventoriaus langas** | ✅ Taip | `InventoryPage` |
| 3 | **Kvito ir biudžeto langas** | ✅ Taip | `ReceiptsPage` + `BudgetPage` |
| 4 | **Mitybos planavimo langas** | ✅ Taip | `MealPlannerPage` |
| 5 | **Namų langas** | ⚠️ Galbūt | Galbūt tas pats kaip "Pagrindinis langas"? |
| 6 | **Nustatymų langas** | ✅ Taip | `SettingsPage` |
| 7 | **Pagrindinis langas** | ✅ Taip | `DashboardPage` |
| 8 | **Parduotuvės akcijų langas** | ✅ Taip | `StorePromotionsPage` |
| 9 | **Patiekalo kortelės langas** | ✅ Taip | `MealDetailPage` |
| 10 | **Pirkinių sąrašo langas** | ✅ Taip | `ShoppingListPage` |
| 11 | **Prisijungimo langas** | ✅ Taip | `LoginPage` |
| 12 | **Produkto kortelės langas** | ✅ Taip | `ProductDetailPage` |
| 13 | **Produkto pridėjimo langas** | ✅ Taip | `AddProductPage` |
| 14 | **Profilio langas** | ✅ Taip | `ProfilePage` |
| 15 | **Recepto pridėjimo langas** | ✅ Taip | `AddRecipePage` |

### ❓ Klausimas:
- **"Namų langas"** - ar tai tas pats kaip "Pagrindinis langas" (Dashboard)?
- **Ar yra "Skanavimo langas"** jūsų diagramoje? (Dokumente jis yra)

---

## 🎯 REALISTIŠKAS MVP PLANAS

### Fase 1: Core Infrastructure (2-3 savaitės)

#### 1.1 Supabase Setup
- ✅ Supabase projektas sukurimas
- ✅ Database schema (inventory_items, receipts, budgets, users)
- ✅ Authentication setup
- ✅ RLS (Row Level Security) policies

#### 1.2 Basic BLoC Setup
- ✅ `flutter_bloc` dependency
- ✅ `AuthBloc` - Login/Register
- ✅ Basic navigation su authentication guard

**Realistiška:** ✅ Taip, gana paprasta

---

### Fase 2: Inventory Feature (3-4 savaitės)

#### 2.1 Core Inventory
- ✅ `InventoryBloc`
- ✅ `IInventoryRepository` + Supabase implementacija
- ✅ `Product` model
- ✅ CRUD operacijos (Create, Read, Update, Delete)

#### 2.2 UI Pages
- ✅ `InventoryPage` - sąrašas produktų (jau yra, reikia su BLoC)
- ✅ `AddProductPage` - rankinis pridėjimas
- ✅ `ProductDetailPage` - redagavimas, ištrynimas

#### 2.3 Barcode Scanning
- ✅ `mobile_scanner` dependency
- ✅ `BarcodeScannerService`
- ✅ `OpenFoodFactsService` - produkto duomenys pagal barcode
- ✅ Automatinis produkto pridėjimas po barcode skaitymo

**Realistiška:** ✅ Taip, gerai dokumentuota, bibliotekos egzistuoja

---

### Fase 3: Receipts & Budget (3-4 savaitės)

#### 3.1 Basic Receipt Management
- ✅ `ReceiptBloc`
- ✅ `IReceiptRepository` + Supabase
- ✅ `Receipt` model
- ✅ **RANKINIS** čekių įvedimas (BE OCR)

#### 3.2 Budget Tracking
- ✅ `BudgetBloc`
- ✅ `IBudgetRepository`
- ✅ Išlaidų sekimas pagal kategorijas
- ✅ Mėnesio biudžeto peržiūra

#### 3.3 UI
- ✅ `ReceiptsPage` - čekių sąrašas
- ✅ `BudgetPage` - biudžeto diagramos

**Realistiška:** ✅ Taip, rankinis įvedimas yra paprastas. OCR paliekame vėlesnei fazei.

---

### Fase 4: Shopping List (2 savaitės)

#### 4.1 Basic Shopping List
- ✅ `ShoppingListBloc`
- ✅ `IShoppingListRepository` + Supabase
- ✅ Rankinis produktų pridėjimas į sąrašą
- ✅ Produktų pažymėjimas kaip "įsigytas"

#### 4.2 UI
- ✅ `ShoppingListPage` - sąrašas (jau yra, reikia su BLoC)

**Realistiška:** ✅ Taip, labai paprasta

---

### Fase 5: Meal Planning (4-6 savaitės) - **SUPAPRASTINTA VERSIJA**

#### 5.1 Manual Meal Planning (BE AI)
- ✅ `MealPlannerBloc`
- ✅ `IMealPlanRepository` + Supabase
- ✅ `Meal` model
- ✅ Rankinis valgių planavimas (vartotojas pats suveda)

#### 5.2 UI
- ✅ `MealPlannerPage` - kalendorius su valgiais
- ✅ `MealDetailPage` - valgio redagavimas

**Realistiška:** ✅ Taip, bet **BE AI**. AI paliekame vėlesnei fazei.

---

### Fase 6: Promotions (2-3 savaitės) - **SUPAPRASTINTA VERSIJA**

#### 6.1 Manual Deals
- ✅ `PromotionsBloc`
- ✅ `IDealRepository` + Supabase
- ✅ Rankinis akcijų įvedimas (BE scraping)
- ✅ Akcijų peržiūra pagal parduotuvę

#### 6.2 UI
- ✅ `PromotionsPage` - bendras sąrašas
- ✅ `StorePromotionsPage` - filtruota pagal parduotuvę

**Realistiška:** ✅ Taip, bet **BE automatinių scraping**. Vėlesnei fazei.

---

### Fase 7: Profile & Settings (1-2 savaitės)

#### 7.1 Profile
- ✅ `ProfileBloc`
- ✅ Vartotojo profilio redagavimas
- ✅ `ProfilePage` (jau yra)

#### 7.2 Settings
- ✅ `SettingsBloc`
- ✅ Local storage (SharedPreferences arba Hive)
- ✅ Tema (light/dark)
- ✅ `SettingsPage` (jau yra)

**Realistiška:** ✅ Taip, labai paprasta

---

## ❌ KĄ PALIEKAME VĖLESNEI FASEI (Nepavyks dabar)

### Per Sudėtinga arba Per Brangi:

1. **OCR Receipt Parsing** ❌
   - Reikia Tesseract/ML Kit integracijos
   - Reikia Gemini API (kainuoja)
   - Daug edge case'ų
   - **Sprendimas MVP:** Rankinis įvedimas

2. **AI Meal Planning** ❌
   - Gemini API integracija (sudėtinga)
   - Spoonacular API (mokama)
   - Hibridinis flow (labai sudėtingas)
   - **Sprendimas MVP:** Rankinis planavimas

3. **Automatic Deal Scraping** ❌
   - Web scraping (legal issues)
   - Cron jobs
   - Daug maintenance
   - **Sprendimas MVP:** Rankinis įvedimas

4. **Food Recognition from Photo** ❌
   - Gemini Vision API (brangus)
   - Image processing (sudėtinga)
   - **Sprendimas MVP:** Barcode scanning

5. **Health Score & Advanced Nutrition** ❌
   - Per daug sudėtinga pradžiai
   - **Sprendimas MVP:** Pagrindinė nutrition info iš Open Food Facts

---

## 📊 Realistiškas Timeline

| Fase | Funkcionalumas | Laikas | Prioritetas |
|------|---------------|--------|-------------|
| 1 | Core Infrastructure (Auth, Supabase) | 2-3 sav. | 🔴 Aukštas |
| 2 | Inventory (CRUD + Barcode) | 3-4 sav. | 🔴 Aukštas |
| 3 | Receipts & Budget (Rankinis) | 3-4 sav. | 🔴 Aukštas |
| 4 | Shopping List | 2 sav. | 🟡 Vidutinis |
| 5 | Meal Planning (Rankinis) | 4-6 sav. | 🟡 Vidutinis |
| 6 | Promotions (Rankinis) | 2-3 sav. | 🟢 Žemas |
| 7 | Profile & Settings | 1-2 sav. | 🟢 Žemas |

**IŠ VISO:** ~17-24 savaitės (4-6 mėnesiai) jei dirbate vienas

---

## ✅ MVP FUNKCIONALUMAS (Ką tikrai padarysime)

### Core Features:
1. ✅ User authentication (Login/Register)
2. ✅ Inventory management (CRUD)
3. ✅ Barcode scanning (produktų pridėjimas)
4. ✅ Receipt tracking (rankinis įvedimas)
5. ✅ Budget tracking (išlaidų sekimas)
6. ✅ Shopping list (rankinis valdymas)
7. ✅ Manual meal planning (kalendorius)
8. ✅ Manual promotions (rankinis įvedimas)
9. ✅ User profile & settings

### Ką TIKRAI paliekame vėliau:
- ❌ OCR čekių skanavimas
- ❌ AI meal planning
- ❌ Automatic deal scraping
- ❌ Food recognition iš nuotraukos
- ❌ Advanced nutrition analysis

---

## 🎯 Rekomendacija

**Pradėkite nuo MVP:**
1. Fase 1 (Core) - 2-3 savaitės
2. Fase 2 (Inventory) - 3-4 savaitės
3. Fase 3 (Receipts) - 3-4 savaitės

**Po MVP:**
- Testavimas
- Fix'ai
- User feedback

**Tada:**
- Galite pridėti sudėtingesnius feature'us (OCR, AI, ir t.t.)

**Realistiškai:** Pirmieji 3 fazes = funkcionalus MVP, kurį galite naudoti ir testuoti.

---

**Data:** 2025-01-XX  
**Status:** Realistiškas planas, kurį tikrai galite įgyvendinti





























