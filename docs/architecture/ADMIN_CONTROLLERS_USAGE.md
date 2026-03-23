# 🎛️ Admin Controller'iai - Kur Juos Naudojame?

## 🔍 **Pagrindinis Klausimas:**

**Kur naudojami admin controller'iai? Ar turi savo Views, ar naudoja tuos pačius?**

---

## 🎯 **Atsakymas:**

### **Admin Controller'iai NAUDOJA tuos pačius Views kaip Member, bet su ADMIN PERMISSIONS:**

```
AdminSubsystem.Controllers
  ↓ (naudojami per)
MemberSubsystem.Views (su admin permissions)
```

**Privilegijų skirtumas:**
- **Member:** Ribotos teisės (read-only arba tik savo duomenys)
- **Admin:** Pilnos teisės (CRUD visos šeimos duomenims)

---

## 📋 **Konkretūs Pavyzdžiai:**

### **1. FamilyMembersController**

**Kur naudojamas:**
- `ProfilePage` (MemberSubsystem.Views) - admin mato papildomą sekciją "Valdyti šeimos narius"
- ARBA atskiras `FamilyMembersAdminPage` (jei reikia)

**Funkcionalumas:**
```dart
// ProfilePage su admin permissions
if (currentUser.isAdmin) {
  // Rodo "Valdyti narius" mygtuką
  FamilyMembersAdminSection()  // Naudoja FamilyMembersController
}
```

**Use Case:** PAA9 - Valdyti šeimos narius

---

### **2. MealPlanningController (Admin permissions)**

**Kur naudojamas:**
- `MealPlanningPage` (MemberSubsystem.Views) - admin mato papildomus mygtukus

**Funkcionalumas:**
```dart
// MealPlanningPage
BlocBuilder<MealPlanningController, MealPlanningState>(
  builder: (context, state) {
    return Column(
      children: [
        // Planas (visi mato)
        MealPlanList(plans: state.plans),
        
        // Admin funkcijos
        if (currentUser.isAdmin)
          AdminActionsSection(
            onCreate: () => controller.add(CreateMealPlanEvent()),
            onEdit: () => controller.add(EditMealPlanEvent()),
            onDelete: () => controller.add(DeleteMealPlanEvent()),
          ),
      ],
    );
  },
)
```

**Use Case:** PAA2, PAA12, PAA13, PAA14

---

### **3. BudgetController (Admin)**

**Kur naudojamas:**
- `ReceiptAndBudgetPage` (MemberSubsystem.Views) - admin mato papildomą sekciją

**Funkcionalumas:**
```dart
// ReceiptAndBudgetPage
BlocBuilder<BudgetController, BudgetState>(
  builder: (context, state) {
    return Column(
      children: [
        // Biudžeto peržiūra (visi mato)
        BudgetOverview(budget: state.budget),
        
        // Admin valdymas
        if (currentUser.isAdmin)
          BudgetManagementSection(
            // Naudoja BudgetController su admin permissions
          ),
      ],
    );
  },
)
```

**Use Case:** PAA6 - Valdyti biudžetą

---

### **4. InventoryAccessController**

**Kur naudojamas:**
- `InventoryPage` (MemberSubsystem.Views) - admin mato "Valdyti prieigą" mygtuką

**Funkcionalumas:**
```dart
// InventoryPage
if (currentUser.isAdmin) {
  IconButton(
    icon: Icon(Icons.settings),
    onPressed: () {
      // Atidaro dialogą su InventoryAccessController
      showDialog(
        context: context,
        builder: (_) => InventoryAccessDialog(),
      );
    },
  );
}
```

**Use Case:** PAA4 - Valdyti prieigą bendro inventoriaus

---

### **5. DealsUpdateController**

**Kur naudojamas:**
- `DealsPage` (MemberSubsystem.Views) - admin mato "Atnaujinti akcijas" mygtuką

**Funkcionalumas:**
```dart
// DealsPage
AppBar(
  actions: [
    if (currentUser.isAdmin)
      IconButton(
        icon: Icon(Icons.refresh),
        onPressed: () {
          // Naudoja DealsUpdateController
          context.read<DealsUpdateController>().add(UpdateDealsEvent());
        },
      ),
  ],
)
```

**Use Case:** PAA3 - Atnaujinti akcijas

---

### **6. FoodRulesController**

**Kur naudojamas:**
- `SettingsPage` (MemberSubsystem.Views) - admin mato "Maisto taisyklės" sekciją

**Funkcionalumas:**
```dart
// SettingsPage
if (currentUser.isAdmin) {
  SettingsSection(
    title: 'Maisto taisyklės',
    // Naudoja FoodRulesController
    child: FoodRulesManagement(),
  );
}
```

**Use Case:** PAA7 - Peržiūrėti maisto taisykles

---

### **7. FoodSubstituteController**

**Kur naudojamas:**
- `ShoppingListScreen` (MemberSubsystem.Views) - admin mato "Siūlyti pakaitalus" funkciją

**Funkcionalumas:**
```dart
// ShoppingListScreen
ShoppingListItemTile(
  item: item,
  onSubstitute: currentUser.isAdmin
    ? () => context.read<FoodSubstituteController>().add(
        SuggestSubstituteEvent(item),
      )
    : null,
)
```

**Use Case:** PAA8 - Siūlyti maisto pakaitalus

---

### **8. BudgetAlertController**

**Kur naudojamas:**
- `ReceiptAndBudgetPage` (MemberSubsystem.Views) - admin nustato perspėjimus

**Funkcionalumas:**
```dart
// ReceiptAndBudgetPage
if (currentUser.isAdmin) {
  BudgetAlertSettings(
    // Naudoja BudgetAlertController
    onSetAlert: (limit) {
      context.read<BudgetAlertController>().add(
        SetBudgetAlertEvent(limit: limit),
      );
    },
  );
}
```

**Use Case:** PAA5 - Perspėti apie biudžeto būseną

---

### **9. ExpirationAlertController**

**Kur naudojamas:**
- `InventoryPage` (MemberSubsystem.Views) - admin nustato perspėjimus

**Funkcionalumas:**
```dart
// InventoryPage
if (currentUser.isAdmin) {
  SettingsSection(
    title: 'Galiojimo perspėjimai',
    // Naudoja ExpirationAlertController
    child: ExpirationAlertSettings(),
  );
}
```

**Use Case:** PAA10 - Įspėti apie artėjančią galiojimo pabaigą

---

## ✅ **Išvada:**

### **Admin Controller'iai NAUDOJA tuos pačius Views:**

1. ✅ **Admin controller'iai** yra AdminSubsystem.Controllers
2. ✅ **Views** yra MemberSubsystem.Views (bendri)
3. ✅ **Adminas** mato papildomas funkcijas tuose pačiuose Views (su permissions)

**Arba galima turėti atskiras admin Views, bet tai nėra būtina!**

---

## 🎯 **Struktūra:**

```
MemberSubsystem.Views (bendri visiems)
  ↓ (naudojami su)
AdminSubsystem.Controllers (admin funkcijos)
  ↓
DomainModel.Entities
Services
Repositories
```

**Tai yra logiška!** ✅


























