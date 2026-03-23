# Schema - "Valdyti produktus" - Aiškinimas

## 📊 Schema komponentai

### 1. **UI Boundaries (Langai)** - 3 langai
- `Inventoriaus langas` - produktų sąrašo peržiūra
- `Produkto pridėjimo langas` - naujo produkto forma
- `Produkto kortelės langas` - produkto detalės ir redagavimas

### 2. **Controller** - 1 BLoC
- `InventoryBloc` - valdo VISĄ inventory funkcionalumą (Flutter BLoC objektas)

### 3. **External Boundaries** - 4 išorinės sistemos
- `Supabase API` - duomenų bazė
- `Open Food Facts API` - produkto duomenys pagal barcode
- `Mobile Scanner` - barcode skaitymas
- `Image Picker` - kamera + galerija (vienas boundary)

### 4. **Entities** - 2 duomenų modeliai
- `Product` - produkto duomenys
- `InventoryItem` - inventoriaus elemento duomenys

---

## 🔄 Pagrindinis srautas

```
User 
  ↓
UI Boundary (Langas)
  ↓
InventoryBloc (Controller - Flutter BLoC)
  ↓
External Boundary (API) arba Entity
  ↓
InventoryBloc (grąžina rezultatą)
  ↓
UI Boundary (atnaujina būseną)
  ↓
User (mato rezultatą)
```

---

## 📋 Use Case variantai

### 1. Peržiūrėti produktus
- User → InventoryPage → InventoryBloc → Supabase → Product

### 2. Pridėti produktą ranka
- User → AddProductPage → InventoryBloc → Supabase → Product + InventoryItem

### 3. Pridėti produktą pagal barcode
- User → AddProductPage → InventoryBloc → BarcodeScanner → OpenFoodAPI → Product

### 4. Pridėti produktą iš nuotraukos
- User → AddProductPage → InventoryBloc → ImagePicker → (OCR procesas) → Product

### 5. Redaguoti produktą
- User → ProductDetailPage → InventoryBloc → Supabase → Product + InventoryItem

### 6. Ištrinti produktą
- User → ProductDetailPage → InventoryBloc → Supabase → (ištrinti)

---

**Schema failai:**
- `manage_products_SCHEMA.puml` - detali schema su visais srautais
- `manage_products_SCHEMA_SIMPLE.puml` - paprasčiausia schema su tik pagrindiniais ryšiais



























