# 🏠 Dashboard - Kaip Jis Veiks Jūsų Sistemoje?

## ✅ **Taip, Dashboard bus jūsų sistemoje!**

**DashboardPage** (HomePage) jau egzistuoja ir yra **pagrindinis langas** jūsų aplikacijoje.

---

## 📋 **Ką Rodo Dashboard?**

DashboardPage rodo **santrauką** visų sistemos funkcijų:

1. **📅 Šiandienos maisto planas** (iš MealPlanner)
2. **⏰ Greitai pasibaigs produktai** (iš Inventory)
3. **⚡ Greiti veiksmai** (navigacija į kitus langus)
4. **🧾 Paskutinis čekis** (iš Receipts)

---

## 🎯 **Kaip Veiks su DashboardController?**

### **Dabar (StatelessWidget su mock data):**

```dart
class DashboardPage extends StatelessWidget {
  // Naudoja mock data (_mockMeals, _expiringSoonProducts, _latestReceipt)
}
```

### **Ateityje (su DashboardController/BLoC):**

```dart
class DashboardPage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return BlocBuilder<DashboardBloc, DashboardState>(
      builder: (context, state) {
        if (state is DashboardLoading) {
          return CircularProgressIndicator();
        }
        
        if (state is DashboardLoaded) {
          return ListView(
            children: [
              _TodayMealsCard(meals: state.todayMeals),
              _ExpiringSoonCard(products: state.expiringProducts),
              _QuickActionsGrid(),
              _LatestReceiptCard(receipt: state.latestReceipt),
            ],
          );
        }
        
        return ErrorWidget(state.error);
      },
    );
  }
}
```

---

## 🔄 **DashboardController Funkcionalumas**

### **Ką valdo DashboardController (DashboardBloc)?**

Pagal jūsų architektūrą:

| Funkcija | Ką valdo | Iš kur duomenys? |
|----------|----------|------------------|
| **Šiandienos planas** | `MealPlan` (read-only) | `IMealPlanRepository` |
| **Greitai pasibaigs** | `Product[]` (read-only) | `IInventoryRepository` |
| **Paskutinis čekis** | `Receipt` (read-only) | `IReceiptRepository` |
| **Statistikos** | Aggregate data | Keli repository |

**Išvada:** DashboardController valdo **3 entity** (read-only):
- `Product` (iš Inventory)
- `MealPlan` (iš MealPlanner)
- `Receipt` (iš Receipts)

---

## 📊 **Architektūra: DashboardController**

### **Struktūra:**

```
DashboardPage (Views)
    ↓
DashboardBloc (Controller)
    ↓
    ├──→ IMealPlanRepository → gauti šiandienos planą
    ├──→ IInventoryRepository → gauti greitai pasibaigs produktus
    └──→ IReceiptRepository → gauti paskutinį čekį
```

### **Kaip veiks:**

1. **DashboardPage atidaromas:**
   - DashboardBloc išsiunčia `LoadDashboardEvent`

2. **DashboardBloc apdoroja:**
   - Gauna šiandienos `MealPlan` iš `IMealPlanRepository`
   - Gauna greitai pasibaigs `Product[]` iš `IInventoryRepository`
   - Gauna paskutinį `Receipt` iš `IReceiptRepository`

3. **DashboardBloc grąžina:**
   - `DashboardLoaded` state su visais duomenimis

4. **DashboardPage atsinaujina:**
   - Rodo visus duomenis iš state

---

## 💻 **Konkretus Kodo Pavyzdys**

### **DashboardBloc (Controller):**

```dart
// lib/features/dashboard/bloc/dashboard_bloc.dart
class DashboardBloc extends Bloc<DashboardEvent, DashboardState> {
  final IMealPlanRepository mealPlanRepository;
  final IInventoryRepository inventoryRepository;
  final IReceiptRepository receiptRepository;
  
  DashboardBloc({
    required this.mealPlanRepository,
    required this.inventoryRepository,
    required this.receiptRepository,
  }) : super(DashboardInitial()) {
    on<LoadDashboardEvent>(_onLoadDashboard);
    on<RefreshDashboardEvent>(_onRefreshDashboard);
  }
  
  Future<void> _onLoadDashboard(
    LoadDashboardEvent event,
    Emitter<DashboardState> emit,
  ) async {
    emit(DashboardLoading());
    
    try {
      // Gauname šiandienos planą
      final todayMeals = await mealPlanRepository.getTodayMeals();
      
      // Gauname greitai pasibaigs produktus
      final expiringProducts = await inventoryRepository.getExpiringProducts(
        days: 3,
      );
      
      // Gauname paskutinį čekį
      final latestReceipt = await receiptRepository.getLatestReceipt();
      
      emit(DashboardLoaded(
        todayMeals: todayMeals,
        expiringProducts: expiringProducts,
        latestReceipt: latestReceipt,
      ));
    } catch (e) {
      emit(DashboardError(message: e.toString()));
    }
  }
  
  Future<void> _onRefreshDashboard(
    RefreshDashboardEvent event,
    Emitter<DashboardState> emit,
  ) async {
    // Refresh logika
    add(LoadDashboardEvent());
  }
}
```

### **DashboardEvents:**

```dart
// lib/features/dashboard/bloc/dashboard_event.dart
abstract class DashboardEvent {}

class LoadDashboardEvent extends DashboardEvent {}
class RefreshDashboardEvent extends DashboardEvent {}
```

### **DashboardStates:**

```dart
// lib/features/dashboard/bloc/dashboard_state.dart
abstract class DashboardState {}

class DashboardInitial extends DashboardState {}
class DashboardLoading extends DashboardState {}
class DashboardLoaded extends DashboardState {
  final List<Meal> todayMeals;
  final List<Product> expiringProducts;
  final Receipt? latestReceipt;
  
  DashboardLoaded({
    required this.todayMeals,
    required this.expiringProducts,
    this.latestReceipt,
  });
}
class DashboardError extends DashboardState {
  final String message;
  DashboardError({required this.message});
}
```

### **DashboardPage (su BLoC):**

```dart
// lib/features/dashboard/pages/dashboard_page.dart
class DashboardPage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (context) => DashboardBloc(
        mealPlanRepository: getIt<IMealPlanRepository>(),
        inventoryRepository: getIt<IInventoryRepository>(),
        receiptRepository: getIt<IReceiptRepository>(),
      )..add(LoadDashboardEvent()),
      child: Scaffold(
        appBar: AppBar(
          title: const Text('Šaldytuvas+'),
          actions: [
            BlocBuilder<DashboardBloc, DashboardState>(
              builder: (context, state) {
                return IconButton(
                  icon: Icon(Icons.refresh),
                  onPressed: () {
                    context.read<DashboardBloc>().add(RefreshDashboardEvent());
                  },
                );
              },
            ),
            // ... notification button
          ],
        ),
        body: BlocBuilder<DashboardBloc, DashboardState>(
          builder: (context, state) {
            if (state is DashboardLoading) {
              return Center(child: CircularProgressIndicator());
            }
            
            if (state is DashboardError) {
              return ErrorWidget(message: state.message);
            }
            
            if (state is DashboardLoaded) {
              return ListView(
                padding: const EdgeInsets.all(16),
                children: [
                  _TodayMealsCard(meals: state.todayMeals),
                  const SizedBox(height: 16),
                  _ExpiringSoonCard(products: state.expiringProducts),
                  const SizedBox(height: 16),
                  _QuickActionsGrid(),
                  const SizedBox(height: 16),
                  _LatestReceiptCard(receipt: state.latestReceipt),
                ],
              );
            }
            
            return SizedBox.shrink();
          },
        ),
      ),
    );
  }
}
```

---

## 🔗 **Integracija su Kitais Controller'iais**

### **DashboardController NEGALI redaguoti duomenis:**

DashboardController yra **read-only** - jis tik **skaito** duomenis:

- ❌ Negali pridėti produktų (tai `InventoryController`)
- ❌ Negali redaguoti maisto planą (tai `MealPlannerController`)
- ❌ Negali pridėti čekių (tai `ReceiptController`)

### **DashboardController naviguoja į kitus langus:**

```dart
// Greiti veiksmai naviguoja į kitus langus:
onScan: () => Navigator.push(context, ScanPage()),
onAddProduct: () => Navigator.push(context, InventoryPage()),
onViewPromotions: () => Navigator.push(context, PromotionsPage()),
onScanReceipt: () => Navigator.push(context, ReceiptsPage()),
```

---

## 📊 **Diagramoje:**

### **Package Diagram:**

```
MemberSubsystem
  └── Views
      └── HomePage (DashboardPage)
  
MemberSubsystem
  └── Controllers
      └── DashboardController
```

### **Priklausomybės:**

```
DashboardController ──(uses)──> IMealPlanRepository
DashboardController ──(uses)──> IInventoryRepository
DashboardController ──(uses)──> IReceiptRepository

DashboardController ──(read-only)──> DomainModel.Entities.Product
DashboardController ──(read-only)──> DomainModel.Entities.MealPlan
DashboardController ──(read-only)──> DomainModel.Entities.Receipt
```

---

## ✅ **Išvada:**

### **Taip, Dashboard bus jūsų sistemoje:**

1. ✅ **DashboardPage** - jau egzistuoja (pagrindinis langas)
2. ✅ **DashboardController** (DashboardBloc) - sukursite
3. ✅ **Funkcionalumas:**
   - Rodo šiandienos maisto planą
   - Rodo greitai pasibaigs produktus
   - Rodo paskutinį čekį
   - Greiti veiksmai (navigacija)
4. ✅ **Read-only** - tik skaito duomenis, negali redaguoti

### **Kaip veiks:**

- DashboardController gauna duomenis iš **3 repository**
- Rodo santrauką visoms sistemos funkcijoms
- Naviguoja į kitus langus (greiti veiksmai)

**Dashboard = Pagrindinis langas su visos sistemos santrauka!** ✅


























