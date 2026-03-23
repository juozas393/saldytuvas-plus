# ⚠️ Architektūros Logikos Problemos

## 🔍 **Identifikuoti Konfliktai**

---

## ⚠️ **1. KONFLIKTAS: MealPlanningController vs MealPlanController**

### **Problema:**

```
MemberSubsystem.Controllers
  └── MealPlanningController

AdminSubsystem.Controllers
  └── MealPlanController  ← Skirtingas pavadinimas!
```

**Klausimas:** Ar tai tas pats controller ar skirtingi?

**Pagal Use Case diagramą:**
- **Member:** Peržiūrėti mitybos planą (read-only)
- **Admin:** Sukurti/Redaguoti/Ištrinti mitybos planą (full CRUD)

**Sprendimas:**
- ✅ Vienas controller: `MealPlanningController` (bendras, su permissions)
- ✅ ARBA atskiri: `MealPlanningController` (Member) ir `MealPlanAdminController` (Admin)

**Rekomendacija:** Vienas controller su permissions ✅

---

## ⚠️ **2. KONFLIKTAS: ReceiptAndBudgetController vs BudgetController**

### **Problema:**

```
MemberSubsystem.Controllers
  └── ReceiptAndBudgetController  ← Valdo čekius + biudžeto peržiūrą

AdminSubsystem.Controllers
  └── BudgetController  ← Valdo biudžeto valdymą
```

**Pagal Use Case diagramą:**
- **Member (PAN5):** Peržiūrėti biudžetą (read-only)
- **Admin (PAA6):** Valdyti biudžetą (full CRUD)

**Išvada:**
- ✅ Tai yra **skirtingi controller'iai** - nėra konflikto!
- ✅ `ReceiptAndBudgetController` - member funkcijos (peržiūra)
- ✅ `BudgetController` - admin funkcijos (valdymas)

---

## ✅ **3. Teisinga: ShoppingListController**

```
MemberSubsystem.Controllers
  └── ShoppingListController ✅

AdminSubsystem.Controllers
  └── (Nėra - bendras feature)
```

**Išvada:** ✅ Teisinga - shopping list yra bendras feature

---

## 🎯 **Rekomendacijos**

### **Sprendimas 1: Vienas MealPlanningController (Rekomenduojama)**

```
MemberSubsystem.Controllers
  └── MealPlanningController (bendras, su permissions)

AdminSubsystem.Controllers
  └── (Pašalinti MealPlanController)
```

**Kaip veiks:**
- Member: gali tik peržiūrėti (read-only)
- Admin: gali viską (CRUD) - permissions tikrinimas per repository

---

### **Sprendimas 2: Atskiri Controller'iai**

```
MemberSubsystem.Controllers
  └── MealPlanningController (member - read-only)

AdminSubsystem.Controllers
  └── MealPlanAdminController (admin - full CRUD)
```

**Kaip veiks:**
- Aiškus atskyrimas
- Daugiau kodo, bet aiškiau

---

## 📊 **Dabar Esama Situacija**

### **MemberSubsystem:**
- `MealPlanningController` ← Member funkcijos (peržiūra?)

### **AdminSubsystem:**
- `MealPlanController` ← Admin funkcijos (valdymas)

**Klausimas:** Ar `MealPlanningController` ir `MealPlanController` yra tas pats ar skirtingi?

---

## ✅ **Išvada**

**Yra 2 galimi konfliktai:**

1. ⚠️ **MealPlanningController vs MealPlanController** - pavadinimo konfliktas
2. ✅ **ReceiptAndBudgetController vs BudgetController** - OK, skirtingi (peržiūra vs valdymas)

**Rekomendacija:** Pataisyti pavadinimus arba aiškiai apibrėžti skirtumus.


























