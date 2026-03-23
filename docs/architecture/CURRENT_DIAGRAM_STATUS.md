# 📊 Current Diagram Status - Kas Dabar Diagramoje?

## ✅ **GALUTINĖ STRUKTŪRA:**

---

## 1️⃣ **MemberSubsystem:**

### **Views (15 langų):**
- HomePage, LoginPage, InventoryPage, ProductDetailsPage, AddProductPage
- ReceiptAndBudgetPage, DealsPage, StoreDealsPage, ShoppingListScreen
- MealPlanningPage, DishDetailsPage, AddRecipePage, NutritionPage
- ProfilePage, SettingsPage

### **Controllers (13):**
- RouterController, DashboardController, InventoryController, ProductController
- ProductScanController, ReceiptAndBudgetController, MealPlanningController
- RecipeController, HealthEvaluationController, DealsController
- AuthController, ProfileController, SettingsController

---

## 2️⃣ **AdminSubsystem:**

### **Controllers (6):**
- FamilyMembersController (PAA9)
- BudgetController (PAA6 + PAA5) ⬅️ **SUJUNGTAS**
- InventoryAccessController (PAA4)
- ShoppingListController (PAA1)
- FoodRulesController (PAA7)
- FoodSubstituteController (PAA8)

**PAŠALINTI:**
- ❌ BudgetAlertController (sujungtas su BudgetController)
- ❌ ExpirationAlertController (visiškai automatinis)

---

## 3️⃣ **DomainModel:**

### **Entities (19):**
- Administrator, Budget, Category, Deal, Dish, Environment
- FoodRule, Inventory, Member, Notification, NutritionPlan
- Product, PromoFlyer, Receipt, ReceiptLine, Recipe
- ShoppingList, Store, User

### **Enumerations (7):**
- DishType, FoodRuleStatus, Gender, MealPlanStatus
- NotificationLevel, StorePriority, UserRole

---

## 4️⃣ **DataAccess:**

### **Repositories (10):**
- IInventoryRepository, IReceiptRepository, IBudgetRepository
- IMealPlanRepository, IShoppingListRepository, IRecipeRepository
- IUserRepository, IDealsRepository, ICategoryRepository
- INotificationRepository

### **SupabaseGateway:**
- SupabaseGateway

---

## 5️⃣ **ExternalServices (MVP - 3):**

✅ **Tik MVP:**
- CameraGalleryBoundary
- MobileScannerBoundary
- OpenFoodFactsServiceBoundary

**PASTABA:** Po MVP (planuojama):
- GeminiServiceBoundary
- OCRServiceBoundary
- SpoonacularServiceBoundary

---

## 6️⃣ **Core:**

- Config (AppConfig)
- Errors (Exceptions, Failures)
- Network (SupabaseClient, HttpClient)
- Storage (LocalStorage)
- Theme (AppTheme)
- Utils (Helpers)

---

## 7️⃣ **Services (15):**

- MealPlanningService, ShoppingListService, ReceiptParsingService
- ImageProcessingService, OCRService, BarcodeScannerService
- NutritionService, HealthScoreService, FoodRecognitionService
- DealsScraperService, GeminiService, SpoonacularService
- OpenFoodFactsService, NotificationService, ProductMatchingService

---

## 8️⃣ **Actors (8):**

- GoogleAuthentication, FamilyAdministrator, FamilyMember
- Guest, GeminiAPI, MLKitOCR, StoreWebsite, SpoonacularAPI

---

## ✅ **SVARBŪS PATAISYMAI:**

1. ✅ **BudgetController** - sujungtas (valdymas + konfigūracija)
2. ✅ **ExpirationAlertController** - pašalintas (automatinis)
3. ✅ **BudgetAlertController** - pašalintas (sujungtas)
4. ✅ **ExternalServices** - supaprastinta (tik 3 MVP)

---

## 📊 **STATISTIKA:**

- **MemberSubsystem:** 15 Views + 13 Controllers = 28 komponentai
- **AdminSubsystem:** 6 Controllers
- **DomainModel:** 19 Entities + 7 Enumerations = 26 komponentai
- **ExternalServices:** 3 Boundaries (MVP)
- **Services:** 15 Services
- **Total:** ~88 komponentų

---

## ✅ **IŠVADA:**

**Diagrama supaprastinta ir logiška!** ✅


























