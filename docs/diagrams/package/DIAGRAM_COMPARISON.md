# 🔍 Diagram Comparison - MagicDraw vs PlantUML

## 📊 **PALYGINIMAS:**

### **1. REPOSITORIES SKAIČIUS:**

**PlantUML faile (10):**
```
IInventoryRepository
IReceiptRepository
IBudgetRepository
IMealPlanRepository
IShoppingListRepository
IRecipeRepository
IUserRepository
IDealsRepository
ICategoryRepository
INotificationRepository
```

**MagicDraw diagramoje (9):**
- `IInvenotry Repository` ← TURI BŪTI `IInventoryRepository`
- `IReceiptRepository`
- `IBudgetRepository`
- `IMealPlanRepository`
- `IShoppingListRepository`
- `IRecipeRepository`
- `IUserRepository`
- `IDealsRepository`
- `ICategoryRepository`
- `INotificationRepository`

**IŠVADA:** Trūksta vieno repository! Patikrinkite, ar `IInventoryRepository` yra diagramoje.

---

### **2. CONTROLLER PAVADINIMAI:**

**PlantUML faile:**
- `FoodSubstituteController`

**MagicDraw diagramoje:**
- `FoodSubstitudeController` ← RAŠYBOS KLAIDA! Turėtų būti `FoodSubstituteController`

---

### **3. REPOSITORY PAVADINIMAI:**

**PlantUML faile:**
- `IInventoryRepository`

**MagicDraw diagramoje:**
- `IInvenotry Repository` ← RAŠYBOS KLAIDA! Turėtų būti `IInventoryRepository`

---

### **4. VIEWS SKAIČIUS:**

**PlantUML faile (15):**
- HomePage
- LoginPage
- InventoryPage
- ProductDetailsPage
- AddProductPage
- ReceiptAndBudgetPage
- DealsPage
- StoreDealsPage
- ShoppingListScreen
- MealPlanningPage
- DishDetailsPage
- AddRecipePage
- NutritionPage
- ProfilePage
- SettingsPage

**MagicDraw diagramoje (15):** ✅ Viskas gerai

---

### **5. CONTROLLERS SKAIČIUS:**

**MemberSubsystem.Controllers (13):**
- PlantUML: ✅
- MagicDraw: ✅

**AdminSubsystem.Controllers (6):**
- PlantUML: ✅
- MagicDraw: ✅ (bet pavadinimo klaida: FoodSubstitudeController)

---

## ✅ **KĄ REIKIA PATIKSLINTI:**

1. ❌ `FoodSubstitudeController` → `FoodSubstituteController`
2. ❌ `IInvenotry Repository` → `IInventoryRepository`
3. ⚠️ Patikrinkite, ar visi 10 repositories yra diagramoje

---

## 📊 **KITI ELEMENTAI:**

### **Entities (19):** ✅
### **Enumerations (7):** ✅
### **External Services (3):** ✅
### **Core Sub-packages (6):** ✅

---

## ✅ **IŠVADA:**

Diagrama atrodo gerai, bet reikia patikslinti:
1. Controller pavadinimą: `FoodSubstituteController` (ne `FoodSubstitudeController`)
2. Repository pavadinimą: `IInventoryRepository` (ne `IInvenotry Repository`)


























