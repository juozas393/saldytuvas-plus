# 🏗️ Pilna Architektūros Apžvalga

## 📊 **SISTEMOS LOGINĖ ARCHITEKTŪRA - VISAS PAVEIKSLAS**

---

## 🎯 **STRUKTŪRA:**

### **8 PAGRINDINIAI PAKETAI (Top-Level):**

1. **MemberSubsystem** - Flutter UI + Member Controller'iai
2. **AdminSubsystem** - Admin Controller'iai
3. **DomainModel** - Entities + Enumerations (bendras)
4. **DataAccess** - Repositories + SupabaseGateway
5. **ExternalServices** - External Boundaries
6. **Services** - Business Logic Services
7. **Core** - Cross-cutting Concerns
8. **Actors** - Sistemos aktoriai

---

## 📦 **1. MEMBER SUBSYSTEM**

### **Views (15 langų):**
- `HomePage` (Dashboard)
- `LoginPage`
- `InventoryPage`
- `ProductDetailsPage`
- `AddProductPage`
- `ReceiptAndBudgetPage`
- `DealsPage`
- `StoreDealsPage`
- `ShoppingListScreen`
- `MealPlanningPage`
- `DishDetailsPage`
- `AddRecipePage`
- `NutritionPage`
- `ProfilePage`
- `SettingsPage`

### **Controllers (14 BLoC'ų):**
- `RouterController` - Navigation
- `DashboardController` - Pagrindinis ekranas
- `InventoryController` - Inventorius
- `ProductController` - Produktai
- `ProductScanController` - Skenavimas (barcode, OCR)
- `ReceiptAndBudgetController` - Čekiai + biudžeto peržiūra
- `MealPlanningController` - Mitybos planas (peržiūra)
- `RecipeController` - Receptai
- `HealthEvaluationController` - Sveikatos įvertinimas
- `ShoppingListController` - Pirkinių sąrašas
- `DealsController` - Akcijos
- `AuthController` - Autentifikacija
- `ProfileController` - Profilis
- `SettingsController` - Nustatymai

---

## 📦 **2. ADMIN SUBSYSTEM**

### **Controllers (8 BLoC'ų):**
- `FamilyMembersController` - Valdyti šeimos narius (PAA9)
- `BudgetController` - Valdyti biudžetą (PAA6)
- `InventoryAccessController` - Valdyti prieigą (PAA4)
- `DealsUpdateController` - Atnaujinti akcijas (PAA3)
- `FoodRulesController` - Maisto taisyklės (PAA7)
- `FoodSubstituteController` - Pakaitalai (PAA8)
- `BudgetAlertController` - Biudžeto perspėjimai (PAA5)
- `ExpirationAlertController` - Galiojimo perspėjimai (PAA10)

**Pastaba:** Admin naudoja MemberSubsystem.Views su admin permissions!

---

## 📦 **3. DOMAIN MODEL**

### **Entities (19):**
- `Administrator`
- `Budget`
- `Category`
- `Deal`
- `Dish`
- `Environment`
- `FoodRule`
- `Inventory`
- `Member`
- `Notification`
- `NutritionPlan`
- `Product`
- `PromoFlyer`
- `Receipt`
- `ReceiptLine`
- `Recipe`
- `ShoppingList`
- `Store`
- `User`

### **Enumerations (7):**
- `DishType`
- `FoodRuleStatus`
- `Gender`
- `MealPlanStatus`
- `NotificationLevel`
- `StorePriority`
- `UserRole`

---

## 📦 **4. DATA ACCESS**

### **Repositories (10):**
- `IInventoryRepository`
- `IReceiptRepository`
- `IBudgetRepository`
- `IMealPlanRepository`
- `IShoppingListRepository`
- `IRecipeRepository`
- `IUserRepository`
- `IDealsRepository`
- `ICategoryRepository`
- `INotificationRepository`

### **SupabaseGateway:**
- Wrap'ina `Core.Network.SupabaseClient`
- Vienas adapteris visoms repository

---

## 📦 **5. EXTERNAL SERVICES**

### **Boundaries (6):**
- `CameraGalleryBoundary` - Kamera/Galerija
- `GeminiServiceBoundary` - Gemini API
- `OCRServiceBoundary` - ML Kit OCR
- `OpenFoodFactsServiceBoundary` - Open Food Facts API
- `SpoonacularServiceBoundary` - Spoonacular API
- `MobileScannerBoundary` - Barcode Scanner

---

## 📦 **6. SERVICES**

### **Business Logic Services (15):**
- `MealPlanningService` - Mitybos planavimas
- `ShoppingListService` - Pirkinių sąrašas
- `ReceiptParsingService` - Čekio parsing
- `ImageProcessingService` - Vaizdo apdorojimas
- `OCRService` - OCR logika
- `BarcodeScannerService` - Barkodų skaitymas
- `NutritionService` - Mitybos analizė
- `HealthScoreService` - Sveikatos įvertinimas
- `FoodRecognitionService` - Maisto atpažinimas
- `DealsScraperService` - Akcijų scraping
- `GeminiService` - Gemini API wrapper
- `SpoonacularService` - Spoonacular API wrapper
- `OpenFoodFactsService` - Open Food Facts API wrapper
- `NotificationService` - Įspėjimų siuntimas
- `ProductMatchingService` - Produktų suderinimas

---

## 📦 **7. CORE**

### **Cross-cutting Concerns:**
- `Config/AppConfig` - Konfigūracija
- `Errors/Exceptions` - Klaidos
- `Errors/Failures` - Failure objektai
- `Network/SupabaseClient` - Supabase klientas
- `Network/HttpClient` - HTTP klientas
- `Storage/LocalStorage` - Vietinis saugojimas
- `Theme/AppTheme` - Temos
- `Utils/Helpers` - Pagalbinės funkcijos

---

## 📦 **8. ACTORS**

### **Aktoriai:**
- `FamilyMember` - Šeimos narys
- `FamilyAdministrator` - Šeimos administratorius
- `Guest` - Svečias (ribota prieiga)
- `GoogleAuthentication` - Google Auth
- `GeminiAPI` - Gemini API (išorinė sistema)
- `MLKitOCR` - ML Kit OCR (išorinė sistema)
- `StoreWebsite` - Parduotuvių svetainės
- `SpoonacularAPI` - Spoonacular API (išorinė sistema)

---

## 🔄 **PRIKLAUSOMYBĖS (Dependencies):**

### **Views → Controllers:**
```
MemberSubsystem.Views → MemberSubsystem.Controllers
```

### **Controllers → Services + Domain:**
```
MemberSubsystem.Controllers → Services
MemberSubsystem.Controllers → DomainModel.Entities

AdminSubsystem.Controllers → Services
AdminSubsystem.Controllers → DomainModel.Entities
```

### **Services → Domain + DataAccess + External:**
```
Services → DomainModel.Entities
Services → DataAccess.Repositories
Services → ExternalServices
```

### **DataAccess → Domain + Supabase + Core:**
```
DataAccess.Repositories → DomainModel.Entities
DataAccess.Repositories → DataAccess.SupabaseGateway
DataAccess.SupabaseGateway → Core.Network.SupabaseClient
```

### **DomainModel vidinės priklausomybės:**
```
DomainModel.Entities → DomainModel.Enumerations
```

### **ExternalServices → Core:**
```
ExternalServices → Core.Network.HttpClient
```

### **Subsystems → Core:**
```
MemberSubsystem → Core
AdminSubsystem → Core
Services → Core
```

### **Actors → UI / Controllers / Boundaries / Services:**
```
FamilyMember → MemberSubsystem.Views
FamilyAdministrator → MemberSubsystem.Views (su admin permissions)
FamilyAdministrator → AdminSubsystem.Controllers
Guest → MemberSubsystem.Views (limited access)

GoogleAuthentication → MemberSubsystem.Controllers.AuthController
GeminiAPI → ExternalServices.GeminiServiceBoundary
MLKitOCR → ExternalServices.OCRServiceBoundary
StoreWebsite → Services.DealsScraperService
SpoonacularAPI → ExternalServices.SpoonacularServiceBoundary
```

---

## 🎯 **TYPICAL FLOWS:**

### **1. Member Flow (Pavyzdys - Pridėti Produktą):**
```
FamilyMember
  ↓
InventoryPage (MemberSubsystem.Views)
  ↓
ProductScanController (MemberSubsystem.Controllers)
  ↓
ProductScanController.add(ScanBarcodeEvent())
  ↓
BarcodeScannerService (Services)
  ↓
MobileScannerBoundary (ExternalServices)
  ↓
OpenFoodFactsService (Services)
  ↓
OpenFoodFactsServiceBoundary (ExternalServices)
  ↓
IInventoryRepository (DataAccess.Repositories)
  ↓
SupabaseGateway (DataAccess)
  ↓
SupabaseClient (Core.Network)
  ↓
Supabase (Cloud)
```

### **2. Admin Flow (Pavyzdys - Nustatyti Biudžeto Perspėjimą):**
```
FamilyAdministrator
  ↓
ReceiptAndBudgetPage (MemberSubsystem.Views)
  ↓ (su admin permissions)
BudgetAlertController (AdminSubsystem.Controllers)
  ↓
BudgetAlertController.add(SetBudgetAlertEvent())
  ↓
IBudgetRepository (DataAccess.Repositories)
  ↓
SupabaseGateway (DataAccess)
  ↓
SupabaseClient (Core.Network)
  ↓
Supabase (Cloud)

(Arba:)
NotificationService (Services) - naudoja nustatymus automatiškai
```

### **3. Automatinis Procesas (Cron Job - Akcijų Atnaujinimas):**
```
Cron Job (Backend)
  ↓ (tiesiogiai, BE controller'io)
DealsScraperService (Services)
  ↓
StoreWebsite (Actors)
  ↓
IDealsRepository (DataAccess.Repositories)
  ↓
SupabaseGateway (DataAccess)
  ↓
SupabaseClient (Core.Network)
  ↓
Supabase (Cloud)
```

---

## ✅ **ARCHITEKTŪROS PRINCIPAI:**

### **1. Clean Architecture:**
- **Presentation Layer:** Views + Controllers
- **Domain Layer:** Entities + Enumerations
- **Data Layer:** Repositories + SupabaseGateway

### **2. Separation of Concerns:**
- **Views:** Tik UI (Flutter widgets)
- **Controllers:** Tik state management (BLoC)
- **Services:** Tik business logic
- **Repositories:** Tik data access

### **3. Dependency Inversion:**
- Controllers priklauso nuo Services (interfaces)
- Services priklauso nuo Repositories (interfaces)
- Ne priklauso nuo konkrečių implementacijų

### **4. Single Responsibility:**
- Kiekvienas controller'is atsakingas už vieną feature
- Kiekvienas service'as atsakingas už vieną business logic
- Kiekvienas repository atsakingas už vieną data source

---

## 📊 **STATISTIKA:**

| Kategorija | Kiekis |
|-----------|--------|
| **Views** | 15 |
| **Member Controllers** | 14 |
| **Admin Controllers** | 8 |
| **Entities** | 19 |
| **Enumerations** | 7 |
| **Repositories** | 10 |
| **Services** | 15 |
| **External Boundaries** | 6 |
| **Core Components** | 8+ |
| **Actors** | 8 |

---

## ✅ **GALUTINĖ IŠVADA:**

**Architektūra yra:**
- ✅ Logiškai suorganizuota (8 paketų)
- ✅ Clean Architecture principai
- ✅ Separation of Concerns
- ✅ Dependency Inversion
- ✅ Single Responsibility
- ✅ Flutter-friendly (BLoC pattern)
- ✅ Scalable ir maintainable

**Viskas paruošta implementacijai!** 🚀


























