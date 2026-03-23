# 📍 Dashboard - Kur Jis Yra Jūsų Sistemoje?

## ✅ **Taip, turite atskirą Dashboard puslapį!**

---

## 📂 **Fizinė Lokacija**

### **Failo kelias:**

```
lib/features/dashboard/
  └── pages/
      └── dashboard_page.dart  ← Štai jis!
```

### **Pilnas kelias:**

```
lib/features/dashboard/pages/dashboard_page.dart
```

---

## 🎯 **Kur Jis Rodo?**

### **Dashboard yra PAGRINDINIS LANGAS (HomePage)**

Jis integruotas kaip **pirmasis langas** jūsų aplikacijoje:

```dart
// lib/app.dart
static final List<Widget> _pages = <Widget>[
  const DashboardPage(),        // ← Index 0 (PIRMASIS)
  const InventoryPage(),        // Index 1
  const MealPlannerPage(),      // Index 2
  const ShoppingListPage(),     // Index 3
  const PromotionsPage(),       // Index 4
  const ProfilePage(),          // Index 5
];

static final List<_Destination> _destinations = <_Destination>[
  _Destination(
    label: 'Pagrindinis',       // ← Dashboard
    icon: Icons.dashboard_outlined,
    selectedIcon: Icons.dashboard,
  ),
  // ... kiti langai
];
```

---

## 📱 **Kaip Jis Veikia?**

### **Bottom Navigation Bar:**

Dashboard yra **pirmasis mygtukas** apatinėje navigacijos juostoje:

```
┌─────────────────────────────────────┐
│                                     │
│      DashboardPage Content          │
│  (Šiandienos planas, produktai...)  │
│                                     │
│                                     │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│ [🏠 Pagrindinis] [📦] [🍽️] [🛒]... │  ← Bottom Navigation
└─────────────────────────────────────┘
      ↑
   Aktifuotas
```

### **Navigacija:**

- Paspaudus "Pagrindinis" mygtuką → atidaromas `DashboardPage`
- Tai yra **pradinis langas**, kai aplikacija atidaroma
- Vartotojas visada gali grįžti į Dashboard paspaudęs mygtuką

---

## 🔄 **Kodėl Jis Yra Atskiras Puslapis?**

### **DashboardPage yra atskiras feature:**

```
lib/features/
  ├── dashboard/          ← Atskiras feature
  │   └── pages/
  │       └── dashboard_page.dart
  │
  ├── inventory/          ← Kitas feature
  │   └── pages/
  │       └── inventory_page.dart
  │
  ├── meal_planner/       ← Kitas feature
  │   └── pages/
  │       └── meal_planner_page.dart
  └── ...
```

**Kodėl?**
- ✅ Kiekvienas feature turi savo folderį
- ✅ Dashboard yra atskiras feature su savo funkcionalumu
- ✅ Ateityje gali turėti savo BLoC, widgets, ir t.t.

---

## 📊 **Struktūra (Kaip Ateityje Bus)**

### **Dabar:**

```
lib/features/dashboard/
  └── pages/
      └── dashboard_page.dart  ← Tik puslapis
```

### **Ateityje (su BLoC):**

```
lib/features/dashboard/
  ├── pages/
  │   └── dashboard_page.dart
  ├── bloc/                    ← Sukursite
  │   ├── dashboard_bloc.dart
  │   ├── dashboard_event.dart
  │   └── dashboard_state.dart
  └── widgets/                 ← Galite pridėti
      └── dashboard_card.dart
```

---

## 🎯 **Išvada:**

### **Taip, turite atskirą Dashboard puslapį:**

1. ✅ **Lokacija:** `lib/features/dashboard/pages/dashboard_page.dart`
2. ✅ **Funkcija:** Pagrindinis langas (HomePage)
3. ✅ **Navigacija:** Pirmasis mygtukas bottom navigation bar
4. ✅ **Pavadinimas:** "Pagrindinis" (lithuanian)

### **Kaip jis integruotas:**

- Dashboard yra **pirmasis langas** (index 0) aplikacijoje
- Rodo **santrauką** visos sistemos
- Vartotojas gali **naviguoti** į kitus langus iš Dashboard

**Dashboard = Pagrindinis langas = HomePage!** ✅


























