# 🎨 Package Diagram Struktūra MagicDraw (ar kitoje UML sistemoje)

> **Tikslas:** Sukurti package diagramą, kuri atspindi jūsų Flutter aplikacijos loginę architektūrą.

---

## 📋 **1. PAGRINDINĖ STRUKTŪRA**

### **Top-Level Packages (1 lygis):**

```
SaldytuvasPlus (Root Package)
│
├── 1. MemberSubsystem
│   ├── Views
│   └── Controllers
│
├── 2. AdminSubsystem
│   └── Controllers
│
├── 3. DomainModel
│   ├── Entities
│   └── Enumerations
│
├── 4. DataAccess
│   ├── Repositories
│   └── SupabaseGateway
│
├── 5. ExternalServices
│
├── 6. Services
│
├── 7. Core
│   ├── Config
│   ├── Errors
│   ├── Network
│   ├── Storage
│   ├── Theme
│   └── Utils
│
└── 8. Actors
```

---

## 🎯 **2. KONKRETUS STRUKTŪROS PAVYZDYS**

### **Paketų hierarchija MagicDraw:**

```
📦 SaldytuvasPlus
│
├── 📦 MemberSubsystem
│   │   └── Type: Package (Subsystem)
│   │
│   ├── 📦 Views
│   │   │   └── Type: Package
│   │   │
│   │   ├── 🎨 HomePage (Class, Stereotype: <<screen>>)
│   │   ├── 🎨 InventoryPage (Class, Stereotype: <<screen>>)
│   │   ├── 🎨 ProductDetailsPage (Class, Stereotype: <<screen>>)
│   │   ├── 🎨 AddProductPage (Class, Stereotype: <<screen>>)
│   │   ├── 🎨 ReceiptAndBudgetPage (Class, Stereotype: <<screen>>)
│   │   ├── 🎨 DealsPage (Class, Stereotype: <<screen>>)
│   │   ├── 🎨 StoreDealsPage (Class, Stereotype: <<screen>>)
│   │   ├── 🎨 ShoppingListScreen (Class, Stereotype: <<screen>>)
│   │   ├── 🎨 LoginPage (Class, Stereotype: <<screen>>)
│   │   ├── 🎨 ProfilePage (Class, Stereotype: <<screen>>)
│   │   ├── 🎨 SettingsPage (Class, Stereotype: <<screen>>)
│   │   ├── 🎨 MealPlanningPage (Class, Stereotype: <<screen>>)
│   │   ├── 🎨 DishDetailsPage (Class, Stereotype: <<screen>>)
│   │   ├── 🎨 AddRecipePage (Class, Stereotype: <<screen>>)
│   │   └── 🎨 NutritionPage (Class, Stereotype: <<screen>>)
│   │
│   └── 📦 Controllers
│       │   └── Type: Package
│       │
│       ├── 🎛️ RouterController (Class, Stereotype: <<control>>)
│       ├── 🎛️ DashboardController (Class, Stereotype: <<control>>)
│       ├── 🎛️ InventoryController (Class, Stereotype: <<control>>)
│       ├── 🎛️ ProductController (Class, Stereotype: <<control>>)
│       ├── 🎛️ ProductScanController (Class, Stereotype: <<control>>)
│       ├── 🎛️ ReceiptAndBudgetController (Class, Stereotype: <<control>>)
│       ├── 🎛️ MealPlanningController (Class, Stereotype: <<control>>)
│       ├── 🎛️ RecipeController (Class, Stereotype: <<control>>)
│       ├── 🎛️ HealthEvaluationController (Class, Stereotype: <<control>>)
│       ├── 🎛️ ShoppingListController (Class, Stereotype: <<control>>)
│       ├── 🎛️ DealsController (Class, Stereotype: <<control>>)
│       ├── 🎛️ AuthController (Class, Stereotype: <<control>>)
│       ├── 🎛️ ProfileController (Class, Stereotype: <<control>>)
│       └── 🎛️ SettingsController (Class, Stereotype: <<control>>)
│
├── 📦 AdminSubsystem
│   │   └── Type: Package (Subsystem)
│   │
│   └── 📦 Controllers
│       │   └── Type: Package
│       │
│       └── 🎛️ ShoppingListController (Class, Stereotype: <<control>>)
│
├── 📦 DomainModel
│   │   └── Type: Package
│   │
│   ├── 📦 Entities
│   │   │   └── Type: Package
│   │   │
│   │   ├── 📦 Administrator (Class, Stereotype: <<entity>>)
│   │   ├── 📦 Budget (Class, Stereotype: <<entity>>)
│   │   ├── 📦 Category (Class, Stereotype: <<entity>>)
│   │   ├── 📦 Deal (Class, Stereotype: <<entity>>)
│   │   ├── 📦 Dish (Class, Stereotype: <<entity>>)
│   │   ├── 📦 Environment (Class, Stereotype: <<entity>>)
│   │   ├── 📦 FoodRule (Class, Stereotype: <<entity>>)
│   │   ├── 📦 Inventory (Class, Stereotype: <<entity>>)
│   │   ├── 📦 Member (Class, Stereotype: <<entity>>)
│   │   ├── 📦 Notification (Class, Stereotype: <<entity>>)
│   │   ├── 📦 NutritionPlan (Class, Stereotype: <<entity>>)
│   │   ├── 📦 Product (Class, Stereotype: <<entity>>)
│   │   ├── 📦 PromoFlyer (Class, Stereotype: <<entity>>)
│   │   ├── 📦 Receipt (Class, Stereotype: <<entity>>)
│   │   ├── 📦 ReceiptLine (Class, Stereotype: <<entity>>)
│   │   ├── 📦 Recipe (Class, Stereotype: <<entity>>)
│   │   ├── 📦 ShoppingList (Class, Stereotype: <<entity>>)
│   │   ├── 📦 Store (Class, Stereotype: <<entity>>)
│   │   └── 📦 User (Class, Stereotype: <<entity>>)
│   │
│   └── 📦 Enumerations
│       │   └── Type: Package
│       │
│       ├── 🔢 DishType (Enumeration)
│       ├── 🔢 FoodRuleStatus (Enumeration)
│       ├── 🔢 Gender (Enumeration)
│       ├── 🔢 MealPlanStatus (Enumeration)
│       ├── 🔢 NotificationLevel (Enumeration)
│       ├── 🔢 StorePriority (Enumeration)
│       └── 🔢 UserRole (Enumeration)
│
├── 📦 DataAccess
│   │   └── Type: Package
│   │
│   ├── 📦 Repositories
│   │   │   └── Type: Package
│   │   │
│   │   ├── 📄 IInventoryRepository (Interface)
│   │   ├── 📄 IReceiptRepository (Interface)
│   │   ├── 📄 IBudgetRepository (Interface)
│   │   ├── 📄 IMealPlanRepository (Interface)
│   │   ├── 📄 IShoppingListRepository (Interface)
│   │   ├── 📄 IRecipeRepository (Interface)
│   │   ├── 📄 IUserRepository (Interface)
│   │   ├── 📄 IDealsRepository (Interface)
│   │   ├── 📄 ICategoryRepository (Interface)
│   │   └── 📄 INotificationRepository (Interface)
│   │
│   └── 📦 SupabaseGateway
│       │   └── Type: Package
│       │
│       └── 🔌 SupabaseGateway (Class, Stereotype: <<boundary>>)
│
├── 📦 ExternalServices
│   │   └── Type: Package
│   │
│   ├── 🔌 CameraGalleryBoundary (Class, Stereotype: <<boundary>>)
│   ├── 🔌 GeminiServiceBoundary (Class, Stereotype: <<boundary>>)
│   ├── 🔌 OCRServiceBoundary (Class, Stereotype: <<boundary>>)
│   ├── 🔌 OpenFoodFactsServiceBoundary (Class, Stereotype: <<boundary>>)
│   ├── 🔌 SpoonacularServiceBoundary (Class, Stereotype: <<boundary>>)
│   └── 🔌 MobileScannerBoundary (Class, Stereotype: <<boundary>>)
│
├── 📦 Services
│   │   └── Type: Package
│   │
│   ├── ⚙️ MealPlanningService (Class)
│   ├── ⚙️ ShoppingListService (Class)
│   ├── ⚙️ ReceiptParsingService (Class)
│   ├── ⚙️ ImageProcessingService (Class)
│   ├── ⚙️ OCRService (Class)
│   ├── ⚙️ BarcodeScannerService (Class)
│   ├── ⚙️ NutritionService (Class)
│   ├── ⚙️ HealthScoreService (Class)
│   ├── ⚙️ FoodRecognitionService (Class)
│   ├── ⚙️ DealsScraperService (Class)
│   ├── ⚙️ GeminiService (Class)
│   ├── ⚙️ SpoonacularService (Class)
│   ├── ⚙️ OpenFoodFactsService (Class)
│   ├── ⚙️ NotificationService (Class)
│   └── ⚙️ ProductMatchingService (Class)
│
├── 📦 Core
│   │   └── Type: Package
│   │
│   ├── 📦 Config
│   │   │   └── Type: Package
│   │   │
│   │   └── ⚙️ AppConfig (Class)
│   │
│   ├── 📦 Errors
│   │   │   └── Type: Package
│   │   │
│   │   ├── ⚠️ Exceptions (Class)
│   │   └── ⚠️ Failures (Class)
│   │
│   ├── 📦 Network
│   │   │   └── Type: Package
│   │   │
│   │   ├── 🌐 SupabaseClient (Class)
│   │   └── 🌐 HttpClient (Class)
│   │
│   ├── 📦 Storage
│   │   │   └── Type: Package
│   │   │
│   │   └── 💾 LocalStorage (Class)
│   │
│   ├── 📦 Theme
│   │   │   └── Type: Package
│   │   │
│   │   └── 🎨 AppTheme (Class)
│   │
│   └── 📦 Utils
│       │   └── Type: Package
│       │
│       └── 🔧 Helpers (Class)
│
└── 📦 Actors
    │   └── Type: Package
    │
    ├── 👤 GoogleAuthentication (Actor, Stereotype: <<actor>>)
    ├── 👤 FamilyAdministrator (Actor, Stereotype: <<actor>>)
    ├── 👤 FamilyMember (Actor, Stereotype: <<actor>>)
    ├── 👤 Guest (Actor, Stereotype: <<actor>>)
    ├── 🤖 GeminiAPI (Actor, Stereotype: <<actor>>)
    ├── 🤖 MLKitOCR (Actor, Stereotype: <<actor>>)
    ├── 🏪 StoreWebsite (Actor, Stereotype: <<actor>>)
    └── 🤖 SpoonacularAPI (Actor, Stereotype: <<actor>>)
```

---

## 🎨 **3. MAGICDRAW KONFIGŪRACIJA**

### **Elementų tipai ir stereotipai:**

| Elementas | Type | Stereotype | Color/Icon |
|-----------|------|------------|------------|
| **Views** | Class | `<<screen>>` | 🎨 (Yellow/Blue) |
| **Controllers** | Class | `<<control>>` | 🎛️ (Green) |
| **Entities** | Class | `<<entity>>` | 📦 (Blue) |
| **Enumerations** | Enumeration | (none) | 🔢 (Light Blue) |
| **Repositories** | Interface | (none) | 📄 (Orange) |
| **Boundaries** | Class | `<<boundary>>` | 🔌 (Red) |
| **Services** | Class | (none) | ⚙️ (Purple) |
| **Actors** | Actor | `<<actor>>` | 👤 (Pink) |
| **Packages** | Package | (none) | 📦 (Gray) |

---

## 🔗 **4. PRIKLAUSOMYBĖS (DEPENDENCIES)**

### **Dependency arrows:**

```
MemberSubsystem.Views ──(uses)──> MemberSubsystem.Controllers
MemberSubsystem.Controllers ──(uses)──> Services
MemberSubsystem.Controllers ──(uses)──> DomainModel.Entities
MemberSubsystem.Controllers ──(calls)──> ExternalServices
AdminSubsystem.Controllers ──(uses)──> Services
AdminSubsystem.Controllers ──(uses)──> DomainModel.Entities
Services ──(uses)──> DomainModel.Entities
Services ──(calls)──> ExternalServices
Services ──(uses)──> DataAccess.Repositories
DataAccess.Repositories ──(uses)──> DataAccess.SupabaseGateway
DataAccess.SupabaseGateway ──(uses)──> Core.Network.SupabaseClient
ExternalServices ──(uses)──> Core.Network.HttpClient
DomainModel.Entities ──(uses)──> DomainModel.Enumerations
```

---

## 📐 **5. KURIMO EILIŠKUMAS**

### **1. Sukurti Root Package:**
```
📦 SaldytuvasPlus
```

### **2. Sukurti Top-Level Packages:**
```
├── MemberSubsystem
├── AdminSubsystem
├── DomainModel
├── DataAccess
├── ExternalServices
├── Services
├── Core
└── Actors
```

### **3. Sukurti Sub-Packages:**
Pvz.:
```
MemberSubsystem
  ├── Views
  └── Controllers
```

### **4. Pridėti Classes/Interfaces/Enumerations:**
Pvz.:
```
Views Package
  └── Add Class: InventoryPage
      └── Stereotype: <<screen>>
```

### **5. Pridėti Dependencies:**
Pvz.:
```
InventoryPage ──(dependency)──> InventoryController
```

---

## 🎯 **6. MAGICDRAW SPECIFIKACIJOS**

### **Package Properties:**

| Property | Value |
|----------|-------|
| **Visibility** | Public |
| **Is Leaf** | false (jei turi sub-packages) |
| **Is Abstract** | false |

### **Class Properties:**

| Property | Value |
|----------|-------|
| **Visibility** | Public |
| **Is Abstract** | false (jei nėra interface) |
| **Stereotype** | Pagal elementą (screen, control, entity, boundary) |

---

## 📋 **7. EKSPORTOVIMO NUSTATYMAI**

### **MagicDraw → Image:**

1. **File → Export → Image**
2. **Format:** PNG (high resolution) arba SVG
3. **Resolution:** 300 DPI
4. **Include:** All elements, notes, dependencies

### **MagicDraw → PDF:**

1. **File → Export → PDF**
2. **Page Size:** A3 arba A4 (landscape)
3. **Fit to Page:** Yes

---

## ✅ **8. PATIKRINIMO SĄRAŠAS**

- [ ] Root package sukurtas
- [ ] Visi top-level packages sukurti
- [ ] Visi sub-packages sukurti
- [ ] Visi Classes/Interfaces/Enumerations pridėti
- [ ] Visi Stereotypes pritaikyti
- [ ] Visos Dependencies nubrėžtos
- [ ] Notes/pranešimai pridėti (jei reikia)
- [ ] Diagrama eksportuota kaip PNG/PDF

---

## 🎯 **Išvada:**

Tai yra **loginės architektūros struktūra** - ji rodo priklausomybes, ne fizinę failų struktūrą. Fiziniame kode viskas bus `lib/features/*/` organizacijoje, bet loginė architektūra parodo, kaip komponentai susiję.

**MagicDraw struktūra = Loginė architektūra = Diagrama rodo priklausomybes!** ✅


























