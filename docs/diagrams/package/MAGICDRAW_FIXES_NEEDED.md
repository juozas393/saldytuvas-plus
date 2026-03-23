# 🔍 MagicDraw Diagram - Reikalingi Pataisymai

## ✅ **KĄ MATAU DIAGRAMOJE:**

### **1. REPOSITORIES - RAŠYBOS KLAIDA:**

**MagicDraw diagramoje:**
- `IInvenotry Repository` ❌

**Turėtų būti:**
- `IInventoryRepository` ✅

**Pastaba:** Diagramoje matosi tik 9 repositories, bet turėtų būti 10. Tikriausiai `IInventoryRepository` yra užrašytas kaip `IInvenotry Repository`.

---

### **2. CONTROLLER - RAŠYBOS KLAIDA:**

**MagicDraw diagramoje:**
- `FoodSubstitudeController` ❌

**Turėtų būti:**
- `FoodSubstituteController` ✅

---

### **3. VISI REPOSITORIES (Turėtų būti 10):**

1. ✅ `IInventoryRepository` (ne `IInvenotry Repository`)
2. ✅ `IReceiptRepository`
3. ✅ `IBudgetRepository`
4. ✅ `IMealPlanRepository`
5. ✅ `IShoppingListRepository`
6. ✅ `IRecipeRepository`
7. ✅ `IUserRepository`
8. ✅ `IDealsRepository`
9. ✅ `ICategoryRepository`
10. ✅ `INotificationRepository`

---

### **4. ADMIN CONTROLLERS (Turėtų būti 6):**

1. ✅ `BudgetController`
2. ✅ `FamilyMembersController`
3. ✅ `InventoryAccessController`
4. ✅ `ShoppingListController`
5. ✅ `FoodRulesController`
6. ✅ `FoodSubstituteController` (ne `FoodSubstitudeController`)

---

### **5. KITI ELEMENTAI - TEISINGAI:**

- ✅ Views (15 langų) - teisingi
- ✅ Member Controllers (13) - teisingi
- ✅ Entities (19) - teisingi
- ✅ Enumerations (7) - teisingi
- ✅ External Services (3) - teisingi
- ✅ Core sub-packages (6) - teisingi
- ✅ Dependencies - teisingi

---

## 📝 **REIKALINGI PATAISYMAI:**

1. ❌ `IInvenotry Repository` → ✅ `IInventoryRepository`
2. ❌ `FoodSubstitudeController` → ✅ `FoodSubstituteController`
3. ⚠️ Patikrinkite, ar visi 10 repositories yra diagramoje

---

## ✅ **DABAR PLANTUML FAILAS:**

Mūsų PlantUML failas turi teisingus pavadinimus:

```plantuml
'IInventoryRepository' ✅
'FoodSubstituteController' ✅
```

**Reikia tik pataisyti MagicDraw diagramą!**


























