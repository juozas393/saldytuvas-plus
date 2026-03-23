# 🛒 ShoppingListController - Kodėl Tik Vienas?

## ✅ **Atsakymas: ShoppingListController turi būti tik MemberSubsystem!**

---

## ❌ **Problema (Klaida):**

### **Buvo (Neteisinga):**
```
MemberSubsystem.Controllers
  └── ShoppingListController ❌

AdminSubsystem.Controllers
  └── ShoppingListController ❌ (DUBLIAVIMAS!)
```

---

## ✅ **Sprendimas (Teisinga):**

### **Dabar (Teisinga):**
```
MemberSubsystem.Controllers
  └── ShoppingListController ✅ (VIENAS!)

AdminSubsystem.Controllers
  └── (Tuščia arba tik admin specifinės funkcijos)
```

---

## 🎯 **Kodėl?**

### **1. Shopping List yra BENDRAS Feature:**

- ✅ **Adminas** naudoja shopping list
- ✅ **Šeimos narys** naudoja shopping list
- ✅ **Visi** naudoja **TĄ PATĮ** shopping list (šeimos shopping list)

**Išvada:** Nėra reikalo turėti du controller'ius, kai jie valdo tą patį objektą!

---

### **2. Skiriasi Tik Teisės/Permissions:**

| Funkcija | Šeimos narys | Adminas |
|----------|--------------|---------|
| **Matyti shopping list** | ✅ | ✅ |
| **Pridėti produktus** | ✅ | ✅ |
| **Pažymėti kaip įsigytas** | ✅ | ✅ |
| **Redaguoti produktus** | ✅ (savo pridėtus) | ✅ (visus) |
| **Ištrinti produktus** | ✅ (savo pridėtus) | ✅ (visus) |
| **Valdyti šeimos narių teises** | ❌ | ✅ |

**Išvada:** Skiriasi tik **teisės** (permissions), bet ne controller'is!

---

### **3. Controller Valdo Funkcionalumą:**

```
ShoppingListController valdo:
  ├── Shopping list CRUD operacijas
  ├── Produktų pridėjimą
  ├── Produktų redagavimą
  └── Produktų pažymėjimą kaip "įsigytas"
```

**Išvada:** Controller'is yra tas pats - tik teisės skiriasi (valdoma per repository/permissions)!

---

## 🔄 **Kaip Veiks su Permissions?**

### **ShoppingListController su Permissions:**

```dart
class ShoppingListController {
  final IShoppingListRepository repository;
  final User currentUser; // ← Su role (Member arba Admin)
  
  Future<void> deleteItem(ShoppingListItem item) async {
    // Tikrinimas: ar vartotojas gali ištrinti?
    if (item.createdBy == currentUser.id || currentUser.isAdmin) {
      await repository.deleteItem(item);
    } else {
      throw PermissionDeniedException();
    }
  }
}
```

**Išvada:** Vienas controller, bet su permissions tikrinimu!

---

## 📊 **AdminSubsystem Funkcijos:**

### **Ką turėtų valdyti AdminSubsystem?**

AdminSubsystem turėtų valdyti tik **admin specifines** funkcijas:

- ✅ Šeimos narių valdymas (pridėti/pašalinti narius)
- ✅ Narių permissions valdymas
- ✅ Šeimos nustatymų valdymas
- ❌ Shopping list (bendras feature)

**Išvada:** Shopping list nėra admin specifinė funkcija - tai bendras feature!

---

## ✅ **Išvada:**

### **ShoppingListController turi būti tik MemberSubsystem, nes:**

1. ✅ Shopping list yra **bendras feature** (naudojamas visais)
2. ✅ Adminas ir narys naudoja **tą patį** shopping list
3. ✅ Skiriasi tik **teisės** (permissions), bet ne controller'is
4. ✅ Permissions tikrinimas vyksta per **repository/permissions**, ne per controller'į

### **Koreguota struktūra:**

```
MemberSubsystem.Controllers
  └── ShoppingListController ✅ (vienas, bendras)

AdminSubsystem.Controllers
  └── (tik admin specifinės funkcijos, jei reikia)
```

**ShoppingListController = Bendras feature = Tik MemberSubsystem!** ✅


























