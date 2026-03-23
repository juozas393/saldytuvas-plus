# 📦 Package Diagram - Kaip Turėtų Atrodyti?

## 🎯 **STRUKTŪRA:**

---

## 📊 **1. TOP-LEVEL PACKAGES (8 paketai):**

### **Išdėstymas:**

```
┌─────────────────────────────────────────────────────────────┐
│              SALDYTVAS PLUS - PACKAGE DIAGRAM               │
└─────────────────────────────────────────────────────────────┘

┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│   Member     │  │    Admin     │  │    Domain    │
│ Subsystem    │  │ Subsystem    │  │    Model     │
└──────────────┘  └──────────────┘  └──────────────┘

┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│    Data      │  │   External   │  │    Core      │
│   Access     │  │   Services   │  │              │
└──────────────┘  └──────────────┘  └──────────────┘

┌──────────────┐  ┌──────────────┐
│   Services   │  │    Actors    │
│              │  │              │
└──────────────┘  └──────────────┘
```

---

## 📊 **2. DETALUS PAKETŲ TURINYS:**

### **MemberSubsystem:**

```
┌────────────────────────────────────────────┐
│  MemberSubsystem                           │
│                                            │
│  ┌──────────────────────┐                 │
│  │ Views (15)           │                 │
│  │ ├─ HomePage          │                 │
│  │ ├─ LoginPage         │                 │
│  │ ├─ InventoryPage     │                 │
│  │ └─ ... (12 more)     │                 │
│  └──────────────────────┘                 │
│                                            │
│  ┌──────────────────────┐                 │
│  │ Controllers (13)     │                 │
│  │ ├─ RouterController  │                 │
│  │ ├─ DashboardCtrl     │                 │
│  │ ├─ InventoryCtrl     │                 │
│  │ └─ ... (10 more)     │                 │
│  └──────────────────────┘                 │
└────────────────────────────────────────────┘
```

---

### **AdminSubsystem:**

```
┌────────────────────────────────────────────┐
│  AdminSubsystem                            │
│                                            │
│  ┌──────────────────────┐                 │
│  │ Controllers (6)      │                 │
│  │ ├─ FamilyMembersCtrl │                 │
│  │ ├─ BudgetController  │                 │
│  │ ├─ InventoryAccess   │                 │
│  │ ├─ ShoppingListCtrl  │                 │
│  │ ├─ FoodRulesCtrl     │                 │
│  │ └─ FoodSubstituteCtrl│                 │
│  └──────────────────────┘                 │
└────────────────────────────────────────────┘
```

---

### **DomainModel:**

```
┌────────────────────────────────────────────┐
│  DomainModel                               │
│                                            │
│  ┌──────────────────────┐                 │
│  │ Entities (19)        │                 │
│  │ ├─ Administrator     │                 │
│  │ ├─ Budget            │                 │
│  │ ├─ Product           │                 │
│  │ └─ ... (16 more)     │                 │
│  └──────────────────────┘                 │
│                                            │
│  ┌──────────────────────┐                 │
│  │ Enumerations (7)     │                 │
│  │ ├─ DishType          │                 │
│  │ ├─ UserRole          │                 │
│  │ └─ ... (5 more)      │                 │
│  └──────────────────────┘                 │
└────────────────────────────────────────────┘
```

---

### **Core (su sub-packages):**

```
┌────────────────────────────────────────────┐
│  Core                                      │
│                                            │
│  ┌──────┐  ┌──────┐  ┌──────┐            │
│  │Config│  │Errors│  │Network│            │
│  │AppCfg│  │Exc/F │  │Supabase│           │
│  │      │  │      │  │Http   │            │
│  └──────┘  └──────┘  └──────┘            │
│                                            │
│  ┌──────┐  ┌──────┐  ┌──────┐            │
│  │Storag│  │Theme │  │ Utils│            │
│  │Local │  │AppThe│  │Helper│            │
│  │      │  │      │  │      │            │
│  └──────┘  └──────┘  └──────┘            │
└────────────────────────────────────────────┘
```

---

## 📊 **3. DEPENDENCY FLOW:**

### **Pagrindinės priklausomybės:**

```
┌─────────────┐
│    Views    │ ──────(uses)──────> ┌──────────────┐
└─────────────┘                     │ Controllers  │
                                    └──────┬───────┘
                                           │
                                           ├──(uses)──> Services
                                           │
                                           └──(uses entities)──> DomainModel

┌─────────────┐
│  Services   │ ──────(calls)──────> ┌──────────────┐
└──────┬──────┘                     │   External    │
       │                            │   Services    │
       ├──(uses)──────────────────> └──────────────┘
       │
       ├──(uses)──────────────────> ┌──────────────┐
       │                            │ Repositories  │
       └──(uses entities)──────────> └──────┬───────┘
                                            │
                                            ├──(uses)──> SupabaseGateway
                                            │
                                            └──(uses)──> Core.Network.SupabaseClient
```

---

## 🎨 **4. MAGICDRAW VIZUALIZACIJA:**

### **Layout Rekomendacija:**

1. **Top Row (Actors):**
   - Actors paketas viršuje (išoriniai aktoriai)

2. **Middle Row (Subsystems):**
   - MemberSubsystem (kairėje)
   - AdminSubsystem (dešinėje)
   - DomainModel (viduryje, apačioje)

3. **Bottom Row (Infrastructure):**
   - DataAccess (kairėje)
   - ExternalServices (dešinėje)
   - Services (viduryje)
   - Core (apačioje, centre)

---

## 📊 **5. STEREOTYPES:**

### **Kiekvienas elementas turi stereotype:**

- **Views:** `<<screen>>`
- **Controllers:** `<<control>>`
- **Entities:** `<<entity>>`
- **Enumerations:** `<<enumeration>>`
- **Boundaries:** `<<boundary>>`
- **Actors:** `<<actor>>`

---

## ✅ **6. NOTES:**

### **Svarbiausios pastabos:**

1. **MemberSubsystem:**
   - Flutter App struktūra
   - 15 langų
   - 13 controllers

2. **AdminSubsystem:**
   - 6 controllers
   - Naudoja MemberSubsystem.Views su permissions

3. **Services:**
   - MVP vs Po MVP services

4. **ExternalServices:**
   - MVP vs Po MVP boundaries

---

## ✅ **GALUTINIS REZULTATAS:**

**Package diagrama turėtų rodyti:**

1. ✅ **8 top-level packages**
2. ✅ **Nested sub-packages** (Views, Controllers, ir t.t.)
3. ✅ **Clear dependencies** (dashed arrows)
4. ✅ **Stereotypes** visiems elementams
5. ✅ **Notes** su paaiškinimais
6. ✅ **Logical grouping** (similar packages šalia)

**Viskas paruošta MagicDraw!** ✅


























