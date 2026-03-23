# 🎛️ AdminSubsystem Controller'iai - Pagal Use Case Diagramą

## ✅ **Taip, AdminSubsystem turi turėti Controller'ius!**

Pagal Use Case diagramą, **Šeimos administravimo posistemis** turi šiuos use case'us:

---

## 📋 **Use Case'ai → Controller'iai Mapping**

### **Pagal Use Case Diagramą:**

| Use Case (PAA) | Aprašymas | Controller |
|----------------|-----------|------------|
| **PAA1** | Valdyti pirkinių sąrašą | ❌ Nėra (bendras feature - MemberSubsystem) |
| **PAA2** | Peržiūrėti mitybos planą | `MealPlanController` (Admin) |
| **PAA3** | Atnaujinti akcijas | `DealsUpdateController` |
| **PAA4** | Valdyti prieigą bendro inventoriaus | `InventoryAccessController` |
| **PAA5** | Perspėti apie biudžeto būseną | `BudgetAlertController` |
| **PAA6** | Valdyti biudžetą | `BudgetController` (Admin) |
| **PAA7** | Peržiūrėti maisto taisykles | `FoodRulesController` |
| **PAA8** | Siūlyti maisto pakaitalus | `FoodSubstituteController` |
| **PAA9** | Valdyti šeimos narius | `FamilyMembersController` |
| **PAA10** | Įspėti apie artėjančią galiojimo pabaigą | `ExpirationAlertController` |
| **PAA12** | Redaguoti mitybos planą | `MealPlanController` (Admin) |
| **PAA13** | Ištrinti mitybos planą | `MealPlanController` (Admin) |
| **PAA14** | Sukurti mitybos planą | `MealPlanController` (Admin) |

---

## 🎯 **AdminSubsystem Controller'iai**

### **1. FamilyMembersController** (PAA9)
**Funkcionalumas:**
- Pridėti šeimos narius
- Pašalinti šeimos narius
- Valdyti narių teises/permissions
- Peržiūrėti šeimos narių sąrašą

**Use Case:** PAA9 - Valdyti šeimos narius

---

### **2. MealPlanController** (Admin) (PAA2, PAA12, PAA13, PAA14)
**Funkcionalumas:**
- Sukurti mitybos planą (PAA14)
- Redaguoti mitybos planą (PAA12)
- Ištrinti mitybos planą (PAA13)
- Peržiūrėti mitybos planą (PAA2)

**Use Case:** PAA2, PAA12, PAA13, PAA14

**Pastaba:** Adminas turi **pilną kontrolę** mitybos planu, o narys tik peržiūri.

---

### **3. BudgetController** (Admin) (PAA6)
**Funkcionalumas:**
- Valdyti biudžetą
- Nustatyti biudžeto limitus
- Peržiūrėti biudžeto suvestinę

**Use Case:** PAA6 - Valdyti biudžetą

**Pastaba:** Adminas valdo **visos šeimos biudžetą**, o narys tik peržiūri.

---

### **4. InventoryAccessController** (PAA4)
**Funkcionalumas:**
- Valdyti prieigą prie bendro inventoriaus
- Nustatyti, kurie nariai gali matyti/redaguoti inventorių
- Valdyti permissions

**Use Case:** PAA4 - Valdyti prieigą bendro inventoriaus

---

### **5. DealsUpdateController** (PAA3)
**Funkcionalumas:**
- Atnaujinti akcijas (scraping ar rankinis)
- Valdyti akcijų duomenis

**Use Case:** PAA3 - Atnaujinti akcijas

---

### **6. FoodRulesController** (PAA7)
**Funkcionalumas:**
- Peržiūrėti maisto taisykles (alergijos, dietos)
- Valdyti taisykles

**Use Case:** PAA7 - Peržiūrėti maisto taisykles

---

### **7. FoodSubstituteController** (PAA8)
**Funkcionalumas:**
- Siūlyti maisto pakaitalus
- Valdyti pakaitalų sąrašą

**Use Case:** PAA8 - Siūlyti maisto pakaitalus

---

### **8. BudgetAlertController** (PAA5)
**Funkcionalumas:**
- Perspėti apie biudžeto būseną
- Nustatyti biudžeto perspėjimus

**Use Case:** PAA5 - Perspėti apie biudžeto būseną

---

### **9. ExpirationAlertController** (PAA10)
**Funkcionalumas:**
- Įspėti apie artėjančią galiojimo pabaigą
- Nustatyti perspėjimo laiką

**Use Case:** PAA10 - Įspėti apie artėjančią galiojimo pabaigą

---

## 📊 **AdminSubsystem Controller'iai Sąrašas**

### **Pagrindiniai Controller'iai:**

1. ✅ **FamilyMembersController** - Valdyti šeimos narius (PAA9)
2. ✅ **MealPlanController** (Admin) - Valdyti mitybos planą (PAA2, PAA12, PAA13, PAA14)
3. ✅ **BudgetController** (Admin) - Valdyti biudžetą (PAA6)
4. ✅ **InventoryAccessController** - Valdyti prieigą (PAA4)
5. ✅ **DealsUpdateController** - Atnaujinti akcijas (PAA3)
6. ✅ **FoodRulesController** - Maisto taisyklės (PAA7)
7. ✅ **FoodSubstituteController** - Maisto pakaitalai (PAA8)
8. ✅ **BudgetAlertController** - Biudžeto perspėjimai (PAA5)
9. ✅ **ExpirationAlertController** - Galiojimo perspėjimai (PAA10)

---

## 🔄 **Skirtumas: Member vs Admin**

### **MemberSubsystem Controller'iai:**
- Naudoja funkcijas **skaitymui** ir **savo duomenų valdymui**
- Ribotos teisės

### **AdminSubsystem Controller'iai:**
- Naudoja funkcijas **visos šeimos valdymui**
- Pilnos teisės (CRUD visiems nariams)

---

## ✅ **Išvada:**

**AdminSubsystem neturėtų būti tuščias!** Pagal Use Case diagramą, adminas turi daug funkcijų, kurioms reikia controller'ių.

**AdminSubsystem turi turėti ~9 controller'ių** pagal use case'us! ✅


























