# 📦 Package Diagram Struktūra - Variantai

> **Klausimas:** Ar tikrai galima dėti viską į vieną package?

---

## ✅ **Variantas 1: Su Root Package (DABAR NAUDOJAME)**

### **Struktūra:**

```
📦 SaldytuvasPlus (Root Package)
│
├── 📦 MemberSubsystem
├── 📦 AdminSubsystem
├── 📦 DomainModel
├── 📦 DataAccess
├── 📦 ExternalServices
├── 📦 Services
├── 📦 Core
└── 📦 Actors
```

### **Privalumai:**
- ✅ Aiški sistema kaip viena visuma
- ✅ Lengva identifikuoti, kas priklauso sistemai
- ✅ Standartinis UML būdas
- ✅ Gerai veikia MagicDraw

### **Trūkumai:**
- ⚠️ Visi elementai hierarchijoje (gali atrodyti "sunkokai")
- ⚠️ Reikia naviguoti per root package

---

## ✅ **Variantas 2: Be Root Package (Atskiri Top-Level Packages)**

### **Struktūra:**

```
📦 MemberSubsystem (Top-Level)
📦 AdminSubsystem (Top-Level)
📦 DomainModel (Top-Level)
📦 DataAccess (Top-Level)
📦 ExternalServices (Top-Level)
📦 Services (Top-Level)
📦 Core (Top-Level)
📦 Actors (Top-Level)

(Nėra "SaldytuvasPlus" root package)
```

### **Privalumai:**
- ✅ Lengvesnė navigacija
- ✅ Mažiau hierarchijos
- ✅ Aiškiau matosi visi paketai viename lygyje

### **Trūkumai:**
- ⚠️ Nėra aiškaus sistemos pavadinimo
- ⚠️ Sudėtingiau eksportuoti kaip vieną visumą

---

## 🎯 **Kuris Variantas Geriau?**

### **Rekomendacija: VARIANTAS 1 (su Root Package)**

**Kodėl?**
1. **UML standartas** - package diagramose įprasta turėti root package
2. **Aiškumas** - matosi, kad visi paketai priklauso "SaldytuvasPlus" sistemai
3. **MagicDraw** - geriau veikia su root package
4. **Dokumentacija** - lengviau eksportuoti kaip vieną sistemą

---

## 📋 **Konkretus Pavyzdys: MagicDraw**

### **Variantas 1 (su Root Package):**

```
1. Sukurti Package: "SaldytuvasPlus"
2. Dešiniu pelės mygtuku → Add → Package
3. Sukurti MemberSubsystem PO SaldytuvasPlus
4. Sukurti AdminSubsystem PO SaldytuvasPlus
5. ir t.t.
```

**Rezultatas:**
```
SaldytuvasPlus/
  ├── MemberSubsystem/
  ├── AdminSubsystem/
  └── ...
```

### **Variantas 2 (be Root Package):**

```
1. Tiesiog sukurti Package: "MemberSubsystem" (be root)
2. Sukurti Package: "AdminSubsystem" (be root)
3. ir t.t.
```

**Rezultatas:**
```
MemberSubsystem/ (top-level)
AdminSubsystem/ (top-level)
...
```

---

## 🤔 **Bet Ar Tai Tikrai Vienas Package?**

**Ne!** Tai nėra "vienas package" - tai yra **root package su sub-packages**.

```
SaldytuvasPlus (Root Package)
  └── MemberSubsystem (Sub-Package)
      └── Views (Sub-Package)
          └── HomePage (Class)
```

**Tai yra 3 lygių hierarchija:**
1. Root Package
2. Sub-Packages
3. Classes/Interfaces

---

## ✅ **Išvada:**

### **TAIP, galite naudoti root package "SaldytuvasPlus" su visais sub-packages.**

**Kodėl?**
- ✅ Tai yra standartinis UML būdas
- ✅ Aiškiai rodo, kad visi paketai priklauso vienai sistemai
- ✅ Gerai veikia MagicDraw
- ✅ Lengviau dokumentuoti

**Bet galite ir be root package** - tada visi paketai bus top-level (be hierarchijos).

---

## 🎯 **Rekomendacija Jums:**

**Naudokite VARIANTAS 1 (su Root Package), nes:**

1. Jūsų diagramoje jau yra root package struktūra
2. MagicDraw gerai palaiko root packages
3. Loginė architektūra rodo sistemą kaip vieną visumą

**Jei MagicDraw sistemoje atrodo per sudėtingai, galite:**
- Sumažinti root package matomumą (make it less visible)
- ARBA naudoti Variantą 2 (be root package)

**Kurį variantą norite naudoti?**


























