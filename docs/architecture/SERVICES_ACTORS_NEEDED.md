# 🔍 Services ir Actors - Ar Reikalingi Package Diagramoje?

## ❓ **Klausimas:**

Ar tikrai reikia Services ir Actors paketų diagramoje? Gal viskas jau yra?

---

## 📊 **ANALIZĖ:**

### **1. SERVICES Paketas:**

**Ar reikalingas?**

**PRO:**
- ✅ Rodo verslo logikos sluoksnį
- ✅ Aiškiai atskiria Services nuo Controllers
- ✅ Rodo priklausomybes (Services → Repositories, ExternalServices)

**CONTRA:**
- ❌ Galima parodyti priklausomybes be atskiro paketo
- ❌ Galima Services pridėti kaip dependencies, ne paketą

---

### **2. ACTORS Paketas:**

**Ar reikalingas?**

**PRO:**
- ✅ Rodo išorinių aktorių sąveiką
- ✅ UML standarte Actors yra svarbūs

**CONTRA:**
- ❌ Actors nėra sistemos dalis (išoriniai)
- ❌ Galima praleisti, jei diagrama rodo tik sistemos komponentus
- ❌ Galima parodyti kaip dependencies, ne paketą

---

## ✅ **DU VARIANTUS:**

### **Variantas 1: SU Services ir Actors (Dabar)**

```
8 top-level packages:
- MemberSubsystem
- AdminSubsystem
- DomainModel
- DataAccess
- ExternalServices
- Core
- Services ← AR REIKALINGAS?
- Actors ← AR REIKALINGAS?
```

---

### **Variantas 2: BE Services ir Actors (Supaprastinta)**

```
6 top-level packages:
- MemberSubsystem
- AdminSubsystem
- DomainModel
- DataAccess
- ExternalServices
- Core

Services → integruoti kaip dependencies (Controllers → Services)
Actors → praleisti arba parodyti kaip external dependencies
```

---

## 🎯 **REKOMENDACIJA:**

### **Jei norite supaprastinti:**

**Pašalinti:**
- ❌ Services paketas (bet palikti Services kaip dependencies)
- ❌ Actors paketas (bet palikti Actors kaip external dependencies)

**Palikti tik:**
- ✅ MemberSubsystem
- ✅ AdminSubsystem
- ✅ DomainModel
- ✅ DataAccess
- ✅ ExternalServices
- ✅ Core

---

## ✅ **AR TAI LOGIŠKA?**

**TAIP!**

Package diagrama gali rodyti tik **sistemos komponentus**, ne:
- Services (galima parodyti kaip dependencies)
- Actors (galima parodyti kaip external dependencies)

---

## ❓ **KLAUSIMAS JŪSŲ:**

**Ar norite supaprastinti?**

1. **Variantas 1:** Palikti Services ir Actors (pilna architektūra)
2. **Variantas 2:** Pašalinti Services ir Actors (supaprastinta)


























