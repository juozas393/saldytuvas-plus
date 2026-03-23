# 📦 Pilna Teisinga Struktūra - Package Diagram

## ✅ **VISI ELEMENTAI - KAIP TURĖTŲ BŪTI:**

---

## 📊 **1. MEMBER SUBSYSTEM:**

### **Views (15):**
```
1. HomePage
2. LoginPage
3. InventoryPage
4. ProductDetailsPage
5. AddProductPage
6. ReceiptAndBudgetPage
7. DealsPage
8. StoreDealsPage
9. ShoppingListScreen
10. MealPlanningPage
11. DishDetailsPage
12. AddRecipePage
13. NutritionPage
14. ProfilePage
15. SettingsPage
```

### **Controllers (13):**
```
1. RouterController
2. DashboardController
3. InventoryController
4. ProductController
5. ProductScanController
6. ReceiptAndBudgetController
7. MealPlanningController
8. RecipeController
9. HealthEvaluationController
10. DealsController
11. AuthController
12. ProfileController
13. SettingsController
```

---

## 📊 **2. ADMIN SUBSYSTEM:**

### **Controllers (6):**
```
1. FamilyMembersController
2. BudgetController
3. InventoryAccessController
4. ShoppingListController
5. FoodRulesController
6. FoodSubstituteController ✅ (ne FoodSubstitudeController)
```

---

## 📊 **3. DOMAIN MODEL:**

### **Entities (19):**
```
1. Administrator
2. Budget
3. Category
4. Deal
5. Dish
6. Environment
7. FoodRule
8. Inventory
9. Member
10. Notification
11. NutritionPlan
12. Product
13. PromoFlyer
14. Receipt
15. ReceiptLine
16. Recipe
17. ShoppingList
18. Store
19. User
```

### **Enumerations (7):**
```
1. DishType
2. FoodRuleStatus
3. Gender
4. MealPlanStatus
5. NotificationLevel
6. StorePriority
7. UserRole
```

---

## 📊 **4. DATA ACCESS:**

### **Repositories (10):**
```
1. IInventoryRepository ✅ (ne IInvenotry Repository)
2. IReceiptRepository
3. IBudgetRepository
4. IMealPlanRepository
5. IShoppingListRepository
6. IRecipeRepository
7. IUserRepository
8. IDealsRepository
9. ICategoryRepository
10. INotificationRepository
```

### **SupabaseGateway:**
```
1. SupabaseGateway (<<boundary>>)
```

---

## 📊 **5. EXTERNAL SERVICES:**

### **Boundaries (3 MVP):**
```
1. CameraGalleryBoundary (<<boundary>>)
2. MobileScannerBoundary (<<boundary>>)
3. OpenFoodFactsServiceBoundary (<<boundary>>)
```

---

## 📊 **6. CORE:**

### **Sub-packages (6):**
```
1. Config → AppConfig
2. Errors → Exceptions, Failures
3. Network → SupabaseClient, HttpClient
4. Storage → LocalStorage
5. Theme → AppTheme
6. Utils → Helpers
```

---

## ✅ **STATISTIKA:**

- **Top-level packages:** 6
- **Views:** 15
- **Member Controllers:** 13
- **Admin Controllers:** 6
- **Entities:** 19
- **Enumerations:** 7
- **Repositories:** 10
- **External Services:** 3
- **Core sub-packages:** 6

---

## ✅ **REIKALINGI PATAISYMAI MAGICDRAW:**

1. ❌ `IInvenotry Repository` → ✅ `IInventoryRepository`
2. ❌ `FoodSubstitudeController` → ✅ `FoodSubstituteController`

**Viskas kitas atrodo teisingai!** ✅


























