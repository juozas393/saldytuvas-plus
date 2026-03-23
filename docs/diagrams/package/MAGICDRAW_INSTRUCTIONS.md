# 🎨 MagicDraw Package Diagram - Instrukcijos

## 📋 **Greitas Startas**

### **1. Sukurti naują Package Diagramą**

1. MagicDraw → **File → New → Project**
2. Pasirinkti **"UML Model"**
3. Diagram Type: **"Package Diagram"**

---

## 🏗️ **2. Kurimo Eiliškumas**

### **Žingsnis 1: Sukurti Root Package**

```
📦 Sukurti Package: "SaldytuvasPlus"
```

### **Žingsnis 2: Sukurti Top-Level Packages (8 paketų)**

Sukurti šiuos packages **po SaldytuvasPlus**:

```
1. MemberSubsystem
2. AdminSubsystem
3. DomainModel
4. DataAccess
5. ExternalServices
6. Services
7. Core
8. Actors
```

**Kaip:**
- Dešiniu pelės mygtuku ant `SaldytuvasPlus` → **"Add → Package"**
- Įrašyti pavadinimą
- Pakartoti visiems 8 paketams

---

### **Žingsnis 3: Sukurti Sub-Packages**

**MemberSubsystem:**
```
MemberSubsystem
  ├── Views
  └── Controllers
```

**AdminSubsystem:**
```
AdminSubsystem
  └── Controllers
```

**DomainModel:**
```
DomainModel
  ├── Entities
  └── Enumerations
```

**DataAccess:**
```
DataAccess
  ├── Repositories
  └── SupabaseGateway
```

**Core:**
```
Core
  ├── Config
  ├── Errors
  ├── Network
  ├── Storage
  ├── Theme
  └── Utils
```

---

### **Žingsnis 4: Pridėti Classes/Interfaces/Enumerations**

#### **4.1. Views (MemberSubsystem.Views)**

Sukurti **Class** su stereotype `<<screen>>`:

```
HomePage
InventoryPage
ProductDetailsPage
AddProductPage
ReceiptAndBudgetPage
DealsPage
StoreDealsPage
ShoppingListScreen
LoginPage
ProfilePage
SettingsPage
MealPlanningPage
DishDetailsPage
AddRecipePage
NutritionPage
```

**Kaip:**
- Dešiniu pelės mygtuku ant `Views` package → **"Add → Class"**
- Pavadinimas: `HomePage`
- Stereotype: `<<screen>>`
- Pakartoti visiems 15 langų

#### **4.2. Controllers (MemberSubsystem.Controllers)**

Sukurti **Class** su stereotype `<<control>>`:

```
RouterController
DashboardController
InventoryController
ProductController
ProductScanController
ReceiptAndBudgetController
MealPlanningController
RecipeController
HealthEvaluationController
ShoppingListController
DealsController
AuthController
ProfileController
SettingsController
```

**Kaip:**
- Dešiniu pelės mygtuku ant `Controllers` package → **"Add → Class"**
- Pavadinimas: `InventoryController`
- Stereotype: `<<control>>`
- Pakartoti visiems controller'iams

#### **4.3. Entities (DomainModel.Entities)**

Sukurti **Class** su stereotype `<<entity>>`:

```
Administrator
Budget
Category
Deal
Dish
Environment
FoodRule
Inventory
Member
Notification
NutritionPlan
Product
PromoFlyer
Receipt
ReceiptLine
Recipe
ShoppingList
Store
User
```

#### **4.4. Enumerations (DomainModel.Enumerations)**

Sukurti **Enumeration**:

```
DishType
FoodRuleStatus
Gender
MealPlanStatus
NotificationLevel
StorePriority
UserRole
```

**Kaip:**
- Dešiniu pelės mygtuku ant `Enumerations` package → **"Add → Enumeration"**
- Įrašyti pavadinimą

#### **4.5. Repositories (DataAccess.Repositories)**

Sukurti **Interface**:

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

**Kaip:**
- Dešiniu pelės mygtuku ant `Repositories` package → **"Add → Interface"**
- Įrašyti pavadinimą

#### **4.6. Boundaries (ExternalServices + DataAccess.SupabaseGateway)**

Sukurti **Class** su stereotype `<<boundary>>`:

```
CameraGalleryBoundary
GeminiServiceBoundary
OCRServiceBoundary
OpenFoodFactsServiceBoundary
SpoonacularServiceBoundary
MobileScannerBoundary
SupabaseGateway (DataAccess.SupabaseGateway)
```

#### **4.7. Services (Services package)**

Sukurti **Class** (be stereotipo):

```
MealPlanningService
ShoppingListService
ReceiptParsingService
ImageProcessingService
OCRService
BarcodeScannerService
NutritionService
HealthScoreService
FoodRecognitionService
DealsScraperService
GeminiService
SpoonacularService
OpenFoodFactsService
NotificationService
ProductMatchingService
```

#### **4.8. Core Elements**

**Core.Config:**
- `AppConfig` (Class)

**Core.Errors:**
- `Exceptions` (Class)
- `Failures` (Class)

**Core.Network:**
- `SupabaseClient` (Class)
- `HttpClient` (Class)

**Core.Storage:**
- `LocalStorage` (Class)

**Core.Theme:**
- `AppTheme` (Class)

**Core.Utils:**
- `Helpers` (Class)

#### **4.9. Actors (Actors package)**

Sukurti **Actor** su stereotype `<<actor>>`:

```
GoogleAuthentication
FamilyAdministrator
FamilyMember
Guest
GeminiAPI
MLKitOCR
StoreWebsite
SpoonacularAPI
```

**Kaip:**
- Dešiniu pelės mygtuku ant `Actors` package → **"Add → Actor"**
- Stereotype: `<<actor>>`

---

### **Žingsnis 5: Pridėti Dependencies**

Sukurti **Dependency** (dashed arrow) tarp elementų:

#### **5.1. Views → Controllers**
```
MemberSubsystem.Views ──(uses)──> MemberSubsystem.Controllers
```

**Kaip:**
- Toolbar → **"Dependency"** tool
- Drag nuo `Views` package į `Controllers` package
- Label: `uses`

#### **5.2. Controllers → Services**
```
MemberSubsystem.Controllers ──(uses)──> Services
```

#### **5.3. Controllers → DomainModel**
```
MemberSubsystem.Controllers ──(uses entities)──> DomainModel.Entities
```

#### **5.4. Controllers → ExternalServices**
```
MemberSubsystem.Controllers ──(calls)──> ExternalServices
```

#### **5.5. Services → Repositories**
```
Services ──(uses)──> DataAccess.Repositories
```

#### **5.6. Repositories → SupabaseGateway**
```
DataAccess.Repositories ──(uses)──> DataAccess.SupabaseGateway
```

#### **5.7. SupabaseGateway → SupabaseClient**
```
DataAccess.SupabaseGateway ──(uses)──> Core.Network.SupabaseClient
```

#### **5.8. ExternalServices → HttpClient**
```
ExternalServices ──(uses)──> Core.Network.HttpClient
```

#### **5.9. Entities → Enumerations**
```
DomainModel.Entities ──(uses)──> DomainModel.Enumerations
```

#### **5.10. Actors → Views/Controllers**
```
Actors.FamilyMember ──(interacts)──> MemberSubsystem.Views
Actors.FamilyAdministrator ──(interacts)──> AdminSubsystem.Controllers
```

**Visi dependency žiūrėti:** `docs/diagrams/package/MAGICDRAW_STRUCTURE_TREE.txt`

---

## 🎨 **3. Formatavimas**

### **Stereotypes:**

1. Pasirinkti Class
2. Properties → **Stereotypes** tab
3. Pridėti stereotype:
   - `<<screen>>` - Views
   - `<<control>>` - Controllers
   - `<<entity>>` - Entities
   - `<<boundary>>` - Boundaries
   - `<<actor>>` - Actors

### **Spalvos (Optional):**

- **Views:** Mėlyna/Žalia
- **Controllers:** Žalia
- **Entities:** Mėlyna
- **Services:** Violetinė
- **Boundaries:** Raudona
- **Actors:** Rožinė

**Kaip:**
- Pasirinkti elementą
- Properties → **Appearance** tab
- Nustatyti Fill Color

---

## 📐 **4. Layoutas**

### **Rekomenduojamas išdėstymas:**

```
┌─────────────────────────────────────────────────────────────┐
│                    SaldytuvasPlus                           │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │   Member     │  │    Admin     │  │   Domain     │    │
│  │  Subsystem   │  │  Subsystem   │  │   Model      │    │
│  └──────────────┘  └──────────────┘  └──────────────┘    │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐                       │
│  │  DataAccess  │  │  External    │                       │
│  │              │  │  Services    │                       │
│  └──────────────┘  └──────────────┘                       │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │   Services   │  │     Core     │  │    Actors    │    │
│  │              │  │              │  │              │    │
│  └──────────────┘  └──────────────┘  └──────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

---

## ✅ **5. Patikrinimo Sąrašas**

- [ ] Root package sukurtas
- [ ] Visi 8 top-level packages sukurti
- [ ] Visi sub-packages sukurti
- [ ] Visos Classes sukurtos (Views, Controllers, Entities, Services, Boundaries)
- [ ] Visi Interfaces sukurti (Repositories)
- [ ] Visos Enumerations sukurtos
- [ ] Visi Actors sukurti
- [ ] Visi Stereotypes pritaikyti
- [ ] Visos Dependencies nubrėžtos (15+ priklausomybių)
- [ ] Diagrama atrodo tvarkingai (layout)

---

## 📤 **6. Eksportavimas**

### **Eksportuoti kaip PNG:**

1. **File → Export → Image**
2. Format: **PNG**
3. Resolution: **300 DPI** (high quality)
4. Background: **White**
5. Save

### **Eksportuoti kaip PDF:**

1. **File → Export → PDF**
2. Page Size: **A3** (landscape)
3. Fit to Page: **Yes**

---

## 🎯 **Išvada**

Ši struktūra yra **loginė architektūra** - ji rodo priklausomybes, ne fizinę failų struktūrą. Fiziniame Flutter kode viskas bus `lib/features/*/` organizacijoje, bet loginė architektūra parodo, kaip komponentai logiškai susiję.

**MagicDraw struktūra = Loginė architektūra = Planas!** ✅


























