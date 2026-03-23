# ✅ MagicDraw Diagram - Pataisymų Checklist

## 🔍 **NUOTRAUKOJE APTIKTI KLAIDOS:**

---

## ❌ **1. REPOSITORIES - RAŠYBOS KLAIDOS (BŪTINA TAIYSTI):**

### **Pataisymai:**

1. ❌ `IInvenotry Repository` 
   - **Problema:** Tarpas + rašybos klaida "Invenotry"
   - ✅ **Turėtų būti:** `IInventoryRepository`
   - **Pastaba:** Be tarpo, teisingas pavadinimas

2. ❌ `ICategory Repository`
   - **Problema:** Tarpas
   - ✅ **Turėtų būti:** `ICategoryRepository`
   - **Pastaba:** Be tarpo

3. ❌ `IDeals Repository`
   - **Problema:** Tarpas
   - ✅ **Turėtų būti:** `IDealsRepository`
   - **Pastaba:** Be tarpo

**Patikrinkite visus kitus repositories - ar nėra tarpų!**

---

## ❌ **2. CONTROLLER - RAŠYBOS KLAIDA (BŪTINA TAIYSTI):**

### **Pataisymas:**

1. ❌ `FoodSubs titudeController`
   - **Problema:** Tarpas + neteisingas pavadinimas "Subs titude"
   - ✅ **Turėtų būti:** `FoodSubstituteController`
   - **Pastaba:** Be tarpo, teisingas pavadinimas "Substitute"

---

## ❌ **3. EXTERNAL SERVICES - RAŠYBOS KLAIDA (BŪTINA TAIYSTI):**

### **Pataisymas:**

1. ❌ `GemeniServiceBoundary`
   - **Problema:** Rašybos klaida "Gemeni"
   - ✅ **Turėtų būti:** `GeminiServiceBoundary`
   - **Pastaba:** Teisingas pavadinimas "Gemini"

---

## ⚠️ **4. EXTERNAL SERVICES - STRUKTŪRA:**

### **Dabar nuotraukoje:**
- CameraGalleryBoundary ✅
- GemeniServiceBoundary ❌ (rašybos klaida)
- OCRServiceBoundary ✅
- OpenFoodFactsServiceBoundary ✅

### **Klausimas:**

**MVP versija (tik 3):**
- ✅ CameraGalleryBoundary
- ✅ MobileScannerBoundary (trūksta nuotraukoje!)
- ✅ OpenFoodFactsServiceBoundary

**Pilna versija (6):**
- ✅ CameraGalleryBoundary
- ✅ MobileScannerBoundary
- ✅ OpenFoodFactsServiceBoundary
- ✅ GeminiServiceBoundary (pataisytas pavadinimas)
- ✅ OCRServiceBoundary
- ✅ SpoonacularServiceBoundary

**REKOMENDACIJA:** Jei MVP - palikite tik 3. Jei pilna versija - visus 6 su teisingais pavadinimais.

---

## ⚠️ **5. REPOSITORIES - INTERFACE STEREOTYPE:**

### **Patikrinkite:**
- Ar visi repositories turi `<<interface>>` stereotype?
- Ar jie sukurti kaip **Interface** tipo (ne Class)?

**Mūsų PlantUML faile:**
```
[IInventoryRepository <<interface>>]
[IReceiptRepository <<interface>>]
...
```

**MagicDraw turėtų būti:**
- Type: **Interface**
- Stereotype: `<<interface>>`

---

## ⚠️ **6. CORE.NETWORK - SupabaseClient:**

### **Dabar nuotraukoje:**
- ✅ HttpClient

### **Klausimas:**
- Trūksta SupabaseClient

**REKOMENDACIJA:** 
- Galite palikti tik HttpClient, jei SupabaseClient implikuotas per dependencies
- Arba pridėkite SupabaseClient į Core.Network

---

## ⚠️ **7. DATAACCESS - SupabaseGateway:**

### **Dabar nuotraukoje:**
- ✅ Repositories sub-package

### **Klausimas:**
- Trūksta SupabaseGateway sub-package

**REKOMENDACIJA:**
- Galite palikti, jei SupabaseGateway implikuotas per dependencies
- Arba pridėkite SupabaseGateway sub-package į DataAccess

---

## ✅ **PRIORITETŲ SĄRAŠAS:**

### **🔴 PRIORITETAS 1 - BŪTINA (Rašybos klaidos):**

1. ✅ `IInvenotry Repository` → `IInventoryRepository`
2. ✅ `ICategory Repository` → `ICategoryRepository`
3. ✅ `IDeals Repository` → `IDealsRepository`
4. ✅ `FoodSubs titudeController` → `FoodSubstituteController`
5. ✅ `GemeniServiceBoundary` → `GeminiServiceBoundary` (arba pašalinti, jei MVP)

### **🟡 PRIORITETAS 2 - PATIKRINTI:**

6. ⚠️ Patikrinti, ar visi repositories turi `<<interface>>` stereotype
7. ⚠️ Nuspręsti - MVP (3) ar Pilna versija (6) External Services
8. ⚠️ Patikrinti, ar trūksta MobileScannerBoundary

### **🟢 PRIORITETAS 3 - PASIRINKTINIS:**

9. ⚠️ SupabaseClient Core.Network (gali būti implikuotas)
10. ⚠️ SupabaseGateway DataAccess (gali būti implikuotas)

---

## ✅ **GALUTINĖ IŠVADA:**

**Pagrindinės problemos:**
- ✅ Rašybos klaidos (tarpai, neteisingi pavadinimai)
- ✅ Repository pavadinimai turi būti be tarpų
- ✅ Controller pavadinimas turi būti teisingas
- ✅ External Services rašybos klaida

**Pataisykite rašybos klaidas ir viskas bus gerai!** ✅


























