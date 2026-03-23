# Robustumo diagrama - "Valdyti produktus" - Aprašymas

## 📋 Apžvalga

Ši robustumo diagrama aprašo use case **"Valdyti produktus"**, kuriame vartotojas gali:
1. Peržiūrėti produktus
2. Pridėti produktą (ranka arba pagal barcode)
3. Redaguoti produktą
4. Ištrinti produktą

---

## 🎯 Use Case Variantai

### Variantas 1: Peržiūrėti produktus

**Srautas:**
1. Vartotojas atidaro **Inventoriaus langą**
2. Langas siunčia `LoadProductsEvent` į `InventoryBloc`
3. `InventoryBloc` kreipiasi į `Supabase API Boundary`
4. Supabase grąžina produktų sąrašą
5. `InventoryBloc` atnaujina būseną: `ProductsLoadedState`
6. Langas rodo produktų sąrašą vartotojui

**Boundary:** Inventoriaus langas  
**Controller:** InventoryBloc  
**Entity:** Product, InventoryItem

---

### Variantas 2: Pridėti produktą rankiniu būdu

**Srautas:**
1. Vartotojas atidaro **Produkto pridėjimo langą**
2. Vartotojas užpildo formą (pavadinimas, kiekis, galiojimo data)
3. Langas siunčia `AddProductEvent` į `InventoryBloc`
4. `InventoryBloc` kviečia `AddProductUseCase`
5. `AddProductUseCase` sukuria `ProductEntity` ir `InventoryItemEntity`
6. `AddProductUseCase` siunčia duomenis į `Supabase API Boundary`
7. Supabase įrašo produktą į DB
8. `InventoryBloc` gauna sėkmės atsakymą ir atnaujina būseną
9. Langas rodo sėkmės pranešimą vartotojui

**Boundary:** Produkto pridėjimo langas  
**Controller:** InventoryBloc → AddProductUseCase  
**Entity:** Product, InventoryItem  
**API Boundary:** Supabase API Boundary

---

### Variantas 3: Pridėti produktą pagal barcode

**Srautas:**
1. Vartotojas atidaro **Produkto pridėjimo langą**
2. Vartotojas paspaudžia "Skenuoti barcode"
3. Atidaromas **Mobile Scanner Boundary** (barcode scanner)
4. Barcode nuskaitytas, grąžinamas barcode numeris (pvz., 5901234123457)
5. Langas siunčia `ScanBarcodeEvent` į `InventoryBloc`
6. `InventoryBloc` kviečia `BarcodeScannerService`
7. `BarcodeScannerService` kreipiasi į `Open Food Facts API Boundary`
8. Open Food Facts grąžina produkto duomenis (pavadinimas, kategorija, maistinė vertė, ir t.t.)
9. `OpenFoodFactsService` sukuria `ProductEntity` iš API atsakymo
10. `InventoryBloc` gauna `ProductEntity` ir atnaujina būseną: `ProductScannedState`
11. Langas automatiškai užpildo formą su gautais duomenimis
12. Vartotojas gali redaguoti arba patvirtinti
13. Toliau seka tas pats srautas kaip "Pridėti produktą rankiniu būdu" (žingsniai 3-9)

**Boundary:** Produkto pridėjimo langas, Mobile Scanner Boundary  
**Controller:** InventoryBloc → BarcodeScannerService → OpenFoodFactsService → AddProductUseCase  
**Entity:** Product, InventoryItem  
**API Boundaries:** Mobile Scanner Boundary, Open Food Facts API Boundary, Supabase API Boundary

---

### Variantas 4: Redaguoti produktą

**Srautas:**
1. Vartotojas **Inventoriaus lange** paspaudžia ant produkto kortelės
2. Atidaromas **Produkto kortelės langas** (detalės)
3. Vartotojas paspaudžia "Redaguoti"
4. Langas rodo redagavimo formą su esamais duomenimis
5. Vartotojas redaguoja duomenis
6. Langas siunčia `UpdateProductEvent(productId, updatedData)` į `InventoryBloc`
7. `InventoryBloc` kviečia `UpdateProductUseCase`
8. `UpdateProductUseCase` atnaujina `ProductEntity` ir `InventoryItemEntity`
9. `UpdateProductUseCase` siunčia atnaujintus duomenis į `Supabase API Boundary`
10. Supabase atnaujina produktą DB
11. `InventoryBloc` gauna sėkmės atsakymą ir atnaujina būseną: `ProductUpdatedState`
12. Langas rodo sėkmės pranešimą ir atnaujintus duomenis

**Boundary:** Produkto kortelės langas  
**Controller:** InventoryBloc → UpdateProductUseCase  
**Entity:** Product, InventoryItem  
**API Boundary:** Supabase API Boundary

---

### Variantas 5: Ištrinti produktą

**Srautas:**
1. Vartotojas **Produkto kortelės lange** paspaudžia "Ištrinti"
2. Langas rodo patvirtinimo dialogą
3. Vartotojas patvirtina ištrynimą
4. Langas siunčia `DeleteProductEvent(productId)` į `InventoryBloc`
5. `InventoryBloc` kviečia `DeleteProductUseCase`
6. `DeleteProductUseCase` siunčia užklausą į `Supabase API Boundary`
7. Supabase ištrina produktą iš DB
8. `DeleteProductUseCase` grąžina sėkmę
9. `InventoryBloc` atnaujina būseną: `ProductDeletedState`
10. Langas naviguoja atgal į **Inventoriaus langą**
11. `InventoryBloc` atnaujina produktų sąrašą: `ProductsUpdatedState`
12. Inventoriaus langas rodo atnaujintą sąrašą (be ištrinto produkto)

**Boundary:** Produkto kortelės langas, Inventoriaus langas  
**Controller:** InventoryBloc → DeleteProductUseCase  
**Entity:** Product, InventoryItem  
**API Boundary:** Supabase API Boundary

---

## 📊 Komponentų santrauka

### Boundaries (UI Ribos)
- **Inventoriaus langas** - produktų sąrašo peržiūra
- **Produkto pridėjimo langas** - naujo produkto forma
- **Produkto kortelės langas** - produkto detalės ir redagavimas

### Boundaries (Išorinės sistemos)
- **Supabase API Boundary** - duomenų bazės prieiga
- **Open Food Facts API Boundary** - produkto duomenys pagal barcode
- **Mobile Scanner Boundary** - barcode skaitymas

### Controllers
- **InventoryBloc** - UI būsenos valdymas
- **AddProductUseCase** - produkto pridėjimo logika
- **UpdateProductUseCase** - produkto atnaujinimo logika
- **DeleteProductUseCase** - produkto ištrynimo logika
- **BarcodeScannerService** - barcode skaitymas
- **OpenFoodFactsService** - produkto duomenų gavimas iš API

### Entities
- **Product** - produkto modelis (pavadinimas, kategorija, maistinė vertė)
- **InventoryItem** - inventoriaus elemento modelis (kiekis, galiojimo data, vieta)

---

## 🔄 Srauto principas

Visos operacijos seka tą patį pattern:

```
UI Boundary (Langas)
    ↓
BLoC Controller (State Management)
    ↓
Use Case / Service (Business Logic)
    ↓
API Boundary / External System
    ↓
Entity (Duomenų modelis)
```

---

## ✅ MVP Funkcionalumas

Visi šie variantai yra **MVP dalis** ir **įgyvendinami**:
- ✅ Peržiūrėti produktus - paprasta CRUD operacija
- ✅ Pridėti produktą rankiniu būdu - paprasta CRUD operacija
- ✅ Pridėti produktą pagal barcode - realistiška (Open Food Facts API nemokamas)
- ✅ Redaguoti produktą - paprasta CRUD operacija
- ✅ Ištrinti produktą - paprasta CRUD operacija

---

**Diagrama:** `docs/diagrams/robustness/manage_products.puml`  
**Data:** 2025-01-XX  
**Status:** ✅ MVP - įgyvendinamas





























