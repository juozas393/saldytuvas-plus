# 📦 Package Diagram - Kaip Turėtų Atrodyti?

## 🎯 **STRUKTŪRA:**

---

## 📊 **1. TOP-LEVEL PACKAGES (8 paketai, be root):**

### **Vizualus išdėstymas:**

```
┌──────────────────────────────────────────────────────────────────┐
│          SALDYTVAS PLUS - LOGICAL ARCHITECTURE DIAGRAM           │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────┐         ┌──────────────────┐
│  MemberSubsystem │         │ AdminSubsystem   │
│                  │         │                  │
│  ┌────────────┐  │         │  ┌────────────┐  │
│  │ Views (15) │  │         │  │Controllers │  │
│  └────────────┘  │         │  │    (6)     │  │
│  ┌────────────┐  │         │  └────────────┘  │
│  │Controllers │  │         │                  │
│  │   (13)     │  │         │                  │
│  └────────────┘  │         │                  │
└──────────────────┘         └──────────────────┘

                ┌──────────────────┐
                │  DomainModel     │
                │                  │
                │  ┌────────────┐  │
                │  │ Entities   │  │
                │  │   (19)     │  │
                │  └────────────┘  │
                │  ┌────────────┐  │
                │  │Enumerations│  │
                │  │    (7)     │  │
                │  └────────────┘  │
                └──────────────────┘

┌──────────────────┐         ┌──────────────────┐
│   DataAccess     │         │ ExternalServices │
│                  │         │                  │
│  ┌────────────┐  │         │  ┌────────────┐  │
│  │Repositories│  │         │  │Boundaries  │  │
│  │   (10)     │  │         │  │   (3 MVP)  │  │
│  └────────────┘  │         │  └────────────┘  │
│  ┌────────────┐  │         └──────────────────┘
│  │Supabase    │  │
│  │Gateway     │  │         ┌──────────────────┐
│  └────────────┘  │         │   Services       │
└──────────────────┘         │                  │
                             │   (15 total)     │
┌──────────────────┐         │  - MVP (2-4)     │
│      Core        │         │  - Po MVP (11)   │
│                  │         └──────────────────┘
│  ┌────────────┐  │
│  │ Config     │  │         ┌──────────────────┐
│  │ Errors     │  │         │     Actors       │
│  │ Network    │  │         │                  │
│  │ Storage    │  │         │   (8 actors)     │
│  │ Theme      │  │         └──────────────────┘
│  │ Utils      │  │
│  └────────────┘  │
└──────────────────┘
```

---

## 📊 **2. DEPENDENCY ARROWS (Priklausomybės):**

### **Pagrindinės priklausomybės:**

```
┌──────────────────┐
│      Views       │ ─────────────(uses)──────────> ┌──────────────────┐
└──────────────────┘                               │   Controllers    │
                                                   └────────┬─────────┘
                                                            │
                                                            ├────(uses)────> Services
                                                            │
                                                            └──(uses entities)──> DomainModel.Entities

┌──────────────────┐
│   Controllers    │ ─────────────(uses)──────────> ┌──────────────────┐
└────────┬─────────┘                               │    Services      │
         │                                          └────────┬─────────┘
         │                                                   │
         └───────────────(uses entities)───────────────────┼──> DomainModel.Entities
                                                            │
                                                            ├────(calls)────> ExternalServices
                                                            │
                                                            ├────(uses)────> Repositories
                                                            │
                                                            └────(uses entities)──> DomainModel.Entities

┌──────────────────┐
│  Repositories    │ ─────────────(uses)──────────> ┌──────────────────┐
└────────┬─────────┘                               │  SupabaseGateway │
         │                                          └────────┬─────────┘
         └───────────────(uses entities)───────────────────┼──> DomainModel.Entities
                                                            │
                                                            └────(uses)────> Core.Network.SupabaseClient

┌──────────────────┐
│ ExternalServices │ ─────────────(uses)──────────> ┌──────────────────┐
└──────────────────┘                               │ Core.Network.HttpClient │
                                                   └──────────────────┘

┌──────────────────┐
│    Entities      │ ─────────────(uses)──────────> ┌──────────────────┐
└──────────────────┘                               │  Enumerations    │
                                                   └──────────────────┘
```

---

## 🎨 **3. MAGICDRAW LAYOUT:**

### **Rekomenduojamas išdėstymas:**

**Option 1: Hierarchical (Rekomenduojamas)**

```
                            ┌─────────────┐
                            │   Actors    │
                            └─────────────┘
                                   │
        ┌──────────────────────────┴──────────────────────────┐
        │                                                      │
┌───────┴────────┐                                  ┌─────────┴───────┐
│    Member      │                                  │      Admin      │
│  Subsystem     │                                  │   Subsystem     │
└───────┬────────┘                                  └─────────┬───────┘
        │                                                      │
        └──────────────────────┬──────────────────────────────┘
                               │
                    ┌──────────┴──────────┐
                    │                     │
            ┌───────┴────────┐   ┌───────┴────────┐
            │  DomainModel    │   │   DataAccess   │
            └───────┬────────┘   └───────┬────────┘
                    │                     │
                    └──────────┬──────────┘
                               │
                    ┌──────────┴──────────┐
                    │                     │
            ┌───────┴────────┐   ┌───────┴────────┐
            │   Services     │   │  External      │
            │                │   │  Services      │
            └───────┬────────┘   └───────┬────────┘
                    │                     │
                    └──────────┬──────────┘
                               │
                        ┌──────┴──────┐
                        │    Core     │
                        └─────────────┘
```

---

**Option 2: Grid Layout**

```
┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│   Member    │  │    Admin    │  │   Domain    │  │    Data     │
│ Subsystem   │  │ Subsystem   │  │   Model     │  │   Access    │
└─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘

┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│  External   │  │    Core     │  │  Services   │  │   Actors    │
│  Services   │  │             │  │             │  │             │
└─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘
```

---

## 📊 **4. STEREOTYPES:**

### **Kiekvienas elementas turi stereotype:**

- **Views:** `<<screen>>`
- **Controllers:** `<<control>>`
- **Entities:** `<<entity>>`
- **Enumerations:** `<<enumeration>>`
- **Boundaries:** `<<boundary>>`
- **Actors:** `<<actor>>`

---

## 📊 **5. NOTES:**

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

5. **Core:**
   - 6 sub-packages su 8 classes

---

## ✅ **GALUTINIS REZULTATAS:**

**Package diagrama turėtų rodyti:**

1. ✅ **8 top-level packages** (be root package)
2. ✅ **Nested sub-packages** kur reikia
3. ✅ **Clear dependencies** (dashed arrows)
4. ✅ **Stereotypes** visiems elementams
5. ✅ **Notes** su paaiškinimais
6. ✅ **Logical grouping** (similar packages šalia)

**Viskas paruošta MagicDraw!** ✅


























