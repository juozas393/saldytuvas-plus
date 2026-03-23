# 🎛️ Admin Controller'iai - Kaip Jie Veikia?

## ✅ **Pagrindinis Principas:**

**Admin Controller'iai naudoja tuos pačius Views kaip Member, bet su ADMIN PERMISSIONS!**

---

## 📋 **Kaip Veiks Praktiškai:**

### **1. FamilyMembersController**

**Kur naudojamas:**
```
ProfilePage (MemberSubsystem.Views)
  ├── Profile info (visi mato)
  └── "Valdyti šeimos narius" sekcija (tik admin)
       └── FamilyMembersController  ← Admin controller
```

**Funkcionalumas:**
- Admin mato papildomą mygtuką "Valdyti narius"
- Paspaudus - atidaromas dialogas/sekcija su FamilyMembersController
- Admin gali pridėti/pašalinti narius, valdyti permissions

**Use Case:** PAA9

---

### **2. BudgetController (Admin)**

**Kur naudojamas:**
```
ReceiptAndBudgetPage (MemberSubsystem.Views)
  ├── Čekiai (visi mato)
  ├── Biudžeto peržiūra (visi mato)
  └── "Valdyti biudžetą" sekcija (tik admin)
       └── BudgetController  ← Admin controller
```

**Funkcionalumas:**
- Member: tik mato biudžetą (ReceiptAndBudgetController)
- Admin: gali nustatyti limitus, valdyti kategorijas (BudgetController)

**Use Case:** PAA6

---

### **3. InventoryAccessController**

**Kur naudojamas:**
```
InventoryPage (MemberSubsystem.Views)
  ├── Produktų sąrašas (visi mato)
  └── "Valdyti prieigą" mygtukas (tik admin)
       └── InventoryAccessController  ← Admin controller
```

**Funkcionalumas:**
- Admin mato settings mygtuką
- Paspaudus - dialogas su narių permissions valdymu

**Use Case:** PAA4

---

### **4. DealsUpdateController**

**Kur naudojamas:**
```
DealsPage (MemberSubsystem.Views)
  ├── Akcijų sąrašas (visi mato)
  └── "Atnaujinti akcijas" mygtukas (tik admin)
       └── DealsUpdateController  ← Admin controller
```

**Funkcionalumas:**
- Admin mato refresh/sync mygtuką
- Paspaudus - atnaujina akcijas iš store websites

**Use Case:** PAA3

---

### **5. FoodRulesController**

**Kur naudojamas:**
```
SettingsPage (MemberSubsystem.Views)
  ├── User settings (visi mato)
  └── "Maisto taisyklės" sekcija (tik admin)
       └── FoodRulesController  ← Admin controller
```

**Funkcionalumas:**
- Admin mato papildomą sekciją "Maisto taisyklės"
- Gali valdyti alergijas, dietas, restrictions

**Use Case:** PAA7

---

### **6. FoodSubstituteController**

**Kur naudojamas:**
```
ShoppingListScreen (MemberSubsystem.Views)
  ├── Shopping list (visi mato)
  └── "Siūlyti pakaitalus" funkcija (tik admin)
       └── FoodSubstituteController  ← Admin controller
```

**Funkcionalumas:**
- Admin mato "Substitute" mygtuką prie kiekvieno produkto
- Paspaudus - siūlo pakaitalus

**Use Case:** PAA8

---

### **7. BudgetAlertController**

**Kur naudojamas:**
```
ReceiptAndBudgetPage (MemberSubsystem.Views)
  └── "Biudžeto perspėjimai" nustatymai (tik admin)
       └── BudgetAlertController  ← Admin controller
```

**Funkcionalumas:**
- Admin gali nustatyti biudžeto limitus ir perspėjimus
- Sistema automatiškai siunčia perspėjimus

**Use Case:** PAA5

---

### **8. ExpirationAlertController**

**Kur naudojamas:**
```
InventoryPage (MemberSubsystem.Views)
  └── "Galiojimo perspėjimai" nustatymai (tik admin)
       └── ExpirationAlertController  ← Admin controller
```

**Funkcionalumas:**
- Admin gali nustatyti, prieš kiek dienų perspėti
- Sistema automatiškai siunčia perspėjimus

**Use Case:** PAA10

---

## ✅ **Išvada:**

### **Admin Controller'iai:**

1. ✅ Naudoja **tuos pačius Views** kaip Member (MemberSubsystem.Views)
2. ✅ Admin mato **papildomas funkcijas** tuose pačiuose Views
3. ✅ Papildomos funkcijos naudoja **Admin Controller'ius**
4. ✅ Permissions tikrinimas vyksta **per repository/permissions**

**Viskas logiška ir tvarkoje!** ✅


























