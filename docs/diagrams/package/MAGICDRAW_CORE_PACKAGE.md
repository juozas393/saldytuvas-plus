# 📦 Core Package - MagicDraw Instrukcijos

## 🎯 **KAIP SUKURTI CORE PAKETĄ MAGICDRAW:**

---

## 📋 **1. SUKURTI TOP-LEVEL PACKAGE:**

### **Sukurkite Core paketą:**

1. **Project Browser** → Dešinė → **New Package**
2. Pavadinimas: `Core`
3. Stereotype: `<<package>>` (arba be stereotype)

---

## 📋 **2. SUKURTI 6 SUB-PACKAGES:**

### **Core pakete sukurkite 6 sub-paketų:**

1. **Config** (sub-package)
2. **Errors** (sub-package)
3. **Network** (sub-package)
4. **Storage** (sub-package)
5. **Theme** (sub-package)
6. **Utils** (sub-package)

**Kaip sukurti:**
- Dešinė ant `Core` → **New Package**
- Pavadinimas: `Config`, `Errors`, ir t.t.

---

## 📋 **3. SUKURTI KOMPONENTUS KIEKVIENAME SUB-PACKAGE:**

### **3.1. Config Sub-Package:**

**Komponentai:**
- `AppConfig` (Class)

**Kaip sukurti:**
1. Dešinė ant `Config` → **New Class**
2. Pavadinimas: `AppConfig`
3. Stereotype: (be stereotype)

---

### **3.2. Errors Sub-Package:**

**Komponentai:**
- `Exceptions` (Class)
- `Failures` (Class)

**Kaip sukurti:**
1. Dešinė ant `Errors` → **New Class**
2. Pavadinimas: `Exceptions`
3. Dešinė ant `Errors` → **New Class**
4. Pavadinimas: `Failures`

---

### **3.3. Network Sub-Package:**

**Komponentai:**
- `SupabaseClient` (Class)
- `HttpClient` (Class)

**Kaip sukurti:**
1. Dešinė ant `Network` → **New Class**
2. Pavadinimas: `SupabaseClient`
3. Dešinė ant `Network` → **New Class**
4. Pavadinimas: `HttpClient`

---

### **3.4. Storage Sub-Package:**

**Komponentai:**
- `LocalStorage` (Class)

**Kaip sukurti:**
1. Dešinė ant `Storage` → **New Class**
2. Pavadinimas: `LocalStorage`

---

### **3.5. Theme Sub-Package:**

**Komponentai:**
- `AppTheme` (Class)

**Kaip sukurti:**
1. Dešinė ant `Theme` → **New Class**
2. Pavadinimas: `AppTheme`

---

### **3.6. Utils Sub-Package:**

**Komponentai:**
- `Helpers` (Class)

**Kaip sukurti:**
1. Dešinė ant `Utils` → **New Class**
2. Pavadinimas: `Helpers`

---

## 📊 **GALUTINĖ STRUKTŪRA:**

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

## 🎨 **DIAGRAMOJE PARODYTI:**

### **Variantas 1: Nested Packages (Rekomenduojamas):**

1. **Diagram** → Drag `Core` package
2. MagicDraw automatiškai parodys sub-packages
3. Galite išskleisti/suskleisti sub-packages

---

### **Variantas 2: Flat Structure:**

Jei norite parodyti visus komponentus:

1. Drag `Core.Config` package
2. Drag `Core.Errors` package
3. Drag `Core.Network` package
4. Drag `Core.Storage` package
5. Drag `Core.Theme` package
6. Drag `Core.Utils` package

---

## 📋 **DEPENDENCIES (PRIKLAUSOMYBĖS):**

### **Core.Network → Core.Config:**

1. Diagram → **Dependency** arrow
2. Pradžia: `Core.Network`
3. Pabaiga: `Core.Config`
4. Label: `uses`

---

## ✅ **IŠVADA:**

**Core paketas = 6 sub-packages + 8 classes:**

- Config: 1 class
- Errors: 2 classes
- Network: 2 classes
- Storage: 1 class
- Theme: 1 class
- Utils: 1 class

**Viskas paruošta!** ✅


























