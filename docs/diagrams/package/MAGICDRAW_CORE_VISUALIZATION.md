# 📦 Core Package - Kaip Parodyti MagicDraw?

## 🎯 **STRUKTŪRA:**

```
Core (Package)
├── Config (Sub-Package)
│   └── AppConfig (Class)
├── Errors (Sub-Package)
│   ├── Exceptions (Class)
│   └── Failures (Class)
├── Network (Sub-Package)
│   ├── SupabaseClient (Class)
│   └── HttpClient (Class)
├── Storage (Sub-Package)
│   └── LocalStorage (Class)
├── Theme (Sub-Package)
│   └── AppTheme (Class)
└── Utils (Sub-Package)
    └── Helpers (Class)
```

---

## 📋 **ŽINGSNIS PO ŽINGSNIO:**

### **1. SUKURTI CORE PACKAGE:**

**Project Browser:**
1. Dešinė ant root → **New Package**
2. Pavadinimas: `Core`
3. Stereotype: (be stereotype arba `<<package>>`)

---

### **2. SUKURTI 6 SUB-PACKAGES:**

**Core pakete:**

#### **2.1. Config Sub-Package:**
1. Dešinė ant `Core` → **New Package**
2. Pavadinimas: `Config`

#### **2.2. Errors Sub-Package:**
1. Dešinė ant `Core` → **New Package**
2. Pavadinimas: `Errors`

#### **2.3. Network Sub-Package:**
1. Dešinė ant `Core` → **New Package**
2. Pavadinimas: `Network`

#### **2.4. Storage Sub-Package:**
1. Dešinė ant `Core` → **New Package**
2. Pavadinimas: `Storage`

#### **2.5. Theme Sub-Package:**
1. Dešinė ant `Core` → **New Package**
2. Pavadinimas: `Theme`

#### **2.6. Utils Sub-Package:**
1. Dešinė ant `Core` → **New Package**
2. Pavadinimas: `Utils`

---

### **3. SUKURTI CLASSES KIEKVIENAME SUB-PACKAGE:**

#### **3.1. Core.Config:**

1. Dešinė ant `Core.Config` → **New Class**
2. Pavadinimas: `AppConfig`

---

#### **3.2. Core.Errors:**

1. Dešinė ant `Core.Errors` → **New Class**
   - Pavadinimas: `Exceptions`

2. Dešinė ant `Core.Errors` → **New Class**
   - Pavadinimas: `Failures`

---

#### **3.3. Core.Network:**

1. Dešinė ant `Core.Network` → **New Class**
   - Pavadinimas: `SupabaseClient`

2. Dešinė ant `Core.Network` → **New Class**
   - Pavadinimas: `HttpClient`

---

#### **3.4. Core.Storage:**

1. Dešinė ant `Core.Storage` → **New Class**
   - Pavadinimas: `LocalStorage`

---

#### **3.5. Core.Theme:**

1. Dešinė ant `Core.Theme` → **New Class**
   - Pavadinimas: `AppTheme`

---

#### **3.6. Core.Utils:**

1. Dešinė ant `Core.Utils` → **New Class**
   - Pavadinimas: `Helpers`

---

## 🎨 **PARODYTI DIAGRAMOJE:**

### **Variantas 1: Nested Packages (Rekomenduojamas):**

1. **Diagram** → Drag `Core` package
2. MagicDraw automatiškai parodys sub-packages kaip nested
3. Galite:
   - Išskleisti sub-packages (dvigubas paspaudimas)
   - Suskleisti sub-packages

**Kaip atrodo:**
```
┌─────────────────────┐
│   Core              │
│  ┌───────────────┐  │
│  │ Config        │  │
│  │  • AppConfig  │  │
│  └───────────────┘  │
│  ┌───────────────┐  │
│  │ Errors        │  │
│  │  • Exceptions │  │
│  │  • Failures   │  │
│  └───────────────┘  │
│  ┌───────────────┐  │
│  │ Network       │  │
│  │  • Supabase...│  │
│  │  • HttpClient │  │
│  └───────────────┘  │
│  ...                 │
└─────────────────────┘
```

---

### **Variantas 2: Flat Structure:**

Jei norite parodyti visus sub-packages atskirai:

1. Drag `Core.Config` package
2. Drag `Core.Errors` package
3. Drag `Core.Network` package
4. Drag `Core.Storage` package
5. Drag `Core.Theme` package
6. Drag `Core.Utils` package

**Kaip atrodo:**
```
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│ Core.Config │  │ Core.Errors │  │ Core.Network│
│  • AppConfig│  │  • Exception│  │  • Supabase │
└─────────────┘  │  • Failures │  │  • Http     │
                 └─────────────┘  └─────────────┘
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│ Core.Storage│  │ Core.Theme  │  │ Core.Utils  │
│  • Local... │  │  • AppTheme │  │  • Helpers  │
└─────────────┘  └─────────────┘  └─────────────┘
```

---

## 📊 **KAI NORITE RODYTIS VISUS ELEMENTUS:**

### **Sukurti Class Diagram:**

1. **New Diagram** → **Class Diagram**
2. Drag visus elementus iš Project Browser:
   - `Core.Config.AppConfig`
   - `Core.Errors.Exceptions`
   - `Core.Errors.Failures`
   - `Core.Network.SupabaseClient`
   - `Core.Network.HttpClient`
   - `Core.Storage.LocalStorage`
   - `Core.Theme.AppTheme`
   - `Core.Utils.Helpers`

---

## ✅ **DEPENDENCIES (JEI REIKIA):**

### **Core.Network → Core.Config:**

1. Diagram → **Dependency** tool (dashed arrow)
2. Pradžia: `Core.Network` arba `SupabaseClient`
3. Pabaiga: `Core.Config` arba `AppConfig`
4. Label: `uses`

---

## 🎯 **REKOMENDACIJA:**

### **Package Diagram:**

- ✅ Naudokite **nested packages** (Variantas 1)
- ✅ Core paketas su išskleidžiamais sub-packages
- ✅ Automatiškai rodo klasės viduje

### **Class Diagram:**

- ✅ Jei reikia detalų → sukurkite atskirą Class Diagram
- ✅ Rodykite visas klasės su jų metodais/atributais

---

## ✅ **IŠVADA:**

**Core paketas = 6 sub-packages + 8 classes:**

- Config: 1 class (AppConfig)
- Errors: 2 classes (Exceptions, Failures)
- Network: 2 classes (SupabaseClient, HttpClient)
- Storage: 1 class (LocalStorage)
- Theme: 1 class (AppTheme)
- Utils: 1 class (Helpers)

**MagicDraw automatiškai parodys nested struktūrą!** ✅


























