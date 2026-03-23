# 🔍 MagicDraw Diagram - Reikalingi Pataisymai

## 📊 **NUOTRAUKOJE MATAU:**

### **✅ GERAI:**

1. ✅ Member Subsystem struktūra (Views + Controllers.Member + Controllers.Admin)
2. ✅ Views (15) - visi yra
3. ✅ Controllers.Member (13) - visi yra
4. ✅ Controllers.Admin (6) - visi yra
5. ✅ DomainModel (Entities + Enumerations)
6. ✅ Core sub-packages (6)

---

## ❌ **REIKALINGI PATAISYMAI:**

### **1. REPOSITORIES - RAŠYBOS KLAIDOS:**

**MagicDraw diagramoje:**
- ❌ `IInvenotry Repository` (tarpas + klaida "Invenotry")
- ❌ `ICategory Repository` (tarpas)
- ❌ `IDeals Repository` (tarpas)

**Turėtų būti:**
- ✅ `IInventoryRepository` (be tarpo, teisingas pavadinimas)
- ✅ `ICategoryRepository` (be tarpo)
- ✅ `IDealsRepository` (be tarpo)

**Pastaba:** Repositories turi būti **interfeisai** (`<<interface>>` stereotype)

---

### **2. CONTROLLER - RAŠYBOS KLAIDA:**

**MagicDraw diagramoje:**
- ❌ `FoodSubs titudeController` (tarpas + klaida "Subs titude")

**Turėtų būti:**
- ✅ `FoodSubstituteController` (be tarpo, teisingas pavadinimas)

---

### **3. EXTERNAL SERVICES:**

**MagicDraw diagramoje:**
- ✅ `CameraGalleryBoundary`
- ❌ `GemeniServiceBoundary` ← RAŠYBOS KLAIDA! Turėtų būti `GeminiServiceBoundary`
- ✅ `OCRServiceBoundary`
- ✅ `OpenFoodFactsServiceBoundary`

**Pastaba:** MVP turėtų būti tik 3:
- CameraGalleryBoundary
- MobileScannerBoundary
- OpenFoodFactsServiceBoundary

**Po MVP:**
- GeminiServiceBoundary
- OCRServiceBoundary
- SpoonacularServiceBoundary

---

### **4. CORE.NETWORK:**

**MagicDraw diagramoje:**
- ✅ `HttpClient`

**Trūksta:**
- ⚠️ `SupabaseClient` (gali būti implikuotas, bet geriau rodyti)

---

### **5. DATAACCESS:**

**MagicDraw diagramoje:**
- ✅ Repositories sub-package

**Trūksta:**
- ⚠️ `SupabaseGateway` sub-package (gali būti implikuotas)

---

### **6. DEPENDENCIES:**

**MagicDraw diagramoje:**
- ✅ Member Subsystem -> Core
- ✅ Controllers -> DomainModel
- ✅ Controllers -> DataAccess
- ✅ Controllers -> External Services
- ✅ DataAccess -> DomainModel
- ✅ External Services -> Core.HttpClient

**Trūksta (galbūt):**
- ⚠️ Views -> Controllers (MVC pattern)
- ⚠️ SupabaseGateway -> SupabaseClient (jei SupabaseGateway yra)

---

## ✅ **REIKALINGI PATAISYMAI:**

1. ❌ `IInvenotry Repository` → ✅ `IInventoryRepository`
2. ❌ `ICategory Repository` → ✅ `ICategoryRepository`
3. ❌ `IDeals Repository` → ✅ `IDealsRepository`
4. ❌ `FoodSubs titudeController` → ✅ `FoodSubstituteController`
5. ❌ `GemeniServiceBoundary` → ✅ `GeminiServiceBoundary` (arba pašalinti, jei ne MVP)
6. ⚠️ Patikrinti, ar visi repositories turi `<<interface>>` stereotype
7. ⚠️ Patikrinti, ar External Services turi tik 3 MVP boundaries

---

## ✅ **GALUTINĖ IŠVADA:**

**Pagrindinės problemos:**
- Rašybos klaidos pavadinimuose (tarpai, neteisingi žodžiai)
- External Services - ar tik MVP (3) ar visi (6)?
- SupabaseClient ir SupabaseGateway - ar rodyti ar implikuoti?

**Pataisykite rašybos klaidas ir viskas bus gerai!** ✅


























