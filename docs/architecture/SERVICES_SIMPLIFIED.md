# ✅ Services Paketas - Supaprastinta Versija

## 🔍 **ANALIZĖ:**

Pagal `REALISTIC_BOUNDARIES.md`, MVP versijoje turėtų būti tik **2 Services**, bet diagramoje yra **15!**

---

## ✅ **MVP SERVICES (Tik 2):**

1. ✅ **BarcodeScannerService**
   - Naudoja: `MobileScannerBoundary` + `OpenFoodFactsServiceBoundary`
   - Funkcija: Koordinuoja barcode scanning

2. ✅ **OpenFoodFactsService**
   - Naudoja: `OpenFoodFactsServiceBoundary`
   - Funkcija: Produktų duomenų gavimas

---

## ❌ **NE MVP (Pašalinti arba palikti su pastaba):**

- ❌ `MealPlanningService` - reikia AI
- ❌ `ReceiptParsingService` - reikia OCR + AI
- ❌ `FoodRecognitionService` - reikia AI
- ❌ `OCRService` - sudėtingas
- ❌ `GeminiService` - brangus
- ❌ `SpoonacularService` - mokamas
- ❌ `ImageProcessingService` - reikia OCR
- ❌ `ShoppingListService` - galbūt MVP (bet gali būti simple)
- ❌ `NutritionService` - galbūt MVP (bet gali būti simple)
- ❌ `HealthScoreService` - ne MVP
- ❌ `DealsScraperService` - automatinis (ne controller)
- ❌ `NotificationService` - automatinis (ne controller)
- ❌ `ProductMatchingService` - ne MVP

---

## 🎯 **DU VARIANTUS:**

### **Variantas 1: Tik MVP (Realistiška dabar)**

**Palikti tik:**
- `BarcodeScannerService`
- `OpenFoodFactsService`

**Pašalinti:** Visus kitus (13 services)

---

### **Variantas 2: Su Pastabomis (Pilna architektūra)**

**Palikti visus, bet pridėti pastabą:**

```
Services
├── MVP Services (2):
│   ├── BarcodeScannerService
│   └── OpenFoodFactsService
│
└── Po MVP Services (13):
    ├── MealPlanningService
    ├── ReceiptParsingService
    ├── ... (visi kiti)
```

---

## ✅ **REKOMENDACIJA:**

**Jei diagrama rodo PILNĄ architektūrą:**

**Palikti visus 15 services, bet pridėti pastabą apie MVP!**

---

## 📊 **GALUTINĖ STRUKTŪRA:**

```
Services
├── BarcodeScannerService (MVP)
├── OpenFoodFactsService (MVP)
├── ShoppingListService (galbūt MVP)
├── NotificationService (automatinis)
├── MealPlanningService (po MVP)
├── ReceiptParsingService (po MVP)
├── ... (kiti po MVP)
```

**Arba supaprastinta:**
```
Services
├── MVP Services (2-3)
└── Po MVP Services (12-13)
```


























