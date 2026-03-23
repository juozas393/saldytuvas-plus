# 🤔 Subsystems Struktūra - Analizė

## ❓ **DĖSTYTOJO KLAUSIMAS:**

> "ar tikrai bus subsystems, jei vienoj tik controllers o kitoj ir views ir controllers"

---

## 📊 **DABAR ESANTI STRUKTŪRA:**

### **MemberSubsystem:**
- Views (15 langų)
- Controllers (13)

### **AdminSubsystem:**
- Controllers (6) ← **TIK CONTROLLERS!**

---

## 🤔 **ANALIZĖ:**

### **PROBLEMA:**

**MemberSubsystem:**
- Turi Views + Controllers
- Tai yra pilnas presentation layer

**AdminSubsystem:**
- Turi tik Controllers
- Neturi Views (naudotų MemberSubsystem.Views)

**IŠVADA:** AdminSubsystem nėra pilnas subsystem, nes neturi savo Views!

---

## ✅ **GALIMI VARIANTUS:**

### **Variantas 1: Palikti kaip yra**
```
MemberSubsystem:
  - Views
  - Controllers (Member)

AdminSubsystem:
  - Controllers (Admin)
  - Uses MemberSubsystem.Views
```

**PRO:** Atskiria Member ir Admin funkcionalumą

**CONTRA:** AdminSubsystem nėra pilnas subsystem

---

### **Variantas 2: Konsoliduoti į Presentation Layer**
```
Presentation:
  - Views (bendras)
  - Controllers (Member)
  - Controllers (Admin)
```

**PRO:** Logiškesnė struktūra - vienas presentation layer

**CONTRA:** Nėra atskirties tarp Member ir Admin

---

### **Variantas 3: MemberSubsystem kaip pagrindinis, AdminControllers kaip extension**
```
MemberSubsystem:
  - Views
  - Controllers (Member)
  - Controllers (Admin) ← pridėti čia
```

**PRO:** Vienas pilnas subsystem

**CONTRA:** Netraukia Member ir Admin atskirties

---

### **Variantas 4: Views atskirai, Controllers atskirai**
```
Views:
  - All Views (Member + Admin naudoja)

Controllers:
  - Member Controllers
  - Admin Controllers
```

**PRO:** Aiški atskyris

**CONTRA:** Nėra subsystem struktūros

---

## ✅ **REKOMENDACIJA:**

**Palikti kaip yra, bet pataisyti struktūrą:**

```
MemberSubsystem:
  - Views (bendras, naudojamas abiems)
  - Controllers (Member)

AdminSubsystem:
  - Controllers (Admin)
  - Note: Uses MemberSubsystem.Views
```

**ARBA:**

```
Presentation:
  - Views
  - MemberControllers
  - AdminControllers
```

---

## 🎯 **MANO REKOMENDACIJA:**

**VARIANTAS A: Palikti subsystems, bet pridėti pastabą:**
- MemberSubsystem: Views + Member Controllers
- AdminSubsystem: Admin Controllers (naudotų MemberSubsystem.Views)

**VARIANTAS B: Konsoliduoti:**
- Presentation Layer: Views + All Controllers
- DomainModel, DataAccess, ExternalServices, Core - kaip yra

---

## ✅ **IŠVADA:**

Dėstytojas teisus - jei AdminSubsystem turi tik Controllers, tai nėra pilnas subsystem. Reikia:
1. Palikti kaip yra + pridėti pastabą
2. Arba konsoliduoti į Presentation Layer


























