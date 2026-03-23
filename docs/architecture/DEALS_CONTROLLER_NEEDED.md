# 🎯 Deals Controller - Ar Reikia?

## ✅ **Atsakymas: TAIP, `DealsController` REIKIA!**

---

## 📋 **KODĖL REIKIA CONTROLLER'IO?**

### **Flutter BLoC Architektūra:**

```
View (Page) → Controller (BLoC) → Repository → Database
```

**Be controller'io page negali funkcionuoti!**

---

## 🎯 **KAS YRA DEALS PAGE?**

### **DealsPage turi:**

1. ✅ **Rodyti nuolaidų sąrašą** (state management)
2. ✅ **Filtruoti pagal store** (Maxima, Lidl, IKI, Rimi)
3. ✅ **Sortuoti pagal kainą, nuolaidą** (business logic)
4. ✅ **Rodyti loading state** (state management)
5. ✅ **Rodyti error state** (state management)
6. ✅ **Navigacija į StoreDealsPage** (navigation)

---

## ✅ **KODĖL REIKIA CONTROLLER'IO?**

### **1. State Management:**

```dart
// Be controller'io - NEVEIKIA
DealsPage
  // Kaip saugoti deals list?
  // Kaip rodyti loading?
  // Kaip rodyti error?
```

```dart
// Su controller'iu - VEIKIA
DealsPage
  ↓
DealsController (BLoC)
  ↓
- DealsState (loading, loaded, error)
- DealsList (List<Deal>)
- Filters (store, category, ir t.t.)
```

---

### **2. Business Logic:**

```
DealsController valdo:
- Filtravimas pagal store
- Sortavimas pagal kainą/nuolaidą
- Kategorijų filtravimas
- Search funkcionalumas
```

---

### **3. Data Fetching:**

```
DealsPage
  ↓
DealsController
  ↓
IDealsRepository.getDeals()
  ↓
SupabaseGateway
  ↓
Supabase
```

---

## ✅ **STRUKTŪRA:**

### **MemberSubsystem:**

**Views:**
- ✅ `DealsPage` - Peržiūrėti nuolaidas
- ✅ `StoreDealsPage` - Nuolaidos pagal store

**Controllers:**
- ✅ `DealsController` - Valdo nuolaidų peržiūrą

---

## 📊 **PALYGINIMAS:**

| Funkcija | Be Controller'io | Su Controller'iu |
|----------|------------------|------------------|
| **Rodyti sąrašą** | ❌ Neįmanoma | ✅ DealsController |
| **State management** | ❌ Neįmanoma | ✅ DealsController |
| **Filtravimas** | ❌ Neįmanoma | ✅ DealsController |
| **Loading/Error** | ❌ Neįmanoma | ✅ DealsController |

---

## ✅ **GALUTINĖ IŠVADA:**

### **`DealsController` REIKIA, nes:**

1. ✅ **Flutter BLoC architektūra** reikalauja: View → Controller → Repository
2. ✅ **State management** - loading, loaded, error states
3. ✅ **Business logic** - filtravimas, sortavimas
4. ✅ **Data fetching** - kreipimasis į repository

**Page be controller'io negali funkcionuoti Flutter aplikacijoje!**

---

## 📋 **ARCHITEKTŪRA:**

```
DealsPage (MemberSubsystem.Views)
  ↓
DealsController (MemberSubsystem.Controllers)
  ↓
IDealsRepository
  ↓
SupabaseGateway
  ↓
Supabase
```

**Viskas tvarkoje!** ✅


























