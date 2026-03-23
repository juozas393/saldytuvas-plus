# 🔍 External Services Check - Kurie Tikrai Naudojami?

## ❓ **Klausimas:**

Tikrai naudosime VISUS šiuos External Services?

1. `CameraGalleryBoundary` - Kamera / Galerija
2. `GeminiServiceBoundary` - Gemini API
3. `OCRServiceBoundary` - OCR servisas
4. `OpenFoodFactsServiceBoundary` - Open Food Facts API
5. `SpoonacularServiceBoundary` - Spoonacular API
6. `MobileScannerBoundary` - Barcode skaitymas

---

## 📊 **PALYGINIMAS: MVP vs Pilna Versija**

### **MVP VERSIJA (Realistiška dabar):**

| Boundary | Naudojamas? | Kodėl? |
|----------|-------------|--------|
| ✅ `CameraGalleryBoundary` | ✅ Taip | Nuotraukų gavimas (čekiai, produktai) |
| ✅ `MobileScannerBoundary` | ✅ Taip | Barcode skaitymas |
| ✅ `OpenFoodFactsServiceBoundary` | ✅ Taip | Produktų duomenys (nemokamas API) |
| ❌ `GeminiServiceBoundary` | ❌ Ne MVP | AI features (brangus, sudėtingas) |
| ❌ `OCRServiceBoundary` | ❌ Ne MVP | OCR features (sudėtingas, daug edge case'ų) |
| ❌ `SpoonacularServiceBoundary` | ❌ Ne MVP | Mokamas API, meal planning |

---

### **PILNA VERSIJA (Ateities planai):**

| Boundary | Naudojamas? | Kodėl? |
|----------|-------------|--------|
| ✅ `CameraGalleryBoundary` | ✅ Taip | Nuotraukų gavimas |
| ✅ `MobileScannerBoundary` | ✅ Taip | Barcode skaitymas |
| ✅ `OpenFoodFactsServiceBoundary` | ✅ Taip | Produktų duomenys |
| ✅ `GeminiServiceBoundary` | ✅ Taip (po MVP) | AI meal planning, receipt parsing |
| ✅ `OCRServiceBoundary` | ✅ Taip (po MVP) | Čekių tekstų atpažinimas |
| ✅ `SpoonacularServiceBoundary` | ✅ Taip (po MVP) | Receptų gavimas |

---

## ✅ **DU VARIANTUS:**

### **Variantas 1: MVP Tik (Realistiška dabar)**

**Palikti:**
- ✅ `CameraGalleryBoundary`
- ✅ `MobileScannerBoundary`
- ✅ `OpenFoodFactsServiceBoundary`

**Pašalinti:**
- ❌ `GeminiServiceBoundary` (po MVP)
- ❌ `OCRServiceBoundary` (po MVP)
- ❌ `SpoonacularServiceBoundary` (po MVP)

---

### **Variantas 2: Pilna Versija (Planuojama ateityje)**

**Palikti visus 6:**
- ✅ `CameraGalleryBoundary`
- ✅ `MobileScannerBoundary`
- ✅ `OpenFoodFactsServiceBoundary`
- ✅ `GeminiServiceBoundary` (planuojamas)
- ✅ `OCRServiceBoundary` (planuojamas)
- ✅ `SpoonacularServiceBoundary` (planuojamas)

---

## 🎯 **REKOMENDACIJA:**

### **Jei diagrama rodo VISĄ SISTEMĄ (ne tik MVP):**

**Palikti VISUS 6** - diagrama rodo pilną architektūrą! ✅

### **Jei diagrama rodo TIK MVP:**

**Palikti tik 3:**
- ✅ `CameraGalleryBoundary`
- ✅ `MobileScannerBoundary`
- ✅ `OpenFoodFactsServiceBoundary`

---

## ❓ **KLAUSIMAS JŪSŲ:**

**Kuris variantas?**

1. **Pilna versija** - visi 6 (planuojama ateityje)
2. **MVP tik** - tik 3 (realistiška dabar)


























