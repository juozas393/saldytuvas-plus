# 🔍 External Services - Kurie Tikrai Naudojami?

## 📊 **SITUACIJA:**

Jūsų diagramoje yra **6 External Services**, bet MVP versijoje naudojami tik **3**:

---

## ✅ **OPTION 1: MVP Tik (Realistiška dabar)**

**Palikti tik:**
1. ✅ `CameraGalleryBoundary` - Nuotraukų gavimas (reikalingas)
2. ✅ `MobileScannerBoundary` - Barcode skaitymas (reikalingas)
3. ✅ `OpenFoodFactsServiceBoundary` - Produktų duomenys (reikalingas)

**Pašalinti:**
4. ❌ `GeminiServiceBoundary` - Ne MVP (brangus, sudėtingas)
5. ❌ `OCRServiceBoundary` - Ne MVP (sudėtingas, daug edge case'ų)
6. ❌ `SpoonacularServiceBoundary` - Ne MVP (mokamas API)

---

## ✅ **OPTION 2: Pilna Architektūra (Su planuojamais)**

**Palikti visus 6:**
1. ✅ `CameraGalleryBoundary` - Nuotraukų gavimas
2. ✅ `MobileScannerBoundary` - Barcode skaitymas
3. ✅ `OpenFoodFactsServiceBoundary` - Produktų duomenys
4. ✅ `GeminiServiceBoundary` - AI features (planuojamas)
5. ✅ `OCRServiceBoundary` - OCR features (planuojamas)
6. ✅ `SpoonacularServiceBoundary` - Meal planning (planuojamas)

---

## 🎯 **REKOMENDACIJA:**

### **Jei diagrama rodo PILNĄ architektūrą (ne tik MVP):**

**Palikti VISUS 6** ✅

### **Jei diagrama rodo TIK MVP:**

**Palikti tik 3** ✅

---

## ❓ **KLAUSIMAS:**

**Kuris variantas?**

1. **MVP tik** - tik 3 (realistiška dabar)
2. **Pilna architektūra** - visi 6 (planuojama ateityje)


























