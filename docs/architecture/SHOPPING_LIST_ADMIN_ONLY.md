# 🛒 Shopping List - Tik Admin Gali Sudaryti

## ✅ **Korekcija:**

Jei **tik admin gali sudaryti** pirkinių sąrašą, tai struktūra yra:

---

## 📋 **STRUKTŪRA:**

### **ShoppingListController:**

```
AdminSubsystem.Controllers
  └── ShoppingListController ✅ (tik admin)
```

**Pastaba:** MemberSubsystem neturi ShoppingListController, nes member negali sudaryti sąrašo.

---

## 🎯 **FUNKCIONALUMAS:**

### **Member (Peržiūra):**
```
Member → ShoppingListScreen
  ↓
Matyti sąrašą (read-only)
  ↓
DealsController arba tiesiogiai repository (tik skaitymas)
```

**Member NEGALI:**
- ❌ Pridėti produktų
- ❌ Redaguoti sąrašo
- ❌ Ištrinti produktų

### **Admin (Valdymas):**
```
Admin → ShoppingListScreen
  ↓
ShoppingListController (AdminSubsystem)
  ↓
- Pridėti produktus
- Redaguoti sąrašą
- Ištrinti produktus
- Valdyti sąrašą
```

**Admin GALI:**
- ✅ Sudaryti sąrašą
- ✅ Pridėti produktus
- ✅ Redaguoti sąrašą
- ✅ Ištrinti produktus

---

## 📊 **PALYGINIMAS:**

| Funkcija | Member | Admin |
|----------|--------|-------|
| **Matyti sąrašą** | ✅ Read-only | ✅ Matyti |
| **Sudaryti sąrašą** | ❌ | ✅ |
| **Pridėti produktus** | ❌ | ✅ |
| **Redaguoti sąrašą** | ❌ | ✅ |
| **Ištrinti produktus** | ❌ | ✅ |

---

## ✅ **ARCHITEKTŪRA:**

### **Member Flow:**
```
ShoppingListScreen (MemberSubsystem.Views)
  ↓ (read-only view)
IDealsRepository.getShoppingList() (tiesiogiai arba per DealsController)
```

### **Admin Flow:**
```
ShoppingListScreen (MemberSubsystem.Views)
  ↓ (su admin permissions)
ShoppingListController (AdminSubsystem.Controllers)
  ↓
IShoppingListRepository
```

---

## ✅ **IŠVADA:**

### **ShoppingListController turi būti AdminSubsystem, nes:**

1. ✅ **Tik admin gali sudaryti** sąrašą
2. ✅ **Member tik mato** (read-only)
3. ✅ **Controller'is reikalingas tik admin'ui** (valdymas)

**Struktūra:**
```
MemberSubsystem.Controllers
  └── (nėra ShoppingListController)

AdminSubsystem.Controllers
  └── ShoppingListController ✅ (tik admin)
```

**Viskas tvarkoje!** ✅


























