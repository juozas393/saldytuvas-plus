# 🎨 MagicDraw Package Diagram - Instrukcijos (Be Root Package)

## 📋 **Greitas Startas**

### **1. Sukurti naują Package Diagramą**

1. MagicDraw → **File → New → Project**
2. Pasirinkti **"UML Model"**
3. Diagram Type: **"Package Diagram"**

---

## 🏗️ **2. Kurimo Eiliškumas (BE ROOT PACKAGE)**

### **SVARBU: Nėra Root Package!**

Visus packages sukuriame kaip **top-level packages** (ne po root package).

---

### **Žingsnis 1: Sukurti Top-Level Packages (8 paketų)**

Sukurti šiuos packages **tiesiogiai diagramoje** (be root package):

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
- MagicDraw → **Add → Package** (tiesiogiai diagramoje)
- Įrašyti pavadinimą
- Pakartoti visiems 8 paketams

**Rezultatas:**
```
MemberSubsystem (top-level)
AdminSubsystem (top-level)
DomainModel (top-level)
... (visi top-level)
```

---

### **Žingsnis 2: Sukurti Sub-Packages**

**MemberSubsystem:**
```
MemberSubsystem
  ├── Views
  └── Controllers
```

**Kaip:**
- Dešiniu pelės mygtuku ant `MemberSubsystem` → **"Add → Package"**
- Pavadinimas: `Views`
- Pakartoti: `Controllers`

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

### **Žingsnis 3: Pridėti Classes/Interfaces/Enumerations**

#### **3.1. Views (MemberSubsystem.Views)**

Sukurti **Class** su stereotype `<<screen>>`:

```
HomePage
LoginPage
InventoryPage
ProductDetailsPage
AddProductPage
ReceiptAndBudgetPage
DealsPage
StoreDealsPage
ShoppingListScreen
MealPlanningPage
DishDetailsPage
AddRecipePage
NutritionPage
ProfilePage
SettingsPage
```

**Kaip:**
- Dešiniu pelės mygtuku ant `Views` package → **"Add → Class"**
- Pavadinimas: `HomePage`
- Properties → Stereotypes → Add: `<<screen>>`
- Pakartoti visiems 15 langų

#### **3.2. Controllers (MemberSubsystem.Controllers)**

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

#### **3.3. Entities (DomainModel.Entities)**

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

#### **3.4. Enumerations (DomainModel.Enumerations)**

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

#### **3.5. Repositories (DataAccess.Repositories)**

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

#### **3.6. Boundaries (ExternalServices + DataAccess.SupabaseGateway)**

Sukurti **Class** su stereotype `<<boundary>>`:

**ExternalServices:**
```
CameraGalleryBoundary
GeminiServiceBoundary
OCRServiceBoundary
OpenFoodFactsServiceBoundary
SpoonacularServiceBoundary
MobileScannerBoundary
```

**DataAccess.SupabaseGateway:**
```
SupabaseGateway
```

#### **3.7. Services (Services package)**

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

#### **3.8. Core Elements**

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

#### **3.9. Actors (Actors package)**

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

### **Žingsnis 4: Pridėti Dependencies**

Sukurti **Dependency** (dashed arrow) tarp elementų:

#### **4.1. Views → Controllers**
```
MemberSubsystem.Views ──(uses)──> MemberSubsystem.Controllers
```

**Kaip:**
- Toolbar → **"Dependency"** tool
- Drag nuo `Views` package į `Controllers` package
- Label: `uses`

#### **4.2. Controllers → Services**
```
MemberSubsystem.Controllers ──(uses)──> Services
```

#### **4.3. Controllers → DomainModel**
```
MemberSubsystem.Controllers ──(uses entities)──> DomainModel.Entities
```

#### **4.4. Controllers → ExternalServices**
```
MemberSubsystem.Controllers ──(calls)──> ExternalServices
```

#### **4.5. Services → Repositories**
```
Services ──(uses)──> DataAccess.Repositories
```

#### **4.6. Repositories → SupabaseGateway**
```
DataAccess.Repositories ──(uses)──> DataAccess.SupabaseGateway
```

#### **4.7. SupabaseGateway → SupabaseClient**
```
DataAccess.SupabaseGateway ──(uses)──> Core.Network.SupabaseClient
```

#### **4.8. ExternalServices → HttpClient**
```
ExternalServices ──(uses)──> Core.Network.HttpClient
```

#### **4.9. Entities → Enumerations**
```
DomainModel.Entities ──(uses)──> DomainModel.Enumerations
```

#### **4.10. Actors → Views/Controllers**
```
Actors.FamilyMember ──(interacts)──> MemberSubsystem.Views
Actors.FamilyAdministrator ──(interacts)──> AdminSubsystem.Controllers
```

**Visi dependency žiūrėti:** `complete_architecture_NO_ROOT.puml`

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

---

## 📐 **4. Layoutas (Be Root Package)**

### **Rekomenduojamas išdėstymas:**

```
┌─────────────────────────────────────────────────────────────┐
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
│                                                             │
└─────────────────────────────────────────────────────────────┘

(Nėra root package - visi paketai top-level)
```

---

## ✅ **5. Patikrinimo Sąrašas**

- [ ] Visi 8 top-level packages sukurti (be root package)
- [ ] Visi sub-packages sukurti
- [ ] Visos Classes sukurtos (Views, Controllers, Entities, Services, Boundaries)
- [ ] Visi Interfaces sukurti (Repositories)
- [ ] Visos Enumerations sukurtos
- [ ] Visi Actors sukurti
- [ ] Visi Stereotypes pritaikyti
- [ ] Visos Dependencies nubrėžtos (15+ priklausomybių)
- [ ] Diagrama atrodo tvarkingai (layout)
- [ ] Nėra root package "SaldytuvasPlus"

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

Ši struktūra yra **loginė architektūra be root package** - visi paketai yra top-level. Fiziniame Flutter kode viskas bus `lib/features/*/` organizacijoje, bet loginė architektūra parodo, kaip komponentai logiškai susiję.

**MagicDraw struktūra = Loginė architektūra = Planas (be root package)!** ✅


























