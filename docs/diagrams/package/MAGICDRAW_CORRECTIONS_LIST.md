# 🔧 MagicDraw Diagram - Reikalingi Pataisymai

## ❌ **RAŠYBOS KLAIDOS:**

### **1. REPOSITORIES - Tarpai pavadinimuose:**

**MagicDraw (NETEISINGAI):**
- ❌ `IInvenotry Repository` (tarpas + klaida "Invenotry")
- ❌ `ICategory Repository` (tarpas)
- ❌ `IDeals Repository` (tarpas)

**TURI BŪTI:**
- ✅ `IInventoryRepository` (be tarpo, teisingas pavadinimas)
- ✅ `ICategoryRepository` (be tarpo)
- ✅ `IDealsRepository` (be tarpo)

**Kitas repositories - patikrinkite, ar nėra tarpų!**

---

### **2. CONTROLLER - Rašybos klaida:**

**MagicDraw (NETEISINGAI):**
- ❌ `FoodSubs titudeController` (tarpas + neteisingas pavadinimas)

**TURI BŪTI:**
- ✅ `FoodSubstituteController` (be tarpo, teisingas pavadinimas)

---

### **3. EXTERNAL SERVICES - Rašybos klaida:**

**MagicDraw (NETEISINGAI):**
- ❌ `GemeniServiceBoundary` (rašybos klaida)

**TURI BŪTI:**
- ✅ `GeminiServiceBoundary` (teisingas pavadinimas)

---

## ⚠️ **STRUKTŪRINIAI KLAUSIMAI:**

### **4. EXTERNAL SERVICES - Kiek turėtų būti?**

**MagicDraw diagramoje:**
- CameraGalleryBoundary
- GemeniServiceBoundary (klaida)
- OCRServiceBoundary
- OpenFoodFactsServiceBoundary

**MVP turėtų būti tik 3:**
- ✅ CameraGalleryBoundary
- ✅ MobileScannerBoundary (trūksta!)
- ✅ OpenFoodFactsServiceBoundary

**Po MVP:**
- GeminiServiceBoundary
- OCRServiceBoundary
- SpoonacularServiceBoundary

**IŠVADA:** Jei MVP - turėtų būti tik 3. Jei visi - turėtų būti 6 (bet su teisingais pavadinimais).

---

### **5. CORE.NETWORK:**

**MagicDraw diagramoje:**
- ✅ HttpClient

**Trūksta:**
- ⚠️ SupabaseClient (bet gali būti implikuotas)

**REKOMENDACIJA:** Galite palikti tik HttpClient, jei SupabaseClient implikuotas.

---

### **6. DATAACCESS - SupabaseGateway:**

**MagicDraw diagramoje:**
- ✅ Repositories sub-package

**Trūksta:**
- ⚠️ SupabaseGateway sub-package (bet gali būti implikuotas)

**REKOMENDACIJA:** Galite palikti, jei implikuotas per dependencies.

---

### **7. REPOSITORIES - Interface Stereotype:**

**Patikrinkite:**
- Ar visi repositories turi `<<interface>>` stereotype?
- Ar jie pažymėti kaip Interface tipo (ne Class)?

---

## ✅ **REKOMENDACIJOS:**

### **PRIORITETAS 1 (BŪTINA):**

1. ❌ `IInvenotry Repository` → ✅ `IInventoryRepository`
2. ❌ `ICategory Repository` → ✅ `ICategoryRepository`
3. ❌ `IDeals Repository` → ✅ `IDealsRepository`
4. ❌ `FoodSubs titudeController` → ✅ `FoodSubstituteController`
5. ❌ `GemeniServiceBoundary` → ✅ `GeminiServiceBoundary` (arba pašalinti, jei ne MVP)

### **PRIORITETAS 2 (PATIKRINTI):**

6. ⚠️ Patikrinkite, ar visi repositories turi `<<interface>>` stereotype
7. ⚠️ Patikrinkite External Services - ar tik 3 MVP ar visi 6?

### **PRIORITETAS 3 (PASIRINKTINIS):**

8. ⚠️ SupabaseClient Core.Network (gali būti implikuotas)
9. ⚠️ SupabaseGateway DataAccess (gali būti implikuotas)

---

## ✅ **GALUTINĖ IŠVADA:**

**Pagrindinės problemos:**
1. Rašybos klaidos (tarpai, neteisingi pavadinimai)
2. Repository pavadinimai turi būti be tarpų
3. Controller pavadinimas turi būti teisingas

**Pataisykite rašybos klaidas ir viskas bus gerai!** ✅


























