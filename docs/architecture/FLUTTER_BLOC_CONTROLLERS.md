# 🎛️ Flutter BLoC Controller'iai - Jūsų sistemoje

> **FRAMEWORK:** Flutter (Dart)  
> **CONTROLLER'IAI:** BLoC (Business Logic Component)  
> **PATTERN:** Event-driven state management

---

## ✅ JŪSŲ FRAMEWORK

### Kas yra jūsų projekte:

- ✅ **Flutter** - Mobile/Web framework
- ✅ **BLoC pattern** - State management (pagal `.cursor/rules/rules.mdc`)
- ✅ **Clean Architecture** - Presentation → Domain → Data

---

## 🎯 Robustumo diagramoje "Controller" = Flutter BLoC

### Kaip tai veikia:

**Robustumo diagrama (abstraktus terminas):**
```
Controller = Verslo logika
```

**Jūsų Flutter projekte (realus implementavimas):**
```
Controller = BLoC objektas
```

---

## 📋 Flutter Controller'iai = BLoC objektai

### Jūsų sistemoje visi Controller'iai yra BLoC:

| Robustumo diagramoje | Jūsų Flutter projekte | Tipas |
|---------------------|----------------------|-------|
| **InventoryBloc** (Controller) | `class InventoryBloc extends Bloc<...>` | BLoC |
| **MealPlannerBloc** (Controller) | `class MealPlannerBloc extends Bloc<...>` | BLoC |
| **ReceiptBloc** (Controller) | `class ReceiptBloc extends Bloc<...>` | BLoC |
| **BudgetBloc** (Controller) | `class BudgetBloc extends Bloc<...>` | BLoC |
| ir t.t. | | |

---

## 🔄 Kaip veikia Flutter BLoC Controller'iai

### BLoC pattern struktūra:

```
UI Boundary (Langas)
    ↓
Events (AddProductEvent, LoadProductsEvent, ir t.t.)
    ↓
BLoC Controller (InventoryBloc)
    ↓
States (InventoryLoading, InventoryLoaded, InventoryError)
    ↓
UI Boundary (Langas) - atsinaujina
```

### Pavyzdys: InventoryBloc

```dart
// Events
class LoadProductsEvent {}
class AddProductEvent {
  final Product product;
  AddProductEvent(this.product);
}

// States
class InventoryInitial {}
class InventoryLoading {}
class InventoryLoaded {
  final List<Product> products;
  InventoryLoaded(this.products);
}
class InventoryError {
  final String message;
  InventoryError(this.message);
}

// BLoC Controller
class InventoryBloc extends Bloc<InventoryEvent, InventoryState> {
  final IInventoryRepository repository;
  
  InventoryBloc({required this.repository}) 
    : super(InventoryInitial()) {
    on<LoadProductsEvent>(_onLoadProducts);
    on<AddProductEvent>(_onAddProduct);
  }
  
  Future<void> _onLoadProducts(LoadProductsEvent event, Emitter emit) async {
    emit(InventoryLoading());
    try {
      final products = await repository.getProducts();
      emit(InventoryLoaded(products));
    } catch (e) {
      emit(InventoryError(e.toString()));
    }
  }
  
  Future<void> _onAddProduct(AddProductEvent event, Emitter emit) async {
    try {
      await repository.addProduct(event.product);
      add(LoadProductsEvent()); // Persikrauname sąrašą
    } catch (e) {
      emit(InventoryError(e.toString()));
    }
  }
}
```

---

## 🆚 Skirtingi framework'ai, skirtingi controller'iai

### Palyginimas:

| Framework | Controller Tipas | Kaip atrodo | Kur naudojamas |
|-----------|-----------------|-------------|----------------|
| **Flutter** (jūsų) | BLoC | `class XBloc extends Bloc<Event, State>` | Mobile/Web apps |
| **Django** | View | `class ProductView(View):` | Web backend |
| **ASP.NET** | Controller | `class ProductsController : Controller` | Web backend |
| **Spring Boot** | REST Controller | `@RestController class ProductController` | Web backend |

---

## ✅ Jūsų Flutter Controller'iai

### Visi jūsų controller'iai bus BLoC objektai:

```dart
// lib/features/inventory/bloc/inventory_bloc.dart
class InventoryBloc extends Bloc<InventoryEvent, InventoryState> { ... }

// lib/features/meal_planner/bloc/meal_planner_bloc.dart
class MealPlannerBloc extends Bloc<MealPlannerEvent, MealPlannerState> { ... }

// lib/features/receipts/bloc/receipt_bloc.dart
class ReceiptBloc extends Bloc<ReceiptEvent, ReceiptState> { ... }

// ir t.t.
```

---

## 📊 BLoC Controller'ių struktūra jūsų projekte

### Kiekvienas BLoC turi:

1. **Events** - kas gali nutikti (pvz., `LoadProductsEvent`, `AddProductEvent`)
2. **States** - kokios būsenos gali būti (pvz., `InventoryLoading`, `InventoryLoaded`)
3. **BLoC klasė** - logika, kuri transformuoja Events → States

### Failų struktūra:

```
lib/features/inventory/bloc/
  ├── inventory_bloc.dart           ← BLoC klasė
  ├── inventory_event.dart          ← Events
  └── inventory_state.dart          ← States
```

---

## 🎯 Išvada

### Jūsų sistema:

- ✅ **Framework:** Flutter
- ✅ **Controller'iai:** BLoC objektai (`extends Bloc<Event, State>`)
- ✅ **Dependencies:** Reikės pridėti `flutter_bloc` į `pubspec.yaml`
- ✅ **Pattern:** Event-driven, reaktyvus state management

**Robustumo diagramoje "Controller" = Flutter projekte "BLoC"** ✅

---

**Data:** 2025-01-XX  
**Status:** ✅ Flutter BLoC architektūra



























