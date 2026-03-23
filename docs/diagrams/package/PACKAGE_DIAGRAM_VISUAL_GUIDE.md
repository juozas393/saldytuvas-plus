# 📦 Package Diagram - Kaip Turėtų Atrodyti?

## 🎯 **VISUAL LAYOUT:**

---

## 📊 **1. PAKETŲ IŠDĖSTYMAS:**

### **Top-Level Packages (8 paketai):**

```
┌─────────────────────────────────────────────────────────────────┐
│                         PACKAGE DIAGRAM                         │
└─────────────────────────────────────────────────────────────────┘

┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│   Member     │  │    Admin     │  │    Domain    │  │    Data      │
│ Subsystem    │  │ Subsystem    │  │    Model     │  │   Access     │
│              │  │              │  │              │  │              │
│  Views (15)  │  │ Controllers  │  │ Entities(19) │  │Repositories  │
│Controllers(13│  │     (6)      │  │Enumerations(7│  │  Supabase    │
└──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘

┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  External    │  │    Core      │  │   Services   │  │    Actors    │
│  Services    │  │              │  │              │  │              │
│              │  │ Config       │  │  (15 total)  │  │  (8 actors)  │
│   (3 MVP)    │  │ Errors       │  │              │  │              │
│              │  │ Network      │  │              │  │              │
│              │  │ Storage      │  │              │  │              │
│              │  │ Theme        │  │              │  │              │
│              │  │ Utils        │  │              │  │              │
└──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘
```

---

## 📊 **2. DETALUS IŠDĖSTYMAS:**

### **MemberSubsystem:**

```
┌─────────────────────────────────────┐
│      MemberSubsystem                │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ Views                        │   │
│  │ ┌─────────────────────────┐ │   │
│  │ │ HomePage <<screen>>     │ │   │
│  │ │ LoginPage <<screen>>    │ │   │
│  │ │ InventoryPage <<screen>>│ │   │
│  │ │ ... (15 total)          │ │   │
│  │ └─────────────────────────┘ │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ Controllers                  │   │
│  │ ┌─────────────────────────┐ │   │
│  │ │ RouterController <<ctrl>│ │   │
│  │ │ DashboardController     │ │   │
│  │ │ ... (13 total)          │ │   │
│  │ └─────────────────────────┘ │   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

---

### **DomainModel:**

```
┌─────────────────────────────────────┐
│      DomainModel                    │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ Entities                     │   │
│  │ ┌─────────────────────────┐ │   │
│  │ │ Administrator <<entity>>│ │   │
│  │ │ Budget <<entity>>       │ │   │
│  │ │ Product <<entity>>      │ │   │
│  │ │ ... (19 total)          │ │   │
│  │ └─────────────────────────┘ │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ Enumerations                 │   │
│  │ ┌─────────────────────────┐ │   │
│  │ │ DishType <<enum>>       │ │   │
│  │ │ UserRole <<enum>>       │ │   │
│  │ │ ... (7 total)           │ │   │
│  │ └─────────────────────────┘ │   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

---

### **Core:**

```
┌─────────────────────────────────────┐
│      Core                           │
│                                     │
│  ┌──────────┐  ┌──────────┐       │
│  │ Config   │  │ Errors   │       │
│  │ AppConfig│  │Exception │       │
│  └──────────┘  │Failures  │       │
│                └──────────┘       │
│  ┌──────────┐  ┌──────────┐       │
│  │ Network  │  │ Storage  │       │
│  │Supabase  │  │Local     │       │
│  │Http      │  │Storage   │       │
│  └──────────┘  └──────────┘       │
│  ┌──────────┐  ┌──────────┐       │
│  │ Theme    │  │ Utils    │       │
│  │AppTheme  │  │Helpers   │       │
│  └──────────┘  └──────────┘       │
└─────────────────────────────────────┘
```

---

## 📊 **3. DEPENDENCY ARROWS:**

### **Pagrindinės priklausomybės:**

```
Views ──────────────(uses)──────────────> Controllers
  │                                          │
  │                                          ↓
  │                                    Services
  │                                          │
  │                                          ├──> ExternalServices
  │                                          ├──> Repositories
  │                                          └──> DomainModel
  │
  └────────────────────────────────────────────> DomainModel

Controllers ────────────(uses)──────────────> Services
Controllers ────────────(uses entities)──────> DomainModel.Entities

Services ──────────────(calls)──────────────> ExternalServices
Services ──────────────(uses)────────────────> Repositories
Services ──────────────(uses entities)───────> DomainModel.Entities

Repositories ──────────(uses)────────────────> SupabaseGateway
SupabaseGateway ──────(uses)────────────────> Core.Network.SupabaseClient

ExternalServices ──────(uses)────────────────> Core.Network.HttpClient

DomainModel.Entities ──(uses)────────────────> DomainModel.Enumerations
```

---

## 🎨 **4. VIZUALINIS STILIUS:**

### **Paketų spalvos (Rekomendacija):**

- **MemberSubsystem:** Mėlyna (#E3F2FD)
- **AdminSubsystem:** Žalia (#E8F5E9)
- **DomainModel:** Geltona (#FFF9C4)
- **DataAccess:** Oranžinė (#FFE0B2)
- **ExternalServices:** Violetinė (#F3E5F5)
- **Core:** Pilka (#F5F5F5)
- **Services:** Rožinė (#FCE4EC)
- **Actors:** Perlamutrinė (#E0F2F1)

---

## 📊 **5. MAGICDRAW LAYOUT:**

### **Rekomenduojamas išdėstymas:**

```
┌────────────────────────────────────────────────────────────────┐
│                         PACKAGE DIAGRAM                        │
└────────────────────────────────────────────────────────────────┘

                    ┌─────────────┐
                    │   Actors    │
                    └─────────────┘
                           │
        ┌──────────────────┴──────────────────┐
        │                                      │
┌───────┴────────┐              ┌─────────────┴───────┐
│    Member      │              │       Admin         │
│  Subsystem     │              │    Subsystem        │
└───────┬────────┘              └─────────────┬───────┘
        │                                      │
        └──────────────┬───────────────────────┘
                       │
        ┌──────────────┴──────────────┐
        │                             │
┌───────┴────────┐         ┌─────────┴────────┐
│  DomainModel   │         │    DataAccess    │
└───────┬────────┘         └─────────┬────────┘
        │                             │
        └──────────────┬──────────────┘
                       │
        ┌──────────────┴──────────────┐
        │                             │
┌───────┴────────┐         ┌─────────┴────────┐
│   Services     │         │ ExternalServices │
└───────┬────────┘         └─────────┬────────┘
        │                             │
        └──────────────┬──────────────┘
                       │
                ┌──────┴──────┐
                │    Core     │
                └─────────────┘
```

---

## ✅ **6. GALUTINIS REZULTATAS:**

### **Paketų skaičius:**
- 8 top-level packages
- Multiple sub-packages (Views, Controllers, Entities, ir t.t.)
- Total: ~88 komponentų

### **Dependencies:**
- Unidirectional flow
- Clear separation of concerns
- Clean Architecture principles

### **Vizualinis stilius:**
- Nested packages kur reikia
- Clear dependency arrows
- Stereotypes (<<screen>>, <<control>>, <<entity>>, ir t.t.)
- Notes su paaiškinimais

---

## ✅ **IŠVADA:**

**Package diagrama turėtų rodyti:**

1. ✅ **8 top-level packages** (be root package)
2. ✅ **Nested sub-packages** kur reikia (Views, Controllers, ir t.t.)
3. ✅ **Clear dependencies** (unidirectional)
4. ✅ **Stereotypes** visiems elementams
5. ✅ **Notes** su paaiškinimais (MVP vs Po MVP)

**Viskas paruošta!** ✅


























