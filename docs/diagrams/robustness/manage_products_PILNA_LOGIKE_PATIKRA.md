# "Valdyti produktus" - Logikos patikra

> **Išsami logikos patikra visų komponentų ir ryšių**

---

## ✅ Pagrindiniai principai (patikrinti)

### 1. BCE/ICONIX taisyklės

- ✅ **Actor → Boundary:** Vartotojas kalbasi tik su UI boundaries
- ✅ **Boundary → Control:** UI boundaries kalba tik su controlleriais
- ✅ **Control → Control:** Controlleriai gali kalbėtis tarpusavyje
- ✅ **Control → Entity:** Controlleriai manipuliuoja entity
- ✅ **Control → Service Boundary:** Controlleriai kalba su išoriniais servisais
- ✅ **Entity → Entity:** Entity gali turėti ryšius (kompozicija/agregacija)
- ❌ **Boundary → Entity:** Boundary niekada nekalba tiesiogiai su entity
- ❌ **Boundary → Boundary:** Boundary nekalba tiesiogiai su kitu boundary (tik per RouterController)

---

## 📊 Komponentų logika

### UI Boundaries (Langai)

#### HomePage
- ✅ Kalbasi su: User (actor), RouterController
- ✅ Funkcijos: Navigacija į kitus langus

#### InventoryPage
- ✅ Kalbasi su: User, InventoryController, RouterController, ProductController
- ✅ Funkcijos: Rodo produktų sąrašą, naviguoja į pridėjimą

#### ProductDetailsPage
- ✅ Kalbasi su: User, ProductController, RouterController
- ✅ Funkcijos: Rodo produkto detalės, redagavimas, trynimas

#### AddProductPage
- ✅ Kalbasi su: User, ProductController, ProductScanController
- ✅ Funkcijos: Pridėti produktą (ranka arba skenuojant)

#### ReceiptAndBudgetPage
- ✅ Kalbasi su: User, ProductScanController, ReceiptBudgetController
- ✅ Funkcijos: Skenuoti čekį, patvirtinti produktus

#### DealsPage
- ✅ Kalbasi su: User, DealsController
- ✅ Funkcijos: Rodo akcijas

#### PermissionDialog
- ✅ Kalbasi su: User, ProductScanController
- ✅ Funkcijos: Leidimų suteikimas

---

### Controllers (Verslo logika)

#### RouterController
- ✅ Kalbasi su: Visi UI boundaries (HomePage, InventoryPage, ProductDetailsPage, AddProductPage, ReceiptBudgetPage, DealsPage), ProductController
- ✅ Funkcijos: Navigacija tarp langų
- ✅ **SVARBU:** Centrinis navigacijos taškas - visos navigacijos eina per jį

#### InventoryController
- ✅ Kalbasi su: InventoryPage, InventoryEntity, ProductEntity
- ✅ Funkcijos: Užkrauti inventorių, filtruoti produktus
- ⚠️ **PASTABA:** Gali kalbėtis su ProductController, bet šioje diagramoje naudojame tiesioginį ryšį per InventoryPage

#### ProductController
- ✅ Kalbasi su: InventoryPage, ProductDetailsPage, AddProductPage, ProductScanController, RouterController, ProductEntity, InventoryEntity
- ✅ Funkcijos: CRUD operacijos su produktu
- ✅ **SVARBU:** Valdo vieno produkto operacijas

#### ProductScanController
- ✅ Kalbasi su: AddProductPage, ReceiptBudgetPage, PermissionDialog, CameraGalleryBoundary, OcrServiceBoundary, GeminiServiceBoundary, OpenFoodFactsBoundary, ProductEntity, ReceiptLineEntity, NutritionEntity, ProductController, ReceiptBudgetController
- ✅ Funkcijos: Visas skenavimo pipeline (OCR + Gemini + OFF)
- ✅ **SVARBU:** Centrinis skenavimo koordinatorius

#### ReceiptBudgetController
- ✅ Kalbasi su: ReceiptBudgetPage, ProductScanController, ReceiptEntity, ReceiptLineEntity, InventoryEntity, BudgetEntity
- ✅ Funkcijos: Kvito ir biudžeto valdymas

#### DealsController
- ✅ Kalbasi su: DealsPage, DealEntity, StoreEntity, ProductEntity
- ✅ Funkcijos: Akcijų paieška

---

### Service Boundaries (Išorinės sistemos)

#### CameraGalleryBoundary
- ✅ Kalbasi su: ProductScanController
- ✅ Funkcijos: Kamera, galerija, barkodo skaitymas
- ✅ **SVARBU:** Grąžina nuotrauką/barkodą į ProductScanController

#### OcrServiceBoundary
- ✅ Kalbasi su: ProductScanController
- ✅ Funkcijos: OCR procesas, teksto atpažinimas
- ✅ **SVARBU:** Grąžina OCR rezultatą į ProductScanController

#### GeminiServiceBoundary
- ✅ Kalbasi su: ProductScanController
- ✅ Funkcijos: AI analizė (nuotrauka/tekstas)
- ✅ **SVARBU:** Grąžina analizės rezultatą į ProductScanController

#### OpenFoodFactsServiceBoundary
- ✅ Kalbasi su: ProductScanController
- ✅ Funkcijos: Produkto duomenų paieška
- ✅ **SVARBU:** Grąžina produkto duomenis į ProductScanController

---

### Entities (Duomenys)

#### Inventory
- ✅ Ryšiai: *-- Product (kompozicija 0..*)
- ✅ Kalbasi su: InventoryController, ProductController, ReceiptBudgetController
- ✅ Funkcijos: Saugoti produktų sąrašą

#### Product
- ✅ Ryšiai: ← Inventory (kompozicija), ← ReceiptLine, ← Deal
- ✅ Kalbasi su: InventoryController, ProductController, ProductScanController, DealsController
- ✅ Funkcijos: Produkto duomenys

#### Receipt
- ✅ Ryšiai: *-- ReceiptLine (kompozicija 0..*)
- ✅ Kalbasi su: ReceiptBudgetController
- ✅ Funkcijos: Čekio antraštė

#### ReceiptLine
- ✅ Ryšiai: ← Receipt (kompozicija), → Product
- ✅ Kalbasi su: ReceiptBudgetController, ProductScanController
- ✅ Funkcijos: Čekio eilutė

#### Budget
- ✅ Kalbasi su: ReceiptBudgetController
- ✅ Funkcijos: Biudžeto būsena

#### Deal
- ✅ Ryšiai: → Product, → Store
- ✅ Kalbasi su: DealsController
- ✅ Funkcijos: Akcijos informacija

#### Store
- ✅ Ryšiai: ← Deal
- ✅ Kalbasi su: DealsController
- ✅ Funkcijos: Parduotuvės informacija

#### NutritionInfo
- ✅ Kalbasi su: ProductScanController
- ✅ Funkcijos: Maistinė informacija

---

## 🔄 Srautų logika

### 1. Peržiūrėti produktus

```
✅ User → HomePage → RouterController → InventoryPage → InventoryController → Inventory/Product → InventoryPage → User
```

**Patikrinta:**
- ✅ Boundary → Control (HomePage → RouterController)
- ✅ Control → Boundary (RouterController → InventoryPage)
- ✅ Boundary → Control (InventoryPage → InventoryController)
- ✅ Control → Entity (InventoryController → Inventory/Product)
- ✅ Control → Boundary (InventoryController → InventoryPage)

---

### 2. Pridėti produktą rankiniu būdu

```
✅ User → AddProductPage → ProductController → Product → Inventory → ProductController → RouterController → InventoryPage → User
```

**Patikrinta:**
- ✅ Boundary → Control (AddProductPage → ProductController)
- ✅ Control → Entity (ProductController → Product → Inventory)
- ✅ Control → Control (ProductController → RouterController)
- ✅ Control → Boundary (RouterController → InventoryPage)

---

### 3. Pridėti produktą pagal barkodą

```
✅ User → AddProductPage → ProductScanController → CameraGalleryBoundary → ProductScanController → OpenFoodFactsBoundary → ProductScanController → ProductController → Product → Inventory
```

**Patikrinta:**
- ✅ Boundary → Control (AddProductPage → ProductScanController)
- ✅ Control → Service Boundary (ProductScanController → CameraGalleryBoundary → ProductScanController)
- ✅ Control → Service Boundary (ProductScanController → OpenFoodFactsBoundary → ProductScanController)
- ✅ Control → Control (ProductScanController → ProductController)
- ✅ Control → Entity (ProductController → Product → Inventory)

---

### 4. Pridėti produktą iš nuotraukos (OCR + Gemini)

```
✅ User → AddProductPage → ProductScanController → PermissionDialog → ProductScanController → CameraGalleryBoundary → ProductScanController → OcrServiceBoundary → ProductScanController → GeminiServiceBoundary → ProductScanController → OpenFoodFactsBoundary → ProductScanController → Product, NutritionInfo → ProductController → Inventory
```

**Patikrinta:**
- ✅ Visi Service Boundaries grąžina duomenis į ProductScanController
- ✅ ProductScanController koordinuoja visą pipeline'ą
- ✅ ProductScanController → ProductController (control → control)

---

### 5. Skenuoti kvitą

```
✅ User → ReceiptBudgetPage → ProductScanController → (OCR + Gemini + OFF) → ReceiptBudgetController → Receipt, ReceiptLine, Inventory, Budget → ReceiptBudgetPage → User
```

**Patikrinta:**
- ✅ Boundary → Control (ReceiptBudgetPage → ProductScanController)
- ✅ Control → Control (ProductScanController → ReceiptBudgetController)
- ✅ Control → Entity (ReceiptBudgetController → Receipt, ReceiptLine, Inventory, Budget)

---

### 6. Redaguoti produktą

```
✅ User → InventoryPage → ProductController → Product → RouterController → ProductDetailsPage → User
User → ProductDetailsPage → ProductController → Product → Inventory → ProductController → ProductDetailsPage → User
```

**Patikrinta:**
- ✅ Boundary → Control (InventoryPage → ProductController)
- ✅ Control → Entity (ProductController → Product)
- ✅ Control → Control (ProductController → RouterController)
- ✅ Control → Boundary (RouterController → ProductDetailsPage)
- ✅ Boundary → Control (ProductDetailsPage → ProductController)
- ✅ Control → Entity (ProductController → Product → Inventory)

---

### 7. Ištrinti produktą

```
✅ User → ProductDetailsPage → ProductController → Product → Inventory → ProductController → RouterController → InventoryPage → User
```

**Patikrinta:**
- ✅ Boundary → Control (ProductDetailsPage → ProductController)
- ✅ Control → Entity (ProductController → Product → Inventory)
- ✅ Control → Control (ProductController → RouterController)
- ✅ Control → Boundary (RouterController → InventoryPage)

---

### 8. Peržiūrėti akcijas

```
✅ User → ProductDetailsPage → RouterController → DealsPage → DealsController → Deal, Store, Product → DealsPage → User
```

**Patikrinta:**
- ✅ Boundary → Control (ProductDetailsPage → RouterController)
- ✅ Control → Boundary (RouterController → DealsPage)
- ✅ Boundary → Control (DealsPage → DealsController)
- ✅ Control → Entity (DealsController → Deal, Store, Product)
- ✅ Control → Boundary (DealsController → DealsPage)

---

## ⚠️ Potencialūs problemos ir sprendimai

### 1. Trūkstami grįžtami ryšiai

**Problema:** Kai kurie controlleriai neturi aiškių grįžtamųjų ryšių su UI boundaries.

**Sprendimas:** ✅ Pataisyta - pridėti grįžtami ryšiai:
- ProductController → ProductDetailsPage (atnaujintas produktas)
- ProductController → AddProductPage (produktas išsaugotas)
- DealsController → DealsPage (akcijos)
- ReceiptBudgetController → ReceiptBudgetPage (biudžetas)

---

### 2. Service Boundaries grįžtami ryšiai

**Problema:** Service Boundaries turėtų grąžinti duomenis į controllerius.

**Sprendimas:** ✅ Pataisyta - pridėti grįžtami ryšiai:
- CameraGalleryBoundary → ProductScanController
- OcrServiceBoundary → ProductScanController
- GeminiServiceBoundary → ProductScanController
- OpenFoodFactsBoundary → ProductScanController

---

### 3. ProductScanController → UI boundaries

**Problema:** ProductScanController turėtų grąžinti rezultatus į UI boundaries.

**Sprendimas:** ✅ Pataisyta - pridėti ryšiai:
- ProductScanController → AddProductPage
- ProductScanController → ReceiptBudgetPage

---

### 4. DealsController navigacija

**Problema:** Akcijų paieška turėtų eiti per RouterController.

**Sprendimas:** ✅ Pataisyta - ProductDetailsPage → RouterController → DealsPage → DealsController

---

## ✅ Galutinė patikra

### Visi reikalavimai įvykdyti:

- ✅ RouterController naudojamas visoms navigacijoms
- ✅ Boundary niekada nekalba tiesiogiai su entity
- ✅ Boundary nekalba tiesiogiai su kitu boundary (tik per RouterController)
- ✅ Controlleriai gali kalbėtis tarpusavyje
- ✅ Service Boundaries grąžina duomenis į controllerius
- ✅ Visi grįžtami ryšiai yra apibrėžti
- ✅ Entity ryšiai (kompozicija/agregacija) yra teisingi
- ✅ Inventory sudarytas iš Product objektų

---

## 📁 Atnaujinti failai

1. **`manage_products_PILNA.puml`** - Pataisyta su visais trūkstamais ryšiais
2. **`manage_products_PILNA_LOGIKE_PATIKRA.md`** - Šis failas (logikos patikra)

---

**IŠVADA:** Diagrama dabar yra pilna ir logiška! ✅



























