# 🎛️ Controller'iai ir Entity - Kaip jie susiję?

> **SVARBU:** Controller'iai organizuojami pagal **FUNKCIONALUMĄ**, ne pagal entity! Vienas controller gali valdyti **KELIS entity**.

---

## 📋 Principas: Feature-based, ne Entity-based

### ❌ KLAIDA - Nenaudokite šio principo:
```
❌ ProductBloc → valdo tik Product entity
❌ InventoryItemBloc → valdo tik InventoryItem entity
❌ MealBloc → valdo tik Meal entity
```

**Kodėl ne?** Tai sukuria per daug controller'ių ir sudėtingą koordinavimą.

### ✅ TIESA - Naudokite šį principą (Feature-based):
```
✅ InventoryBloc → valdo VISĄ inventory funkcionalumą (Product + InventoryItem)
✅ MealPlannerBloc → valdo VISĄ meal planning funkcionalumą (Meal + MealPlan)
✅ ReceiptBloc → valdo VISĄ receipts funkcionalumą (Receipt + ReceiptItem)
```

**Kodėl taip?** Vienas controller valdo visą feature'ą ir gali koordinuoti kelis susijusius entity.

---

## 🎯 Controller'iai pagal jūsų sistemą

### BLoC Controller'iai (Feature-based)

| Controller | Valdomi Entity | Funkcionalumas | Kiek Entity valdo? |
|------------|---------------|----------------|-------------------|
| **InventoryBloc** | `Product`, `InventoryItem` | Inventoriaus valdymas | **2 entity** ✅ |
| **MealPlannerBloc** | `Meal`, `MealPlan` | Mitybos planavimas | **2 entity** ✅ |
| **ReceiptBloc** | `Receipt`, `ReceiptItem` | Čekių valdymas | **2 entity** ✅ |
| **BudgetBloc** | `Budget`, `BudgetItem` | Biudžeto valdymas | **2 entity** ✅ |
| **ShoppingListBloc** | `ShoppingList`, `ShoppingListItem` | Pirkinių sąrašas | **2 entity** ✅ |
| **PromotionsBloc** | `Deal` | Akcijų valdymas | **1 entity** ✅ |
| **RecipeBloc** | `Recipe`, `RecipeIngredient` | Receptų valdymas | **2 entity** ✅ |
| **AuthBloc** | `User`, `AuthSession` | Autentifikacija | **2 entity** ✅ |
| **ProfileBloc** | `User`, `UserPreferences` | Profilio valdymas | **2 entity** ✅ |
| **DashboardBloc** | `Product`, `MealPlan`, `Receipt` | Santraukos (tik skaityti) | **3 entity** ✅ |
| **ScanBloc** | Nėra tiesioginių entity | Skanavimo procesas | **0 entity** (tik procesas) ✅ |
| **SettingsBloc** | `Settings` (local) | Nustatymai | **1 entity** ✅ |

**Išvada:** Controller'iai valdo **feature'us**, ne atskirus entity. Dažniausiai vienas controller valdo 1-3 susijusius entity.

---

## 📊 Entity → Controller mapping

### Kiekvieno Entity Controller'iai:

| Entity | Kuris Controller valdo? | Kodėl? |
|--------|------------------------|--------|
| **Product** | `InventoryBloc` | Product yra inventory dalis |
| **InventoryItem** | `InventoryBloc` | InventoryItem yra inventory dalis |
| **Meal** | `MealPlannerBloc` | Meal yra meal planning dalis |
| **MealPlan** | `MealPlannerBloc` | MealPlan yra meal planning dalis |
| **Recipe** | `RecipeBloc` | Recipe turi savo feature'ą |
| **Receipt** | `ReceiptBloc` | Receipt turi savo feature'ą |
| **Budget** | `BudgetBloc` | Budget turi savo feature'ą |
| **ShoppingListItem** | `ShoppingListBloc` | ShoppingListItem yra shopping list dalis |
| **Deal** | `PromotionsBloc` | Deal yra promotions dalis |
| **User** | `AuthBloc`, `ProfileBloc` | User naudojamas auth ir profile |

**Pastaba:** Kai kurie entity gali būti naudojami keliuose controller'iuose (pvz., `User` naudojamas `AuthBloc` ir `ProfileBloc`), bet kiekvienas controller'ius valdo skirtingą aspektą.

---

## 🔄 Kaip veikia jūsų sistema?

### Pavyzdys 1: Inventory Feature

```
UI Boundary (InventoryPage)
    ↓
InventoryBloc (Controller)
    ↓
    ├──→ Product (Entity) - valdo produkto duomenis
    ├──→ InventoryItem (Entity) - valdo inventoriaus elemento duomenis
    ├──→ IInventoryRepository - valdo CRUD operacijas
    └──→ BarcodeScannerService - valdo barcode skenavimą
```

**Kodėl vienas controller?** Nes `Product` ir `InventoryItem` yra susiję - produktas turi inventoriaus elementus. Vienas controller gali koordinuoti abu.

### Pavyzdys 2: Meal Planning Feature

```
UI Boundary (MealPlannerPage)
    ↓
MealPlannerBloc (Controller)
    ↓
    ├──→ MealPlan (Entity) - valdo mitybos planą
    ├──→ Meal (Entity) - valdo valgius (susiję su MealPlan)
    └──→ IMealPlanRepository - valdo CRUD operacijas
```

**Kodėl vienas controller?** Nes `MealPlan` turi daug `Meal` objektų. Vienas controller koordinuoja visą planą.

### Pavyzdys 3: Receipts Feature

```
UI Boundary (ReceiptsPage)
    ↓
ReceiptBloc (Controller)
    ↓
    ├──→ Receipt (Entity) - valdo čekio duomenis
    ├──→ ReceiptItem (Entity) - valdo čekio produktus
    ├──→ IReceiptRepository - valdo CRUD operacijas
    └──→ ReceiptParsingService - valdo čekių parsavimą
```

**Kodėl vienas controller?** Nes `Receipt` turi daug `ReceiptItem` objektų. Vienas controller koordinuoja visą čekį.

---

## ✅ Realistiškas Controller'ių skaičius

### Kiek controller'ių jums reikia?

**Atsakymas:** **12 BLoC controller'ių** (pagal feature'us)

| Feature | Controller | Entity kiekis |
|---------|------------|---------------|
| Authentication | `AuthBloc` | 2 (User, AuthSession) |
| Inventory | `InventoryBloc` | 2 (Product, InventoryItem) |
| Meal Planning | `MealPlannerBloc` | 2 (Meal, MealPlan) |
| Recipes | `RecipeBloc` | 2 (Recipe, RecipeIngredient) |
| Shopping List | `ShoppingListBloc` | 2 (ShoppingList, ShoppingListItem) |
| Receipts | `ReceiptBloc` | 2 (Receipt, ReceiptItem) |
| Budget | `BudgetBloc` | 2 (Budget, BudgetItem) |
| Promotions | `PromotionsBloc` | 1 (Deal) |
| Scan | `ScanBloc` | 0 (tik procesas) |
| Dashboard | `DashboardBloc` | 3 (read-only: Product, MealPlan, Receipt) |
| Profile | `ProfileBloc` | 2 (User, UserPreferences) |
| Settings | `SettingsBloc` | 1 (Settings) |

**IŠ VISO:** 12 BLoC controller'ių valdo ~20+ entity

---

## 🎯 Pagrindinė taisyklė

### ✅ TIESA:
- **1 Feature = 1 BLoC Controller**
- **1 BLoC Controller = 1-3 susiję Entity**
- **Controller valdo VISĄ feature'o funkcionalumą**

### ❌ NETIESA:
- ❌ 1 Entity = 1 Controller (per daug controller'ių)
- ❌ Controller valdo tik vieną Entity (per daug fragmentacijos)

---

## 📊 Pavyzdys: InventoryBloc valdo 2 Entity

```dart
// InventoryBloc valdo VISĄ inventory funkcionalumą
class InventoryBloc {
  // Valdo Product entity
  Future<void> addProduct(Product product) { ... }
  Future<void> updateProduct(Product product) { ... }
  
  // Valdo InventoryItem entity
  Future<void> addInventoryItem(InventoryItem item) { ... }
  Future<void> updateInventoryItem(InventoryItem item) { ... }
  
  // Valdo abu kartu
  Future<void> addProductWithInventory(Product product, InventoryItem item) { ... }
}
```

**Kodėl tai gerai?** Nes Product ir InventoryItem yra susiję - kai pridedate produktą, dažnai reikia sukurti ir InventoryItem. Vienas controller gali koordinuoti abu.

---

## 🔄 Kada reikia atskirų Controller'ių?

### Atskiri Controller'iai reikalingi, kai:

1. **Skirtingi feature'ai** (funkcionalumas)
   - ✅ `InventoryBloc` ir `MealPlannerBloc` - skirtingi feature'ai
   - ✅ `ReceiptBloc` ir `BudgetBloc` - skirtingi feature'ai

2. **Nesusiję entity**
   - ✅ `Product` (inventory) ir `Meal` (meal planning) - skirtingi feature'ai
   - ✅ `Receipt` (receipts) ir `Deal` (promotions) - skirtingi feature'ai

### Vienas Controller valdo, kai:

1. **Susiję entity** (one-to-many, many-to-many)
   - ✅ `Product` ir `InventoryItem` - Product turi InventoryItems
   - ✅ `MealPlan` ir `Meal` - MealPlan turi Meals
   - ✅ `Receipt` ir `ReceiptItem` - Receipt turi ReceiptItems

2. **Susijęs funkcionalumas**
   - ✅ Inventory valdo Product + InventoryItem kartu
   - ✅ Receipts valdo Receipt + ReceiptItem kartu

---

## ✅ Jūsų sistemos Controller'ių struktūra

### Feature-based organizacija:

```
lib/features/
  ├── inventory/
  │   ├── bloc/
  │   │   └── inventory_bloc.dart  ← VALDO: Product + InventoryItem
  │   ├── models/
  │   │   ├── product.dart
  │   │   └── inventory_item.dart
  │   └── repositories/
  │       └── i_inventory_repository.dart
  │
  ├── meal_planner/
  │   ├── bloc/
  │   │   └── meal_planner_bloc.dart  ← VALDO: Meal + MealPlan
  │   ├── models/
  │   │   ├── meal.dart
  │   │   └── meal_plan.dart
  │   └── repositories/
  │       └── i_meal_plan_repository.dart
  │
  ├── receipts/
  │   ├── bloc/
  │   │   └── receipt_bloc.dart  ← VALDO: Receipt + ReceiptItem
  │   ├── models/
  │   │   ├── receipt.dart
  │   │   └── receipt_item.dart
  │   └── repositories/
  │       └── i_receipt_repository.dart
```

**Išvada:** Kiekvienas feature turi **vieną BLoC Controller**, kuris valdo **visus to feature'o entity**.

---

## 🎯 Santrauka

### ✅ TIESA apie Controller'ius:

1. **Controller'iai organizuojami pagal FEATURE'US, ne pagal entity**
2. **1 Feature = 1 BLoC Controller**
3. **1 Controller gali valdyti 1-3 susijusius entity**
4. **Controller koordinuoja VISĄ feature'o funkcionalumą**

### ❌ NETIESA:

1. ❌ Kiekvienam entity reikia atskiro controller'io
2. ❌ Controller'iai organizuojami pagal entity
3. ❌ Vienas controller valdo tik vieną entity

---

## 📊 Jūsų sistemoje:

**12 BLoC Controller'ių** valdo **~20+ Entity**

Tai yra **realistiškas** ir **geras** organizavimas - ne per daug, ne per mažai controller'ių.

---

**Data:** 2025-01-XX  
**Status:** ✅ Realistiškas controller'ių organizavimas



























