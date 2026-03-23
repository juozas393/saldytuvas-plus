# 📦 Core Package - MagicDraw Step-by-Step

## 🎯 **AIŠKIAUSIAS GIDAS:**

---

## ✅ **ŽINGSNIS 1: SUKURTI CORE PACKAGE**

1. **Project Browser** (kairėje)
2. Dešinė ant root folder → **New → Package**
3. Pavadinimas: `Core`
4. OK

---

## ✅ **ŽINGSNIS 2: SUKURTI SUB-PACKAGES**

**Kiekvienam sub-package:**

1. Dešinė ant `Core` → **New → Package**
2. Pavadinimas: `Config` (pirmas)
3. OK

**Pakartokite:**
- `Errors`
- `Network`
- `Storage`
- `Theme`
- `Utils`

---

## ✅ **ŽINGSNIS 3: SUKURTI CLASSES**

### **Core.Config:**
1. Dešinė ant `Core.Config` → **New → Class**
2. Pavadinimas: `AppConfig`
3. OK

### **Core.Errors:**
1. Dešinė ant `Core.Errors` → **New → Class**
2. Pavadinimas: `Exceptions`
3. OK

4. Dešinė ant `Core.Errors` → **New → Class**
5. Pavadinimas: `Failures`
6. OK

### **Core.Network:**
1. Dešinė ant `Core.Network` → **New → Class**
2. Pavadinimas: `SupabaseClient`
3. OK

4. Dešinė ant `Core.Network` → **New → Class**
5. Pavadinimas: `HttpClient`
6. OK

### **Core.Storage:**
1. Dešinė ant `Core.Storage` → **New → Class**
2. Pavadinimas: `LocalStorage`
3. OK

### **Core.Theme:**
1. Dešinė ant `Core.Theme` → **New → Class**
2. Pavadinimas: `AppTheme`
3. OK

### **Core.Utils:**
1. Dešinė ant `Core.Utils` → **New → Class**
2. Pavadinimas: `Helpers`
3. OK

---

## ✅ **ŽINGSNIS 4: PARODYTI DIAGRAMOJE**

### **Package Diagram:**

1. **New Diagram** → **Package Diagram**
2. Drag `Core` package iš Project Browser į diagramą
3. MagicDraw automatiškai parodys:
   ```
   Core
   ├── Config
   │   └── AppConfig
   ├── Errors
   │   ├── Exceptions
   │   └── Failures
   ├── Network
   │   ├── SupabaseClient
   │   └── HttpClient
   ├── Storage
   │   └── LocalStorage
   ├── Theme
   │   └── AppTheme
   └── Utils
       └── Helpers
   ```

---

## 🎨 **FORMATAVIMAS:**

### **Nested Packages:**

MagicDraw automatiškai parodys kaip:
```
┌─────────────────────────────┐
│ Core                        │
│                             │
│ ┌─────────────┐             │
│ │ Config      │             │
│ │ ┌─────────┐ │             │
│ │ │AppConfig│ │             │
│ │ └─────────┘ │             │
│ └─────────────┘             │
│                             │
│ ┌─────────────┐             │
│ │ Errors      │             │
│ │ ┌─────────┐ │             │
│ │ │Exception│ │             │
│ │ └─────────┘ │             │
│ │ ┌─────────┐ │             │
│ │ │Failures │ │             │
│ │ └─────────┘ │             │
│ └─────────────┘             │
│                             │
│ ... (kiti sub-packages)     │
└─────────────────────────────┘
```

---

## ✅ **GALUTINIS REZULTATAS:**

**Core paketas su:**
- ✅ 6 sub-packages
- ✅ 8 classes
- ✅ Nested struktūra diagramoje

**Viskas paruošta!** ✅


























