# 🎛️ Flutter Controller'iai - Kuo skiriasi nuo kitų framework'ų?

> **JŪSŲ FRAMEWORK:** Flutter (Dart kalba)  
> **STATE MANAGEMENT:** BLoC pattern (pagal `.cursor/rules/rules.mdc`)

---

## 🔍 Jūsų framework ir controller'iai

### ✅ Jūsų sistema naudoja:

- **Framework:** Flutter
- **State Management:** BLoC (Business Logic Component) pattern
- **Controller'iai:** BLoC/Cubit objektai
- **Dependency Injection:** `get_it` arba `riverpod` (pagal rules)

---

## 📊 Skirtingi framework'ai, skirtingi controller'iai

### 1. **Flutter (jūsų sistema)** ✅

**Controller'iai:** BLoC/Cubit

```dart
// Jūsų controller'iai būtų BLoC objektai:
class InventoryBloc extends Bloc<InventoryEvent, InventoryState> {
  final IInventoryRepository repository;
  
  InventoryBloc({required this.repository}) : super(InventoryInitial()) {
    on<LoadProductsEvent>(_onLoadProducts);
    on<AddProductEvent>(_onAddProduct);
  }
  
  Future<void> _onLoadProducts(LoadProductsEvent event, Emitter emit) async {
    emit(InventoryLoading());
    try {
      final products = await repository.getProducts();
      emit(InventoryLoaded(products: products));
    } catch (e) {
      emit(InventoryError(message: e.toString()));
    }
  }
}
```

**Kur naudojama:** Mobile apps (Android, iOS, Web)

---

### 2. **Django (Python Web Framework)**

**Controller'iai:** Views (Class-based Views arba Function Views)

```python
# Django controller'iai būtų Views:
class ProductListView(ListView):
    model = Product
    template_name = 'products/list.html'
    
    def get_queryset(self):
        return Product.objects.filter(user=self.request.user)

class ProductCreateView(CreateView):
    model = Product
    fields = ['name', 'quantity', 'expiry_date']
    success_url = '/products/'
```

**Kur naudojama:** Web applications (backend)

---

### 3. **ASP.NET Core (C# Web Framework)**

**Controller'iai:** MVC Controllers

```csharp
// .NET controller'iai būtų Controller klasės:
public class ProductsController : Controller
{
    private readonly IInventoryRepository _repository;
    
    public ProductsController(IInventoryRepository repository)
    {
        _repository = repository;
    }
    
    public async Task<IActionResult> Index()
    {
        var products = await _repository.GetProductsAsync();
        return View(products);
    }
    
    [HttpPost]
    public async Task<IActionResult> Create(Product product)
    {
        await _repository.AddProductAsync(product);
        return RedirectToAction(nameof(Index));
    }
}
```

**Kur naudojama:** Web applications (backend)

---

### 4. **Spring Boot (Java Web Framework)**

**Controller'iai:** REST Controllers

```java
// Spring Boot controller'iai būtų @RestController:
@RestController
@RequestMapping("/api/products")
public class ProductController {
    
    @Autowired
    private ProductService productService;
    
    @GetMapping
    public List<Product> getProducts() {
        return productService.getAllProducts();
    }
    
    @PostMapping
    public Product createProduct(@RequestBody Product product) {
        return productService.createProduct(product);
    }
}
```

**Kur naudojama:** Web applications (backend)

---

## ✅ JŪSŲ FLUTTER SISTEMA

### Flutter Controller'iai = BLoC

Jūsų projekte controller'iai yra **BLoC objektai**, nes:

1. **Flutter yra UI framework** - reikia state management
2. **BLoC yra Flutter state management pattern** - rekomenduojamas Flutter dokumentacijoje
3. **Jūsų rules nurodo BLoC** - `.cursor/rules/rules.mdc` kalba apie "BLoC/Cubit"

---

## 🎯 Flutter BLoC Controller'iai jūsų sistemoje

### Controller'ių struktūra:

| Controller Tipas | Framework | Kaip veikia |
|-----------------|-----------|-------------|
| **BLoC** | Flutter | Events → States pattern, reaktyvus state management |
| **View** | Django | HTTP request → response, template rendering |
| **Controller** | ASP.NET | HTTP request → response, model binding |
| **REST Controller** | Spring Boot | HTTP request → JSON response |

---

## 📋 Flutter BLoC Controller'ių pavyzdys

### Kaip atrodo jūsų controller'iai:

```dart
// lib/features/inventory/bloc/inventory_bloc.dart
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:equatable/equatable.dart';

// Events
abstract class InventoryEvent extends Equatable {
  const InventoryEvent();
}

class LoadProductsEvent extends InventoryEvent {
  const LoadProductsEvent();
  
  @override
  List<Object?> get props => [];
}

class AddProductEvent extends InventoryEvent {
  final Product product;
  
  const AddProductEvent(this.product);
  
  @override
  List<Object?> get props => [product];
}

// States
abstract class InventoryState extends Equatable {
  const InventoryState();
}

class InventoryInitial extends InventoryState {
  @override
  List<Object?> get props => [];
}

class InventoryLoading extends InventoryState {
  @override
  List<Object?> get props => [];
}

class InventoryLoaded extends InventoryState {
  final List<Product> products;
  
  const InventoryLoaded({required this.products});
  
  @override
  List<Object?> get props => [products];
}

class InventoryError extends InventoryState {
  final String message;
  
  const InventoryError({required this.message});
  
  @override
  List<Object?> get props => [message];
}

// BLoC Controller
class InventoryBloc extends Bloc<InventoryEvent, InventoryState> {
  final IInventoryRepository repository;
  
  InventoryBloc({required this.repository}) : super(InventoryInitial()) {
    on<LoadProductsEvent>(_onLoadProducts);
    on<AddProductEvent>(_onAddProduct);
  }
  
  Future<void> _onLoadProducts(
    LoadProductsEvent event,
    Emitter<InventoryState> emit,
  ) async {
    emit(InventoryLoading());
    try {
      final products = await repository.getProducts();
      emit(InventoryLoaded(products: products));
    } catch (e) {
      emit(InventoryError(message: e.toString()));
    }
  }
  
  Future<void> _onAddProduct(
    AddProductEvent event,
    Emitter<InventoryState> emit,
  ) async {
    try {
      await repository.addProduct(event.product);
      // Po pridėjimo, persikrauname sąrašą
      add(const LoadProductsEvent());
    } catch (e) {
      emit(InventoryError(message: e.toString()));
    }
  }
}
```

---

## 🔄 Kaip Flutter BLoC skiriasi nuo kitų framework'ų?

### Flutter BLoC:

- **Reaktyvus** - state keičiasi, UI automatiškai atsinaujina
- **Event-driven** - Events → BLoC → States → UI
- **Testuojamas** - galima testuoti be UI
- **Separation of concerns** - verslo logika atskirta nuo UI

### Django Views:

- **Request-response** - HTTP request → View → HTTP response
- **Server-side** - vykdoma serveryje
- **Template rendering** - HTML generavimas

### ASP.NET Controllers:

- **MVC pattern** - Model-View-Controller
- **Server-side** - vykdoma serveryje
- **HTTP endpoints** - REST API arba MVC views

---

## ✅ Jūsų sistemoje naudojami Controller'iai

### BLoC Controller'iai (Flutter pattern):

1. **InventoryBloc** - valdo Product + InventoryItem
2. **MealPlannerBloc** - valdo Meal + MealPlan
3. **ReceiptBloc** - valdo Receipt + ReceiptItem
4. **ShoppingListBloc** - valdo ShoppingList + ShoppingListItem
5. **BudgetBloc** - valdo Budget
6. **PromotionsBloc** - valdo Deal
7. **RecipeBloc** - valdo Recipe
8. **AuthBloc** - valdo User authentication
9. **ProfileBloc** - valdo User profile
10. **DashboardBloc** - valdo santraukas (read-only)
11. **ScanBloc** - valdo skanavimo procesą
12. **SettingsBloc** - valdo lokalius nustatymus

**Iš viso:** 12 BLoC controller'ių

---

## 📊 Palyginimas su kitais framework'ais

| Framework | Controller Tipas | Kur naudojamas | Kaip veikia |
|-----------|-----------------|----------------|-------------|
| **Flutter** | BLoC/Cubit | Mobile/Web apps | Events → States → UI (reaktyvus) |
| **Django** | Views | Web backend | HTTP Request → Response (server-side) |
| **ASP.NET** | MVC Controllers | Web backend | HTTP Request → Response (server-side) |
| **Spring Boot** | REST Controllers | Web backend | HTTP Request → JSON Response |
| **React** | Hooks/Redux | Web frontend | State → UI (reaktyvus) |
| **Angular** | Components/Services | Web frontend | Dependency Injection + Services |

---

## 🎯 Išvada

### Jūsų sistema:

- ✅ **Framework:** Flutter
- ✅ **Controller'iai:** BLoC objektai
- ✅ **State Management:** flutter_bloc paketas
- ✅ **Pattern:** Event-driven, reaktyvus

**Jūs NENAUDOJATE:**
- ❌ Django Views
- ❌ ASP.NET Controllers
- ❌ Spring Boot REST Controllers

**Jūs NAUDOJATE:**
- ✅ Flutter BLoC Controller'ius

---

**Data:** 2025-01-XX  
**Status:** ✅ Flutter BLoC architektūra



























