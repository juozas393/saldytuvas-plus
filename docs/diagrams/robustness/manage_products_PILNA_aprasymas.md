# "Valdyti produktus" - Pilna Robustumo diagrama - Aprašymas

> **Pilna robustumo diagrama, kuri atspindi visą activity diagramos logiką**

---

## 📋 Diagramos struktūra

### Komponentų skaičius

| Tipas | Kiekis | Pavyzdžiai |
|-------|--------|-----------|
| **Actor** | 1 | Šeimos narys |
| **UI Boundaries** | 7 | HomePage, InventoryPage, ProductDetailsPage, AddProductPage, ReceiptAndBudgetPage, DealsPage, PermissionDialog |
| **Service Boundaries** | 4 | CameraGalleryBoundary, OcrServiceBoundary, GeminiServiceBoundary, OpenFoodFactsServiceBoundary |
| **Controllers** | 6 | RouterController, InventoryController, ProductController, ProductScanController, ReceiptBudgetController, DealsController |
| **Entities** | 8 | Inventory, Product, Receipt, ReceiptLine, Budget, Deal, Store, NutritionInfo |
| **IŠ VISO** | **26 komponentai** | |

---

## 🎯 Komponentų aprašymas

### 1. Actor (Aktorius)

**Šeimos narys**
- Vienintelis aktorius, kuris naudoja "Valdyti produktus" use case
- Inicijuoja visus veiksmus per UI boundaries

---

### 2. UI Boundaries (Langai)

#### HomePage (Namų langas)
- **Responsibility:** Atidaryti produktų langą
- **Veiksmai:** Paspausti skiltį "Inventorius", "Skenuoti čekį"
- **Ryšiai:** → RouterController

#### InventoryPage (Inventoriaus langas)
- **Responsibility:** 
  - Pateikti produkto informaciją (sąrašą)
  - Sufiltruoti produktus (UI lygio filtravimas)
  - Pateikti klaidos/sėkmės pranešimus
- **Veiksmai:** Pasirinkti produktą, paspausti "Pridėti produktą"
- **Ryšiai:** → InventoryController, → RouterController, → ProductController

#### ProductDetailsPage (Produkto kortelės langas)
- **Responsibility:**
  - Pateikti produkto informaciją (vieno produkto detalės)
  - Pateikti redagavimo langą
  - Pateikti patvirtinimo langą
  - Pateikti sėkmės/klaidos pranešimus
- **Veiksmai:** Redaguoti, ištrinti, peržiūrėti akcijas
- **Ryšiai:** → ProductController, → RouterController

#### AddProductPage (Produkto pridėjimo langas)
- **Responsibility:**
  - Pateikti produkto pridėjimo langą
  - Pateikti gautą produktų sąrašą su patikimumo reikšmėm (po OCR + Gemini)
  - Pateikti klaidos/sėkmės pranešimus
- **Veiksmai:** Suvesti produkto informaciją, skenuoti barkodą/nuotrauką
- **Ryšiai:** → ProductController, → ProductScanController

#### ReceiptAndBudgetPage (Kvito ir biudžeto langas)
- **Responsibility:**
  - Pateikti gautą produktų sąrašą su patikimumo reikšmėm (iš čekio)
  - Pateikti biudžeto pokyčius
  - Pateikti klaidos/sėkmės pranešimus
- **Veiksmai:** Nufotografuoti čekį, patvirtinti produktus
- **Ryšiai:** → ProductScanController, → ReceiptBudgetController

#### DealsPage (Akcijų langas)
- **Responsibility:** Rodyti rastas akcijas produktui/krepšeliui
- **Veiksmai:** Peržiūrėti akcijas
- **Ryšiai:** ← DealsController

#### PermissionDialog (Leidimo suteikimo langas)
- **Responsibility:**
  - Atidaryti leidimo suteikimo langą
  - Suteikti leidimą naudotis kamera/galerija
- **Veiksmai:** Sutikti leidimui
- **Ryšiai:** ← ProductScanController

---

### 3. Service Boundaries (Išorinės sistemos)

#### CameraGalleryBoundary
- **Responsibility:**
  - Atidaryti kamerą/galeriją
  - Nufotografuoti čekį
  - Pasirinkti nuotrauką
  - Nuskaityti įkeltą failą į atmintį
- **Ryšiai:** ← ProductScanController

#### OcrServiceBoundary (ML Kit OCR)
- **Responsibility:**
  - Nuskaityti įkeltą failą į atmintį
  - Apskaičiuoti nuotraukos matmenis ir dydį
  - Apskaičiuoti reikiamą mastelį
  - Išplėsti nuotrauką
  - Pagerinti kontrastą
  - Pašalinti RGB spalvas
  - Pašalinti triukšmą
  - Konvertuoti nuotrauką atgal į failą
  - Išsaugoti apdorotą vaizdą
  - Paleisti OCR procesą
  - Gauti OCR rezultatą
  - Normalizuoti tekstą
- **Ryšiai:** ← ProductScanController

#### GeminiServiceBoundary
- **Responsibility:**
  - Analizuoti nuotrauką su Gemini
  - Analizuoti OCR tekstą
  - Gauti rezultatus
  - Pateikti rezultatus JSON formatu
- **Ryšiai:** ← ProductScanController

#### OpenFoodFactsServiceBoundary
- **Responsibility:**
  - Kurti Open Food Facts užklausą
  - Ieškoti produkto pagal barkodą
  - Ieškoti produkto pagal pavadinimą
  - Gauti produkto duomenis
- **Ryšiai:** ← ProductScanController

---

### 4. Controllers (Verslo logika)

#### RouterController
- **Responsibility:** Naviguoti tarp langų
- **Veiksmai:**
  - Home → Inventory
  - Home → ReceiptAndBudget
  - Inventory → AddProduct
  - Inventory → ProductDetails (per ProductController)
  - ProductDetails → Deals
- **Ryšiai:** ← UI Boundaries, → UI Boundaries

#### InventoryController
- **Responsibility:**
  - Atnaujinti inventoriaus duomenis
  - Sufiltruoti produktus
  - Užkrauti produktų sąrašą
- **Veiksmai:** Užkrauti inventorių, filtruoti
- **Ryšiai:** ← InventoryPage, → InventoryEntity, → ProductEntity

#### ProductController
- **Responsibility:**
  - Redaguoti produktą
  - Atnaujinti produkto duomenis
  - Išsaugoti produktą / redaguotą produktą
  - Ištrinti produktą
  - Validuoti duomenis
  - Patikrinti galimus produkto dublikatus
- **Veiksmai:** Sukurti, atnaujinti, ištrinti produktą
- **Ryšiai:** ← AddProductPage, ← ProductDetailsPage, → ProductEntity, → InventoryEntity

#### ProductScanController
- **Responsibility:**
  - Skenuoti nuotrauką
  - Nuskenuoti barkodą
  - Išsaugoti barkodą
  - Nufotografuoti čekį
  - Pateikti gautą produktų sąrašą su patikimumo reikšmėm
  - Ištrinti produktą iš gauto sąrašo (vartotojas nuima varnelę)
- **Veiksmai:** Koordinuoja visą skenavimo pipeline'ą
- **Ryšiai:** 
  - ← AddProductPage, ← ReceiptAndBudgetPage
  - → PermissionDialog, → CameraGalleryBoundary
  - → OcrServiceBoundary, → GeminiServiceBoundary, → OpenFoodFactsServiceBoundary
  - → ProductEntity, → ReceiptLineEntity, → NutritionEntity
  - → ProductController, → ReceiptBudgetController

#### ReceiptBudgetController
- **Responsibility:**
  - Išsaugoti patvirtintą čekį
  - Atnaujinti biudžetą
- **Veiksmai:** Sukurti kvitą, atnaujinti biudžetą, pridėti produktus į inventorių
- **Ryšiai:** 
  - ← ReceiptAndBudgetPage, ← ProductScanController
  - → ReceiptEntity, → ReceiptLineEntity, → InventoryEntity, → BudgetEntity

#### DealsController
- **Responsibility:** Rasti akcijas produktui/krepšeliui
- **Veiksmai:** Ieškoti akcijų
- **Ryšiai:** 
  - ← ProductDetailsPage
  - → DealEntity, → StoreEntity, → ProductEntity
  - → DealsPage

---

### 5. Entities (Duomenys)

#### Inventory (Inventorius)
- **Aprašymas:** Produktų sąrašas
- **Santykiu:** *-- Product (kompozicija: 0..*)
- **Responsibility:** Saugoti produktų sąrašą

#### Product (Produktas)
- **Aprašymas:** Bazinė produkto informacija (pavadinimas, barkodas, kategorija, galiojimas ir t.t.)
- **Ryšiai:** 
  - ← Inventory (kompozicija)
  - ← ReceiptLine (susijęs su)
  - ← Deal (susijęs su)

#### Receipt (Kvitas)
- **Aprašymas:** Čekio antraštė (data, parduotuvė, bendra suma)
- **Santykiu:** *-- ReceiptLine (kompozicija: 0..*)

#### ReceiptLine (Kvito eilutė)
- **Aprašymas:** Čekio eilutė (produktas, kiekis, kaina)
- **Ryšiai:** → Product (susietas su)

#### Budget (Biudžetas)
- **Aprašymas:** Biudžeto būsena (numatyta suma, išleista, likutis)

#### Deal (Akcija)
- **Aprašymas:** Akcijos informacija
- **Ryšiai:** → Product, → Store

#### Store (Parduotuvė)
- **Aprašymas:** Parduotuvės informacija

#### NutritionInfo (Maistinė informacija)
- **Aprašymas:** Maistinė informacija iš OFF/Gemini

---

## 🔄 Pagrindiniai srautai

### 1. Peržiūrėti produktus

```
Šeimos narys
  ↓
HomePage (paspaudžia "Inventorius")
  ↓
RouterController
  ↓
InventoryPage
  ↓
InventoryController
  ↓
Inventory → Product (sąrašas)
  ↓
InventoryController
  ↓
InventoryPage (rodo sąrašą)
  ↓
Šeimos narys
```

### 2. Pridėti produktą rankiniu būdu

```
Šeimos narys
  ↓
InventoryPage (paspaudžia "Pridėti produktą")
  ↓
RouterController
  ↓
AddProductPage
  ↓
Šeimos narys (suveda duomenis)
  ↓
AddProductPage
  ↓
ProductController
  ↓
Product (sukuria)
  ↓
Inventory (prideda į inventorių)
  ↓
ProductController
  ↓
RouterController → InventoryPage (grįžta į sąrašą)
```

### 3. Pridėti produktą pagal barkodą

```
Šeimos narys
  ↓
AddProductPage (paspaudžia "Nuskaityti barkodą")
  ↓
ProductScanController
  ↓
CameraGalleryBoundary (skaitymas)
  ↓
ProductScanController
  ↓
OpenFoodFactsServiceBoundary (gauna duomenis)
  ↓
ProductScanController → ProductEntity
  ↓
ProductController
  ↓
Inventory (prideda)
```

### 4. Pridėti produktą iš nuotraukos (OCR + Gemini)

```
Šeimos narys
  ↓
AddProductPage (paspaudžia "Atidaryti kamerą")
  ↓
ProductScanController
  ↓
PermissionDialog (jei reikia)
  ↓
CameraGalleryBoundary (gauna nuotrauką)
  ↓
ProductScanController
  ↓
OcrServiceBoundary (apdoroja vaizdą, OCR)
  ↓
GeminiServiceBoundary (analizuoja)
  ↓
OpenFoodFactsServiceBoundary (papildoma info)
  ↓
ProductScanController → Product, NutritionInfo
  ↓
ProductController
  ↓
Inventory
```

### 5. Skenuoti kvitą

```
Šeimos narys
  ↓
ReceiptAndBudgetPage (nufotografuoja čekį)
  ↓
ProductScanController
  ↓
OcrServiceBoundary + GeminiServiceBoundary + OpenFoodFactsServiceBoundary
  ↓
ProductScanController → ReceiptLine, Product
  ↓
ReceiptBudgetController
  ↓
Receipt, ReceiptLine, Inventory, Budget
  ↓
ReceiptAndBudgetPage (rodo rezultatą)
```

### 6. Redaguoti produktą

```
Šeimos narys
  ↓
InventoryPage (pasirenka produktą)
  ↓
ProductController
  ↓
RouterController
  ↓
ProductDetailsPage
  ↓
Šeimos narys (paspaudžia "Redaguoti")
  ↓
ProductController
  ↓
Product (atnaujina)
  ↓
Inventory (atnaujina)
  ↓
ProductDetailsPage (rodo sėkmę)
```

### 7. Ištrinti produktą

```
Šeimos narys
  ↓
ProductDetailsPage (paspaudžia "Ištrinti")
  ↓
ProductController
  ↓
Product (pažymi ištrintą)
  ↓
Inventory (pašalina)
  ↓
RouterController → InventoryPage
```

### 8. Peržiūrėti akcijas

```
Šeimos narys
  ↓
ProductDetailsPage (paspaudžia "Akcijos")
  ↓
RouterController
  ↓
DealsPage
  ↓
DealsController
  ↓
Deal, Store, Product
  ↓
DealsPage (rodo akcijas)
```

---

## ✅ BCE/ICONIX taisyklės

### Taisyklių laikymasis:

1. ✅ **Actor → Boundary:** Šeimos narys sąveikauja tik su UI boundaries
2. ✅ **Boundary → Control:** UI boundaries kalba tik su controlleriais
3. ✅ **Control → Control:** Controlleriai gali kalbėtis tarpusavyje
4. ✅ **Control → Entity:** Controlleriai manipuliuoja entity
5. ✅ **Control → Service Boundary:** Controlleriai kalba su išoriniais servisais per boundary
6. ✅ **Entity → Entity:** Entity gali turėti ryšius tarpusavyje (kompozicija, agregacija)

### Supabase nėra boundary

- Supabase yra **mūsų sistemos dalis** (duomenų bazė)
- Entity objektai (Inventory, Product, Receipt, ir t.t.) **saugomi Supabase**
- Tai implementacijos detalė, ne diagramos objektas

---

## 📊 Diagramos failas

- **PlantUML:** `docs/diagrams/robustness/manage_products_PILNA.puml`
- **Aprašymas:** Šis failas (`manage_products_PILNA_aprasymas.md`)

---

## 🎯 Kaip naudoti šią diagramą

1. **Nusibraižyti Visual Paradigm:**
   - Kairėje: Actor + UI Boundaries
   - Viduryje: Controllers
   - Dešinėje: Service Boundaries + Entities

2. **Rodyklės kryptys:**
   - Actor → Boundary → Control → Entity
   - Control → Service Boundary
   - Entity → Entity (kompozicija/agregacija)

3. **Implementacija Flutter:**
   - Controller → BLoC (InventoryBloc, ProductBloc, ir t.t.)
   - Boundary → Page/Widget
   - Entity → Model klasė



























