# 📋 VISI LANGAI - Pilnas sąrašas ir statusas

> **Patvirtinimas:** Visi jūsų išvardyti langai **BŪTINA SUPLANUOTI** ir **ĮGYVENDINAMI** sistemoje.

---

## ✅ VISI 14 LANGŲ - Pilnas sąrašas

> **Pastaba:** "Namų langas" buvo pašalintas kaip dublikatas - tai tas pats kaip "Pagrindinis langas" (`DashboardPage`).

### 1. **Akcijų langas** ✅
- **Status:** Planuojamas įgyvendinti
- **Dokumente:** `PromotionsPage`
- **Funkcionalumas:** Bendras akcijų peržiūra
- **Controller:** `PromotionsBloc`
- **API:** `Supabase API Boundary`

---

### 2. **Inventoriaus langas** ✅
- **Status:** Planuojamas įgyvendinti
- **Dokumente:** `InventoryPage`
- **Funkcionalumas:** Inventoriaus peržiūra ir valdymas
- **Controller:** `InventoryBloc`
- **API:** `Supabase API Boundary`, `Open Food Facts API Boundary`

---

### 3. **Kvito ir biudžeto langas** ✅
- **Status:** Planuojamas įgyvendinti
- **Dokumente:** `ReceiptsPage` + `BudgetPage`
- **Funkcionalumas:** Čekių peržiūra ir biudžeto valdymas
- **Controller:** `ReceiptBloc`, `BudgetBloc`
- **API:** `Supabase API Boundary`

---

### 4. **Mitybos planavimo langas** ✅
- **Status:** Planuojamas įgyvendinti
- **Dokumente:** `MealPlannerPage`
- **Funkcionalumas:** Valgių planavimas (rankiniu būdu MVP etape)
- **Controller:** `MealPlannerBloc`
- **API:** `Supabase API Boundary`

---

### 5. **Nustatymų langas** ✅
- **Status:** Planuojamas įgyvendinti
- **Dokumente:** `SettingsPage`
- **Funkcionalumas:** Aplikacijos nustatymai
- **Controller:** `SettingsBloc`
- **API:** `Storage Boundary` (local settings)

---

### 6. **Pagrindinis langas** ✅
- **Status:** Planuojamas įgyvendinti
- **Dokumente:** `DashboardPage`
- **Funkcionalumas:** Pagrindinis ekranas (dashboard) su santraukomis
- **Controller:** `DashboardBloc`
- **API:** `Supabase API Boundary`

---

### 8. **Parduotuvės akcijų langas** ✅
- **Status:** Planuojamas įgyvendinti
- **Dokumente:** `StorePromotionsPage`
- **Funkcionalumas:** Konkretios parduotuvės akcijos (filtruota)
- **Controller:** `PromotionsBloc`
- **API:** `Supabase API Boundary`

---

### 9. **Patiekalo kortelės langas** ✅
- **Status:** Planuojamas įgyvendinti
- **Dokumente:** `MealDetailPage`
- **Funkcionalumas:** Patiekalo detalės ir redagavimas
- **Controller:** `MealPlannerBloc`
- **API:** `Supabase API Boundary`

---

### 10. **Pirkinių sąrašo langas** ✅
- **Status:** Planuojamas įgyvendinti
- **Dokumente:** `ShoppingListPage`
- **Funkcionalumas:** Pirkinių sąrašo peržiūra ir valdymas
- **Controller:** `ShoppingListBloc`
- **API:** `Supabase API Boundary`

---

### 11. **Prisijungimo langas** ✅
- **Status:** Planuojamas įgyvendinti
- **Dokumente:** `LoginPage`
- **Funkcionalumas:** Autentifikacija (Login/Register)
- **Controller:** `AuthBloc`
- **API:** `Supabase API Boundary` (Auth)

---

### 12. **Produkto kortelės langas** ✅
- **Status:** Planuojamas įgyvendinti
- **Dokumente:** `ProductDetailPage`
- **Funkcionalumas:** Produkto detalės ir redagavimas
- **Controller:** `InventoryBloc`
- **API:** `Supabase API Boundary`

---

### 13. **Produkto pridėjimo langas** ✅
- **Status:** Planuojamas įgyvendinti
- **Dokumente:** `AddProductPage`
- **Funkcionalumas:** Naujo produkto pridėjimas (ranka + barcode)
- **Controller:** `InventoryBloc`
- **API:** `Open Food Facts API Boundary` (barcode), `Supabase API Boundary`

---

### 14. **Profilio langas** ✅
- **Status:** Planuojamas įgyvendinti
- **Dokumente:** `ProfilePage`
- **Funkcionalumas:** Vartotojo profilio valdymas
- **Controller:** `ProfileBloc`
- **API:** `Supabase API Boundary`

---

### 15. **Recepto pridėjimo langas** ✅
- **Status:** Planuojamas įgyvendinti
- **Dokumente:** `AddRecipePage`
- **Funkcionalumas:** Naujo recepto pridėjimas (ranka MVP etape)
- **Controller:** `RecipeBloc`
- **API:** `Supabase API Boundary`

---

## 📊 Santrauka

| Kategorija | Kiekis |
|-----------|--------|
| **Iš viso langų** | **14** |
| **Planuojama įgyvendinti** | **14** ✅ |
| **Jau sukurti UI (placeholder)** | **8** |
| **Dar reikia sukurti** | **6** |

---

## ✅ PATVIRTINIMAS

**TAIP** - Visi 14 langų **BŪTINA SUPLANUOTI** ir **ĮGYVENDINAMI** jūsų sistemoje!

> **Pastaba:** "Namų langas" buvo pašalintas kaip dublikatas - tai tas pats langas kaip "Pagrindinis langas".

### Kur jie aprašyti:
- ✅ `docs/architecture/mvc_robustness_structure.md` - visi langai su statusais
- ✅ `docs/architecture/REALISTIC_BOUNDARIES.md` - realistiškas MVP planas
- ✅ `docs/architecture/REALISTIC_PLAN.md` - įgyvendinimo fazės

---

## 🎯 Kada bus įgyvendinti?

Pagal **REALISTIC_PLAN.md**:

### Fase 1: Core (2-3 sav.)
- ✅ Prisijungimo langas (`LoginPage`)

### Fase 2: Inventory (3-4 sav.)
- ✅ Inventoriaus langas (`InventoryPage`)
- ✅ Produkto pridėjimo langas (`AddProductPage`)
- ✅ Produkto kortelės langas (`ProductDetailPage`)

### Fase 3: Receipts & Budget (3-4 sav.)
- ✅ Kvito ir biudžeto langas (`ReceiptsPage`, `BudgetPage`)

### Fase 4: Shopping List (2 sav.)
- ✅ Pirkinių sąrašo langas (`ShoppingListPage`)

### Fase 5: Meal Planning (4-6 sav.)
- ✅ Mitybos planavimo langas (`MealPlannerPage`)
- ✅ Patiekalo kortelės langas (`MealDetailPage`)
- ✅ Recepto pridėjimo langas (`AddRecipePage`)

### Fase 6: Promotions (2-3 sav.)
- ✅ Akcijų langas (`PromotionsPage`)
- ✅ Parduotuvės akcijų langas (`StorePromotionsPage`)

### Fase 7: Profile & Settings (1-2 sav.)
- ✅ Profilio langas (`ProfilePage`)
- ✅ Nustatymų langas (`SettingsPage`)
- ✅ Pagrindinis langas (`DashboardPage`)

**IŠ VISO:** Visi 14 langų bus įgyvendinti per ~17-24 savaites (4-6 mėnesius)

---

**Data:** 2025-01-XX  
**Status:** ✅ Visi langai patvirtinti ir planuojami



