# "Valdyti produktus" - Pilna Robustumo diagrama - Santrauka

> **Pagrindiniai principai ir atsakymai į klausimus iš ChatGPT diskusijos**

---

## ✅ Pagrindiniai principai (pagal ChatGPT diskusiją)

### 1. RouterController navigacijai

✅ **NAUDOJAMA:** RouterController yra centrinis navigacijos taškas

- HomePage → RouterController → InventoryPage
- InventoryPage → RouterController → AddProductPage
- InventoryPage → ProductController → RouterController → ProductDetailsPage

**Kodėl:** Boundary niekada nekalba tiesiai su kitu boundary - visada per control (RouterController).

---

### 2. Inventory + Product santykis

✅ **NAUDOJAMA:** Dvi atskiros klasės su kompozicija

```
Inventory *-- "0..*" Product : sudarytas iš
```

**Paaiškinimas:**
- `Inventory` - inventoriaus klasė (produktų sąrašas)
- `Product` - produkto klasė
- Kompozicija: Inventory sudarytas iš 0..* Product objektų

---

### 3. Controller'iai gali kalbėtis tarpusavyje

✅ **NAUDOJAMA:** Control → Control ryšiai

- ProductScanController → ProductController
- ProductScanController → ReceiptBudgetController
- InventoryController gali kreiptis į ProductController (bet šioje diagramoje naudojame tiesioginį ryšį per InventoryPage)

**Paaiškinimas:** Pagal BCE/ICONIX taisykles - "Verbs can talk to other verbs" (controlleriai gali kalbėtis su kitais controlleriais).

---

### 4. Supabase NĖRA boundary

✅ **TAIP:** Supabase nėra parodytas kaip boundary

**Kodėl:** Supabase yra mūsų sistemos dalis (duomenų bazė), ne išorinė sistema. Entity objektai tiesiog saugomi Supabase - tai implementacijos detalė.

**Kaip rodome duomenis:** Per Entity objektus (Inventory, Product, Receipt, ir t.t.).

---

### 5. Service Boundaries - tik išorinės sistemos

✅ **NAUDOJAMA:** Tik išoriniai servisai kaip boundary

- OcrServiceBoundary (ML Kit OCR)
- GeminiServiceBoundary (Gemini API)
- OpenFoodFactsServiceBoundary (Open Food Facts API)
- CameraGalleryBoundary (OS kamera/galerija)

**Kodėl:** Tai yra išorinės sistemos, su kuriomis bendraujame per adapterius/boundary objektus.

---

### 6. UML'e naudojame "Controller", ne "Bloc"

✅ **NAUDOJAMA:** Controller stereotipas UML'e

- RouterController, InventoryController, ProductController, ir t.t.

**Paaiškinimas:**
- UML'e: "Controller" stereotipas (analizės/dizaino lygmuo)
- Flutter kode: BLoC klasės (InventoryBloc, ProductBloc, ir t.t.)

---

## 📊 Komponentų suskirstymas

### Actor (1)
- Šeimos narys

### UI Boundaries (7)
- HomePage
- InventoryPage
- ProductDetailsPage
- AddProductPage
- ReceiptAndBudgetPage
- DealsPage
- PermissionDialog

### Service Boundaries (4)
- CameraGalleryBoundary
- OcrServiceBoundary
- GeminiServiceBoundary
- OpenFoodFactsServiceBoundary

### Controllers (6)
- RouterController (navigacija)
- InventoryController (inventorius)
- ProductController (produktas)
- ProductScanController (skenavimas)
- ReceiptBudgetController (kvitas/biudžetas)
- DealsController (akcijos)

### Entities (8)
- Inventory
- Product
- Receipt
- ReceiptLine
- Budget
- Deal
- Store
- NutritionInfo

**IŠ VISO: 26 komponentai**

---

## 🔄 Pagrindiniai srautai (mapavimas į activity diagramą)

### Peržiūrėti produktus
```
User → HomePage → RouterController → InventoryPage → InventoryController → Inventory/Product
```

### Pridėti produktą rankiniu būdu
```
User → AddProductPage → ProductController → Product → Inventory
```

### Pridėti produktą pagal barkodą
```
User → AddProductPage → ProductScanController → CameraGalleryBoundary → OpenFoodFactsBoundary → Product
```

### Pridėti produktą iš nuotraukos (OCR + Gemini)
```
User → AddProductPage → ProductScanController → 
  CameraGalleryBoundary → 
  OcrServiceBoundary → 
  GeminiServiceBoundary → 
  OpenFoodFactsBoundary → 
  Product, NutritionInfo
```

### Skenuoti kvitą
```
User → ReceiptAndBudgetPage → ProductScanController → 
  (OCR + Gemini + OFF) → 
  ReceiptBudgetController → 
  Receipt, ReceiptLine, Inventory, Budget
```

### Redaguoti produktą
```
User → ProductDetailsPage → ProductController → Product → Inventory
```

### Ištrinti produktą
```
User → ProductDetailsPage → ProductController → Product → Inventory → RouterController → InventoryPage
```

### Peržiūrėti akcijas
```
User → ProductDetailsPage → RouterController → DealsPage → DealsController → Deal, Store, Product
```

---

## 🎯 Atsakymai į ChatGPT klausimus

### Q: "Ar InventoryController gali pasiekti ProductController?"
**A:** ✅ TAIP - controlleriai gali kalbėtis tarpusavyje (Control → Control)

### Q: "Kaip iš InventoryPage pasiekti ProductDetailsPage?"
**A:** ✅ Per ProductController → RouterController → ProductDetailsPage

### Q: "Ar Inventory = Product?"
**A:** ❌ NE - tai dvi atskiros klasės: Inventory sudarytas iš Product objektų (kompozicija)

### Q: "Ar Supabase yra boundary?"
**A:** ❌ NE - Supabase yra mūsų sistemos dalis (DB), ne išorinė sistema

### Q: "Kodėl API yra boundary?"
**A:** ✅ Nes tai išorinės sistemos - naudojame adapterius (OcrServiceBoundary, GeminiServiceBoundary, ir t.t.)

---

## 📁 Failai

1. **`manage_products_PILNA.puml`** - Pilna PlantUML diagrama
2. **`manage_products_PILNA_aprasymas.md`** - Detalus komponentų aprašymas
3. **`manage_products_PILNA_SUMMA.md`** - Šis failas (santrauka)

---

## ✅ Patvirtinimas

Ši diagrama:
- ✅ Naudoja RouterController navigacijai
- ✅ Turi Inventory ir Product kaip atskiras klasės su kompozicija
- ✅ Supabase nėra boundary
- ✅ Visi API servisai kaip Service Boundaries
- ✅ Controlleriai gali kalbėtis tarpusavyje
- ✅ Laikosi BCE/ICONIX taisyklių
- ✅ Atspindi visą activity diagramos logiką

**Ši diagrama yra logiška ir gali būti naudojama kaip pagrindas implementacijai!**



























