# 🍽️ Meal Plan - Member vs Admin Funkcionalumas

## ✅ **Jūsų Reikalavimas:**

- **Member:** Tik **mato** planą (read-only)
- **Admin:** **Valdo** planą (CRUD - sukurti, redaguoti, ištrinti)

---

## 🎯 **Controller'iai:**

### **MemberSubsystem:**
```
MealPlanViewController
  └── Funkcija: Tik peržiūrėti planą (read-only)
```

### **AdminSubsystem:**
```
MealPlanController
  └── Funkcija: Valdyti planą (CRUD)
```

---

## 📋 **Funkcionalumas:**

### **Member (MealPlanViewController):**

| Funkcija | Statusas |
|----------|----------|
| Peržiūrėti planą | ✅ |
| Matyti valgius | ✅ |
| Sukurti planą | ❌ |
| Redaguoti planą | ❌ |
| Ištrinti planą | ❌ |

**Use Case:** PAN (Member) - Peržiūrėti mitybos planą

---

### **Admin (MealPlanController):**

| Funkcija | Statusas |
|----------|----------|
| Peržiūrėti planą | ✅ |
| Matyti valgius | ✅ |
| Sukurti planą | ✅ |
| Redaguoti planą | ✅ |
| Ištrinti planą | ✅ |

**Use Case:** PAA2, PAA12, PAA13, PAA14 (Admin) - Valdyti mitybos planą

---

## 🔄 **Kaip Veiks:**

### **Member atidaro MealPlanningPage:**

```
MemberSubsystem.Views.MealPlanningPage
  ↓
MemberSubsystem.Controllers.MealPlanViewController
  ↓
  └── IMealPlanRepository.getMealPlans()  ← Tik skaitymas
```

**Rezultatas:** Member mato planą, bet negali redaguoti.

---

### **Admin atidaro MealPlanAdminPage:**

```
AdminSubsystem.Controllers.MealPlanController
  ↓
  ├── Create: IMealPlanRepository.createMealPlan()
  ├── Update: IMealPlanRepository.updateMealPlan()
  ├── Delete: IMealPlanRepository.deleteMealPlan()
  └── Read: IMealPlanRepository.getMealPlans()
```

**Rezultatas:** Admin gali viską - sukurti, redaguoti, ištrinti, peržiūrėti.

---

## ✅ **Išvada:**

**Dabar yra TEISINGA struktūra:**

- ✅ **MealPlanViewController** (MemberSubsystem) - tik peržiūra
- ✅ **MealPlanController** (AdminSubsystem) - valdymas (CRUD)

**Tai yra skirtingi controller'iai su skirtingomis funkcijomis!** ✅


























