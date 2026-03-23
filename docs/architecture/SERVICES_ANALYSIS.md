# 🔍 Services Paketas - Ar Nėra Per Daug?

## ❓ **KLausimas:**

Iš kur ištraukti visus Services? Neužtenka External Services? Ar nėra dublikatų?

---

## 📊 **PALYGINIMAS:**

### **ExternalServices (Boundaries):**

```
ExternalServices
├── CameraGalleryBoundary ← įrenginio interface
├── MobileScannerBoundary ← įrenginio interface
└── OpenFoodFactsServiceBoundary ← API interface
```

### **Services (Business Logic):**

```
Services (15 services!)
├── BarcodeScannerService ← koordinuoja MobileScannerBoundary + OpenFoodFactsServiceBoundary
├── OpenFoodFactsService ← wrapper OpenFoodFactsServiceBoundary
├── GeminiService ← wrapper (ne MVP)
├── OCRService ← logika (ne MVP)
├── SpoonacularService ← wrapper (ne MVP)
├── MealPlanningService ← koordinuoja kelis servisus
├── ReceiptParsingService ← koordinuoja OCR + Gemini
├── ImageProcessingService ← vaizdo apdorojimas
├── FoodRecognitionService ← koordinuoja Gemini + Image
├── ShoppingListService ← verslo logika
├── NutritionService ← skaičiavimai
├── HealthScoreService ← skaičiavimai
├── DealsScraperService ← scraping logika
├── NotificationService ← pranešimai
└── ProductMatchingService ← matching logika
```

---

## ✅ **SKIRTUMAS:**

### **ExternalServices = Boundaries (Adapters):**
- **Tiesioginis interface** su išoriniu API/įrenginiu
- Pvz.: `OpenFoodFactsServiceBoundary` - tiesioginis HTTP kvietimas

### **Services = Business Logic (Coordinators):**
- **Verslo logika** + koordinacija
- Pvz.: `OpenFoodFactsService` - wrapper + error handling + caching

---

## 🔍 **PROBLEMA:**

**Yra dublikatai ir per daug Services MVP!**

---

## ✅ **MVP SERVICES (Tik Reikalingi):**

### **Tik MVP Services:**

1. ✅ **BarcodeScannerService**
   - Naudoja: `MobileScannerBoundary` + `OpenFoodFactsServiceBoundary`
   - Funkcija: Koordinuoja barcode scanning

2. ✅ **OpenFoodFactsService** (arba galima integruoti į BarcodeScannerService?)
   - Naudoja: `OpenFoodFactsServiceBoundary`
   - Funkcija: Wrapper + error handling

3. ✅ **ShoppingListService**
   - Naudoja: `IInventoryRepository` (Supabase)
   - Funkcija: Pirkinių sąrašo generavimas

4. ✅ **NotificationService**
   - Naudoja: Supabase (push notifications)
   - Funkcija: Įspėjimų siuntimas

---

### **Ne MVP (Pašalinti arba palikti su pastaba):**

- ❌ `GeminiService` - ne MVP
- ❌ `OCRService` - ne MVP
- ❌ `SpoonacularService` - ne MVP
- ❌ `MealPlanningService` - ne MVP (reikia AI)
- ❌ `ReceiptParsingService` - ne MVP (reikia OCR)
- ❌ `ImageProcessingService` - ne MVP (reikia OCR)
- ❌ `FoodRecognitionService` - ne MVP (reikia AI)
- ❌ `NutritionService` - galbūt MVP (bet gali būti simple calculations)
- ❌ `HealthScoreService` - ne MVP
- ❌ `DealsScraperService` - automatinis (ne controller)
- ❌ `ProductMatchingService` - ne MVP

---

## 🎯 **REKOMENDACIJA:**

### **Variantas 1: Supaprastinta MVP**

**Palikti tik MVP Services:**
- `BarcodeScannerService`
- `ShoppingListService`
- `NotificationService`

**Arba galima `OpenFoodFactsService` integruoti į `BarcodeScannerService`?**

---

### **Variantas 2: Su Pastabomis**

**Palikti visus, bet pažymėti:**
- MVP: 3-4 services
- Po MVP: 11-12 services

---

## ✅ **IŠVADA:**

**Yra per daug Services MVP versijai!**

**Rekomenduojama supaprastinti iki 3-4 MVP Services!** ✅


























