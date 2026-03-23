# 🍽️ Meal Plan - Be Dubliavimo

## ✅ **Jūsų Reikalavimas:**

- **NutritionPage** → tiesiog rodo meal planą (tik peržiūra)
- **Member** → tik mato planą (read-only)
- **Admin** → valdo planą (CRUD)
- **Nėra dubliavimo!**

---

## 🎯 **Sprendimas: Vienas Controller su Permissions**

### **Controller Struktūra:**

```
MemberSubsystem.Controllers
  └── MealPlanningController  ← VIENAS controller!
```

**AdminSubsystem:**
- ❌ Nėra MealPlanController (pašalintas!)
- ✅ Adminas naudoja `MealPlanningController` su permissions

---

## 📋 **Kaip Veiks:**

### **NutritionPage (Member):**

```
NutritionPage
  ↓
MealPlanningController  ← Tik peržiūra (read-only)
  ↓
IMealPlanRepository.getMealPlans()  ← Skaitymas
```

**Rezultatas:** Member mato planą (tik peržiūra)

---

### **MealPlanningPage (Member):**

```
MealPlanningPage
  ↓
MealPlanningController  ← Tik peržiūra (read-only)
  ↓
IMealPlanRepository.getMealPlans()
```

**Rezultatas:** Member mato planą (tik peržiūra)

---

### **MealPlanAdminPage (Admin):**

```
MealPlanAdminPage
  ↓
MealPlanningController  ← Su admin permissions
  ↓
  ├── Create: IMealPlanRepository.createMealPlan()  ← Admin gali
  ├── Update: IMealPlanRepository.updateMealPlan()  ← Admin gali
  ├── Delete: IMealPlanRepository.deleteMealPlan()  ← Admin gali
  └── Read: IMealPlanRepository.getMealPlans()
```

**Rezultatas:** Admin gali viską - sukurti, redaguoti, ištrinti

---

## ✅ **Išvada:**

**Vienas controller, be dubliavimo:**

- ✅ `MealPlanningController` - vienas controller
- ✅ Member: tik peržiūra (read-only)
- ✅ Admin: valdymas (CRUD) - permissions per repository
- ✅ NutritionPage ir MealPlanningPage naudoja tą patį controller'į

**Nėra dubliavimo!** ✅


























