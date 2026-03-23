# ✅ Kodėl DealsController Reikia?

## ❓ **Klausimas:**

Ar reikia `DealsController`, ar galima tiesiog `DealsPage` be controller'io?

---

## ✅ **Atsakymas: REIKIA `DealsController`!**

---

## 🎯 **KODĖL REIKIA CONTROLLER'IO?**

### **Flutter BLoC Architektūra:**

```
Page (View) → Controller (BLoC) → Repository → Database
```

**Page be Controller'io NEGALI funkcionuoti!**

---

## 📋 **KAS YRA DEALS PAGE?**

### **DealsPage funkcionalumas:**

1. ✅ **Rodyti nuolaidų sąrašą** (reikia state management)
2. ✅ **Loading state** (reikia state management)
3. ✅ **Error state** (reikia state management)
4. ✅ **Filtravimas pagal store** (reikia business logic)
5. ✅ **Sortavimas** (reikia business logic)
6. ✅ **Search** (reikia business logic)

---

## ❌ **BE CONTROLLER'IO - NEVEIKIA:**

```dart
// DealsPage be Controller'io
class DealsPage extends StatelessWidget {
  // Kaip saugoti deals list?
  // Kaip rodyti loading?
  // Kaip rodyti error?
  // Kaip filtruoti?
  // ❌ NEĮMANOMA!
}
```

---

## ✅ **SU CONTROLLER'IU - VEIKIA:**

```dart
// DealsPage su Controller'iu
class DealsPage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return BlocBuilder<DealsController, DealsState>(
      builder: (context, state) {
        if (state is DealsLoading) {
          return LoadingWidget();
        }
        if (state is DealsError) {
          return ErrorWidget(state.message);
        }
        if (state is DealsLoaded) {
          return DealsList(deals: state.deals);
        }
      },
    );
  }
}
```

---

## 🎯 **ARCHITEKTŪRA:**

```
DealsPage (MemberSubsystem.Views)
  ↓
DealsController (MemberSubsystem.Controllers)
  ↓
  - Events: LoadDeals, FilterDeals, SortDeals
  - States: Loading, Loaded, Error
  ↓
IDealsRepository
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
- ✅ `DealsController` - **REIKIA!** Valdo state, logiką, data fetching

---

## 📊 **PALYGINIMAS:**

| Funkcija | Be Controller'io | Su Controller'iu |
|----------|------------------|------------------|
| **State management** | ❌ Neįmanoma | ✅ Controller |
| **Data fetching** | ❌ Neįmanoma | ✅ Controller |
| **Filtravimas** | ❌ Neįmanoma | ✅ Controller |
| **Loading/Error** | ❌ Neįmanoma | ✅ Controller |

---

## ✅ **GALUTINĖ IŠVADA:**

### **`DealsController` REIKIA, nes:**

1. ✅ **Flutter BLoC architektūra** - Page turi naudoti Controller
2. ✅ **State management** - loading, loaded, error states
3. ✅ **Business logic** - filtravimas, sortavimas
4. ✅ **Data fetching** - kreipimasis į repository

**Page be controller'io negali funkcionuoti Flutter aplikacijoje!**

---

## ✅ **DIAGRAMOJE:**

- ✅ `DealsPage` yra MemberSubsystem.Views
- ✅ `DealsController` yra MemberSubsystem.Controllers

**Viskas tvarkoje!** ✅


























