# 🤔 Ar Reikia Services ir Actors Paketų?

## ❓ **JŪSŲ KLAUSIMAS:**

> "ar services tikrai reikia ir aktoriu? manau, kad ne? nes jau viskas yra"

---

## 📊 **ANALIZĖ:**

### **1. SERVICES paketas:**

**Ar reikalingas kaip TOP-LEVEL paketas?**

**PRO (palikti):**
- ✅ Rodo verslo logikos sluoksnį
- ✅ Aiškiai atskiria Services nuo Controllers
- ✅ Priklausomybės: `Controllers ..> Services : uses`

**CONTRA (pašalinti):**
- ❌ Services jau rodomi per dependencies
- ❌ Galima Services integruoti kaip sub-package arba dependency be atskiro paketo
- ❌ Supaprastina diagramą (6 paketai vietoje 8)

---

### **2. ACTORS paketas:**

**Ar reikalingas kaip TOP-LEVEL paketas?**

**PRO (palikti):**
- ✅ UML standarte Actors yra svarbūs
- ✅ Rodo išorinių aktorių sąveiką

**CONTRA (pašalinti):**
- ❌ Actors nėra sistemos dalis (išoriniai)
- ❌ Priklausomybės: `Actors.FamilyMember ..> Views : interacts` jau rodo sąveiką
- ❌ Package diagrama dažniausiai rodo tik sistemos komponentus, ne išorinius aktorius

---

## ✅ **REKOMENDACIJA:**

### **Variantas 1: PAŠALINTI Services ir Actors (SUPAPRASTINTA)**

**6 top-level paketai:**
```
1. MemberSubsystem
2. AdminSubsystem
3. DomainModel
4. DataAccess
5. ExternalServices
6. Core
```

**Services:**
- Pašalinti Services paketą
- Palikti dependencies: `Controllers ..> "Services" : uses` (be paketo, tik label)

**Actors:**
- Pašalinti Actors paketą
- Palikti dependencies: `"FamilyMember" ..> Views : interacts` (be paketo, tik label)

---

### **Variantas 2: PALIKTI Services, PAŠALINTI Actors (BALANCED)**

**7 top-level paketai:**
```
1. MemberSubsystem
2. AdminSubsystem
3. DomainModel
4. DataAccess
5. ExternalServices
6. Core
7. Services ← Palikti
```

**Actors:**
- Pašalinti Actors paketą
- Palikti dependencies be paketo

---

## 🎯 **KURIS VARIANTAS GERIAU?**

**Rekomendacija: PAŠALINTI ABU**

**Kodėl?**
- ✅ Package diagrama rodo **sistemos komponentus**, ne išorinius aktorius
- ✅ Services galima parodyti kaip dependency, ne atskirą paketą
- ✅ Supaprastina diagramą (6 paketai vietoje 8)
- ✅ Viskas vis tiek rodoma per dependencies

---

## ✅ **GALUTINIS VARIANTAS:**

**6 top-level paketai (BE Services ir Actors):**

```
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│   Member     │  │    Admin     │  │    Domain    │
│ Subsystem    │  │ Subsystem    │  │    Model     │
└──────────────┘  └──────────────┘  └──────────────┘

┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│    Data      │  │   External   │  │    Core      │
│   Access     │  │   Services   │  │              │
└──────────────┘  └──────────────┘  └──────────────┘
```

**Dependencies (Services kaip label):**
```
Controllers ..> "Services" : uses
```

**Dependencies (Actors kaip label):**
```
"FamilyMember" ..> Views : interacts
```

---

## ✅ **IŠVADA:**

**TAIP, GALITE PAŠALINTI Services ir Actors paketus!**

1. ✅ Services rodomi per dependencies
2. ✅ Actors rodomi per dependencies
3. ✅ Supaprastina diagramą
4. ✅ Viskas vis tiek aiškiai parodyta

**Ar norite, kad pataisyčiau diagramą?**


























