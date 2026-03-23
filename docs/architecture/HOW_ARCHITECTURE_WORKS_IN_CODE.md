# 🏗️ Kaip Loginė Architektūra Veikia Jūsų Kode?

> **SVARBU:** Ši diagrama yra **LOGINĖ**, bet jūsų **FIZINĖ struktūra** bus feature-based. Štai kaip tai veiks!

---

## 📊 Diagrama vs Realus Kodas

### **Diagramoje (Loginė):**
```
MemberSubsystem
  └── Controllers
      └── InventoryController
```

### **Jūsų kode (Fizinė):**
```
lib/features/inventory/
  └── bloc/
      └── inventory_bloc.dart  ← Tai yra InventoryController!
```

**Išvada:** Diagrama rodo LOGINĘ struktūrą, o kodas - FIZINĘ. Abi yra teisingos! ✅

---

## ✅ Konkretus Pavyzdys: Inventory Feature

### **1. Diagramoje (Loginė architektūra):**

```
Views → Controllers → Services → Repositories → ExternalServices
```

### **2. Jūsų kode (Fizinė struktūra):**

```
lib/features/inventory/
  ├── pages/
  │   └── inventory_page.dart          ← Views (Diagramoje)
  ├── bloc/
  │   ├── inventory_bloc.dart          ← Controllers (Diagramoje)
  │   ├── inventory_event.dart
  │   └── inventory_state.dart
  ├── models/
  │   ├── product.dart                 ← DomainModel.Entities (Diagramoje)
  │   └── inventory_item.dart
  └── repositories/
      ├── i_inventory_repository.dart  ← DataAccess.Repositories (Diagramoje)
      └── inventory_repository.dart

lib/services/
  └── receipt_parsing_service.dart     ← Services (Diagramoje)

lib/core/network/
  └── supabase_client.dart             ← Core.Network (Diagramoje)
```

**Išvada:** Taip, taip atrodys! ✅

---

## 🔄 Kaip Tai Veiks Praktiškai?

### **Pavyzdys 1: Pridėti produktą**

#### **Diagramoje:**
```
InventoryPage (Views)
  ↓
InventoryController (Controllers)
  ↓
IInventoryRepository (DataAccess)
  ↓
SupabaseGateway (DataAccess)
  ↓
SupabaseClient (Core)
```

#### **Jūsų kode:**

```dart
// 1. Views (lib/features/inventory/pages/inventory_page.dart)
class InventoryPage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return BlocBuilder<InventoryBloc, InventoryState>(
      builder: (context, state) {
        // UI naudoja BLoC state
        return ListView(
          children: state.products.map((product) => 
            ProductCard(product: product)
          ).toList(),
        );
      },
    );
  }
}

// 2. Controllers (lib/features/inventory/bloc/inventory_bloc.dart)
class InventoryBloc extends Bloc<InventoryEvent, InventoryState> {
  final IInventoryRepository repository; // ← Diagramoje: DataAccess
  
  InventoryBloc({required this.repository}) : super(InventoryInitial()) {
    on<LoadProductsEvent>(_onLoadProducts);
    on<AddProductEvent>(_onAddProduct);
  }
  
  Future<void> _onAddProduct(
    AddProductEvent event,
    Emitter<InventoryState> emit,
  ) async {
    emit(InventoryLoading());
    try {
      final product = await repository.addProduct(event.product); // ← Naudoja Repository
      emit(InventoryLoaded(products: [...state.products, product]));
    } catch (e) {
      emit(InventoryError(message: e.toString()));
    }
  }
}

// 3. Repositories (lib/features/inventory/repositories/i_inventory_repository.dart)
abstract class IInventoryRepository {
  Future<Product> addProduct(Product product);
}

// 4. Repository Implementation (lib/features/inventory/repositories/inventory_repository.dart)
class InventoryRepository implements IInventoryRepository {
  final SupabaseGateway gateway; // ← Diagramoje: DataAccess.SupabaseGateway
  
  InventoryRepository({required this.gateway});
  
  @override
  Future<Product> addProduct(Product product) async {
    final response = await gateway.insert('inventory_items', product.toJson()); // ← Naudoja Gateway
    return Product.fromJson(response);
  }
}

// 5. Gateway (lib/core/data/supabase_gateway.dart)
class SupabaseGateway {
  final SupabaseClient client; // ← Diagramoje: Core.Network.SupabaseClient
  
  Future<Map<String, dynamic>> insert(String table, Map<String, dynamic> data) async {
    return await client.from(table).insert(data).select().single();
  }
}
```

**Išvada:** Taip, TIKSLIAI taip veiks! ✅

---

## 🎯 Kaip Kurėsite Sistemą?

### **1. Feature-by-Feature (kaip dabar darote):**

```
✅ Sukurti lib/features/inventory/pages/       ← Views
⏳ Sukurti lib/features/inventory/bloc/        ← Controllers (dar nėra)
⏳ Sukurti lib/features/inventory/models/      ← Entities (dar nėra)
⏳ Sukurti lib/features/inventory/repositories/ ← Repositories (dar nėra)
```

### **2. Services (bendri, ne feature-based):**

```
lib/services/
  ├── meal_planning_service.dart     ← Diagramoje: Services.MealPlanningService
  ├── receipt_parsing_service.dart   ← Diagramoje: Services.ReceiptParsingService
  └── ...
```

### **3. Core (bendras infrastruktūra):**

```
lib/core/
  ├── network/
  │   └── supabase_client.dart       ← Diagramoje: Core.Network.SupabaseClient
  ├── errors/
  │   └── failures.dart              ← Diagramoje: Core.Errors.Failures
  └── ...
```

---

## ✅ Taip, Taip Naudosite!

### **Pagrindiniai Principai:**

1. **Feature-based fizinė struktūra:**
   ```
   lib/features/{feature_name}/
     ├── pages/      ← Views
     ├── bloc/       ← Controllers
     ├── models/     ← Entities
     └── repositories/ ← Repositories
   ```

2. **Bendri paketai:**
   ```
   lib/services/     ← Services (bendri visoms features)
   lib/core/         ← Core (infrastruktūra)
   ```

3. **Priklausomybės (kaip diagramoje):**
   ```
   Views → Controllers → Services → Repositories → Core
   ```

---

## 🎯 Išvada

**TAIP, tikrai taip naudosite savo sistemoje!**

- ✅ Diagrama rodo **loginę architektūrą** (priklausomybės)
- ✅ Jūsų kodas bus **feature-based** (fizinė struktūra)
- ✅ Abi yra **teisingos ir suderinamos**
- ✅ Kūrėsite **feature-by-feature** pagal diagramą

**Diagrama = PLANAS, kodas = ĮGYVENDINIMAS!** ✅


























