# 📋 Sequence Diagram "Valdyti produktus" - Paaiškinimas

## ✅ **Sukurta Sequence Diagrama:**

`docs/diagrams/sequence/manage_products.puml`

---

## 📊 **Diagramos Struktūra:**

### **Participants (Dalyviai):**

#### **Actor:**
- `Šeimos narys` - vartotojas

#### **UI Boundaries (Langai):**
- `InventoryPage` - Inventoriaus langas
- `ProductDetailsPage` - Produkto detalės langas
- `AddProductPage` - Produkto pridėjimo langas

#### **Controllers:**
- `RouterController` - Navigacija tarp langų
- `InventoryController` - Inventoriaus valdymas
- `ProductController` - Produkto operacijos
- `ProductScanController` - Produkto skenavimas (barcode, OCR)

#### **Entities:**
- `InventoryEntity` - Inventorius
- `ProductEntity` - Produktas

#### **Service Boundaries:**
- `MobileScannerBoundary` - Barkodo skaitytuvas
- `CameraGalleryBoundary` - Kamera / Galerija
- `OpenFoodFactsServiceBoundary` - Open Food Facts API
- `OCRServiceBoundary` - ML Kit OCR
- `GeminiServiceBoundary` - Gemini API

#### **External APIs:**
- `Open Food Facts API` - Produktų duomenys
- `ML Kit OCR` - Teksto atpažinimas
- `Gemini API` - AI analizė

---

## 🔄 **SCENARIAI (6 pagrindiniai):**

### **1. Peržiūrėti produktus:**
```
Member → InventoryPage → RouterController → InventoryController → InventoryEntity
```

### **2. Pridėti produktą - Barcode scanning:**
```
Member → AddProductPage → ProductScanController → MobileScannerBoundary
→ OpenFoodFactsServiceBoundary → ProductController → ProductEntity → InventoryEntity
```

### **3. Pridėti produktą - Receipt/Image scanning (OCR + Gemini):**
```
Member → AddProductPage → CameraGalleryBoundary → ProductScanController
→ OCRServiceBoundary → GeminiServiceBoundary → OpenFoodFactsServiceBoundary
→ ProductController → ProductEntity → InventoryEntity
```

### **4. Pridėti produktą - Manual entry:**
```
Member → AddProductPage → ProductController → ProductEntity → InventoryEntity
```

### **5. Redaguoti produktą:**
```
Member → InventoryPage → ProductDetailsPage → AddProductPage → ProductController
→ ProductEntity → InventoryEntity (duplicate check) → InventoryEntity (update)
```

### **6. Ištrinti produktą:**
```
Member → ProductDetailsPage → ProductController → InventoryEntity → ProductEntity
```

---

## ✅ **Atitikimas Robustness Diagramai:**

### **Komponentai, kurie sutampa:**

✅ **UI Boundaries:**
- `InventoryPage`
- `ProductDetailsPage`
- `AddProductPage`

✅ **Controllers:**
- `RouterController`
- `InventoryController`
- `ProductController`
- `ProductScanController`

✅ **Entities:**
- `InventoryEntity`
- `ProductEntity`

✅ **Service Boundaries:**
- `MobileScannerBoundary`
- `CameraGalleryBoundary`
- `OpenFoodFactsServiceBoundary`
- `OCRServiceBoundary`
- `GeminiServiceBoundary`

---

## ⚠️ **Pašalinti komponentai (ne "Valdyti produktus" dalis):**

❌ **ReceiptAndBudgetController** - Tai yra atskiro use case "Skanuoti čekį" dalis, ne "Valdyti produktus"

❌ **ReceiptEntity, ReceiptLineEntity** - Tai yra čekio valdymo dalis, ne produkto valdymas

---

## 📝 **Pastabos:**

1. **Receipt scanning** yra atskiras use case, todėl neįtrauktas į šią sequence diagramą

2. **ProductScanController** naudojamas tiek barcode, tiek image/OCR skenavimui

3. **RouterController** naudojamas navigacijai tarp visų langų

4. **Budget update** nėra šio use case dalis (tai yra biudžeto valdymo dalis)

---

## ✅ **GALUTINĖ IŠVADA:**

Sequence diagrama pilnai atitinka:
- ✅ Robustness diagramą ("Valdyti produktus")
- ✅ Activity diagramą (produkto valdymo scenarijai)
- ✅ Flutter architektūros principus (BLoC pattern)

**Failas:** `docs/diagrams/sequence/manage_products.puml`


























