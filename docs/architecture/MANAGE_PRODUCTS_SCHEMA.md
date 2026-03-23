# Schema - "Valdyti produktus"

> **Vizualinė schema, kuri parodo visus komponentus ir jų ryšius**

---

## 📊 Schema struktūra

```
┌─────────────────────────────────────────────────────────────┐
│                    VALDYTI PRODUKTUS                         │
└─────────────────────────────────────────────────────────────┘

┌──────────────────────┐
│   Šeimos narys       │  ← Actor (vartotojas)
└──────────────────────┘
           │
           │ sąveikauja su
           ↓
┌─────────────────────────────────────────────────────────────┐
│  UI BOUNDARIES (Langai) - 3 langai                           │
├─────────────────────────────────────────────────────────────┤
│  • Inventoriaus langas (produktų sąrašas)                    │
│  • Produkto pridėjimo langas (forma)                         │
│  • Produkto kortelės langas (detalės/redagavimas)            │
└─────────────────────────────────────────────────────────────┘
           │
           │ siunčia įvykius
           ↓
┌─────────────────────────────────────────────────────────────┐
│  CONTROLLER (Flutter BLoC) - 1 controller                    │
├─────────────────────────────────────────────────────────────┤
│  • InventoryBloc                                             │
│    - Valdo VISĄ inventory funkcionalumą                      │
│    - Flutter BLoC objektas (Events → States)                 │
└─────────────────────────────────────────────────────────────┘
           │
           │ koordinuoja
           ↓
┌─────────────────────────────────────────────────────────────┐
│  EXTERNAL BOUNDARIES (Išorinės sistemos) - 4 boundaries      │
├─────────────────────────────────────────────────────────────┤
│  • Supabase API (duomenų bazė)                               │
│  • Open Food Facts API (produkto duomenys)                   │
│  • Mobile Scanner (barcode skaitymas)                        │
│  • Image Picker (kamera + galerija)                          │
└─────────────────────────────────────────────────────────────┘
           │
           │ naudoja/sukuria
           ↓
┌─────────────────────────────────────────────────────────────┐
│  ENTITIES (Duomenų modeliai) - 2 entities                    │
├─────────────────────────────────────────────────────────────┤
│  • Product (produkto duomenys)                               │
│  • InventoryItem (inventoriaus elemento duomenys)            │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 Komponentų sąrašas

### 1. UI Boundaries (3 langai)

| Langas | Ką daro |
|--------|---------|
| **Inventoriaus langas** | Rodo produktų sąrašą |
| **Produkto pridėjimo langas** | Forma produktui pridėti |
| **Produkto kortelės langas** | Detalės ir redagavimas |

### 2. Controller (1 BLoC)

| Controller | Ką valdo |
|-----------|----------|
| **InventoryBloc** | Visą inventory funkcionalumą (Product + InventoryItem) |

### 3. External Boundaries (4 išorinės sistemos)

| Boundary | Ką daro |
|----------|---------|
| **Supabase API** | Duomenų bazės operacijos (CRUD) |
| **Open Food Facts API** | Produkto duomenys pagal barcode |
| **Mobile Scanner** | Barcode skaitymas |
| **Image Picker** | Nuotraukų gavimas (kamera/galerija) |

### 4. Entities (2 duomenų modeliai)

| Entity | Ką saugo |
|--------|----------|
| **Product** | Produkto duomenys (pavadinimas, kategorija) |
| **InventoryItem** | Inventoriaus elemento duomenys (kiekis, galiojimo data) |

---

## 🔄 Pagrindinis srautas

### Srauto schema:

```
User (Šeimos narys)
    ↓
UI Boundary (Langas)
    ↓
InventoryBloc (Controller - Flutter BLoC)
    ↓
External Boundary (API) arba Entity (Duomenys)
    ↓
InventoryBloc (grąžina rezultatą)
    ↓
UI Boundary (atnaujina būseną)
    ↓
User (mato rezultatą)
```

---

## 📋 Use Case srautai

### 1. Peržiūrėti produktus

```
User 
  → InventoryPage (boundary)
  → InventoryBloc (controller)
  → Supabase (boundary)
  → Product + InventoryItem (entities)
  → InventoryBloc
  → InventoryPage
  → User
```

### 2. Pridėti produktą rankiniu būdu

```
User 
  → AddProductPage (boundary)
  → InventoryBloc (controller)
  → Product + InventoryItem (entities)
  → Supabase (boundary)
  → InventoryBloc
  → AddProductPage
  → User
```

### 3. Pridėti produktą pagal barcode

```
User 
  → AddProductPage (boundary)
  → InventoryBloc (controller)
  → BarcodeScanner (boundary)
  → OpenFoodAPI (boundary)
  → Product (entity)
  → InventoryBloc
  → AddProductPage
  → User
```

### 4. Pridėti produktą iš nuotraukos

```
User 
  → AddProductPage (boundary)
  → InventoryBloc (controller)
  → ImagePicker (boundary)
  → (OCR + Gemini procesas - po MVP)
  → Product (entity)
  → InventoryBloc
  → AddProductPage
  → User
```

### 5. Redaguoti produktą

```
User 
  → ProductDetailPage (boundary)
  → InventoryBloc (controller)
  → Product + InventoryItem (entities)
  → Supabase (boundary)
  → InventoryBloc
  → ProductDetailPage
  → User
```

### 6. Ištrinti produktą

```
User 
  → ProductDetailPage (boundary)
  → InventoryBloc (controller)
  → Supabase (boundary)
  → InventoryBloc
  → ProductDetailPage
  → InventoryPage
  → User
```

---

## ✅ Schema santrauka

### Komponentų skaičius:

| Kategorija | Kiekis | Pavyzdžiai |
|-----------|--------|-----------|
| **UI Boundaries** | 3 | InventoryPage, AddProductPage, ProductDetailPage |
| **Controller** | 1 | InventoryBloc (Flutter BLoC) |
| **External Boundaries** | 4 | Supabase, OpenFoodAPI, BarcodeScanner, ImagePicker |
| **Entities** | 2 | Product, InventoryItem |

**IŠ VISO:** 10 komponentų

---

## 🎯 Pagrindinis principas

**1 Feature = 1 BLoC Controller**

Inventory feature'as naudoja:
- ✅ **1 Controller:** `InventoryBloc`
- ✅ **2 Entities:** `Product` + `InventoryItem`
- ✅ **4 External Boundaries:** API sistemos
- ✅ **3 UI Boundaries:** Langai

Viskas valdoma per vieną `InventoryBloc` controller'į!

---

**Schema failai:**
- `manage_products_PILNA.puml` - **PILNA robustumo diagrama** (rekomenduojama) - visi komponentai ir ryšiai pagal activity diagramą
- `manage_products_PILNA_aprasymas.md` - Detalus aprašymas pilnai diagramai
- `manage_products_SCHEMA.puml` - detali schema su visais srautais
- `manage_products_SCHEMA_SIMPLE.puml` - paprasčiausia schema su tik pagrindiniais ryšiais

