# 🔗 Package Diagram Rysiai - Vizualus Paaiškinimas

## 🎯 **KAS YRA RYSYS (DEPENDENCY)?**

**Rysys** yra punktyrinė rodyklė `..>` arba ištisinė rodyklė `-->`, kuri parodo, kad vienas paketas **naudoja** arba **priklauso** nuo kito.

---

## 📊 **VIZUALUS PAVYZDYS:**

### **Kai paketas A naudoja paketą B:**

```
┌─────────────┐
│  Package A  │ ────..>───┐
└─────────────┘           │
                          ▼
                   ┌─────────────┐
                   │  Package B  │
                   └─────────────┘
```

**Reikšmė:**
- Package A **importuoja** klasės/funkcijas iš Package B
- Package A **priklauso** nuo Package B
- Package B gali egzistuoti be Package A
- Package A **negali** veikti be Package B

---

## 🔄 **KONKRETUS PAVYZDYS MŪSŲ SISTEMOJE:**

### **1. Views naudoja Controllers:**

```
┌──────────────────────┐
│  Presentation.Views  │ ────..>───┐
│  (InventoryPage)     │           │
└──────────────────────┘           │
                                   ▼
                          ┌────────────────────────┐
                          │ Presentation.Controllers│
                          │  (InventoryBloc)       │
                          └────────────────────────┘
```

**Flutter kodas:**
```dart
// lib/features/inventory/pages/inventory_page.dart
import 'package:saldytuvas_plus/features/inventory/bloc/inventory_bloc.dart'; // ← IMPORT

class InventoryPage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return BlocBuilder<InventoryBloc, InventoryState>( // ← NAUDOJA
      builder: (context, state) {
        // ...
      },
    );
  }
}
```

**Ką tai reiškia:**
- ✅ `InventoryPage` **importuoja** `InventoryBloc`
- ✅ `InventoryPage` **priklauso** nuo `InventoryBloc`
- ✅ Be `InventoryBloc` - `InventoryPage` negali veikti

---

### **2. Controllers naudoja Entities:**

```
┌────────────────────────┐
│ Presentation.Controllers│ ────..>───┐
│   (InventoryBloc)      │           │
└────────────────────────┘           │
                                     ▼
                            ┌─────────────────────┐
                            │ DomainModel.Entities│
                            │   (Product)         │
                            └─────────────────────┘
```

**Flutter kodas:**
```dart
// lib/features/inventory/bloc/inventory_bloc.dart
import 'package:saldytuvas_plus/domain/entities/product.dart'; // ← IMPORT

class InventoryBloc {
  Future<List<Product>> getProducts() { // ← NAUDOJA Product entity
    // ...
  }
  
  void addProduct(Product product) { // ← NAUDOJA Product entity
    // ...
  }
}
```

**Ką tai reiškia:**
- ✅ `InventoryBloc` **importuoja** `Product` entity
- ✅ `InventoryBloc` **priklauso** nuo `Product`
- ✅ Be `Product` - `InventoryBloc` negali veikti

---

### **3. Repositories naudoja Entities:**

```
┌───────────────────────┐
│ DataAccess.Repositories│ ────..>───┐
│ (IInventoryRepository)│            │
└───────────────────────┘            │
                                     ▼
                            ┌─────────────────────┐
                            │ DomainModel.Entities│
                            │   (Product)         │
                            └─────────────────────┘
```

**Flutter kodas:**
```dart
// lib/data/repositories/inventory_repository.dart
import 'package:saldytuvas_plus/domain/entities/product.dart'; // ← IMPORT

abstract class IInventoryRepository {
  Future<List<Product>> getProducts(); // ← Grąžina Product
  Future<void> addProduct(Product product); // ← Priima Product
}
```

**Ką tai reiškia:**
- ✅ `IInventoryRepository` **importuoja** `Product` entity
- ✅ Repository **priklauso** nuo Domain Entities
- ✅ Be `Product` - Repository negali veikti

---

### **4. Repositories naudoja SupabaseGateway:**

```
┌───────────────────────┐
│ DataAccess.Repositories│ ────..>───┐
│ (InventoryRepository) │            │
└───────────────────────┘            │
                                     ▼
                            ┌──────────────────────┐
                            │ DataAccess.Supabase  │
                            │ Gateway              │
                            └──────────────────────┘
```

**Flutter kodas:**
```dart
// lib/data/repositories/inventory_repository_impl.dart
import 'package:saldytuvas_plus/data/gateway/supabase_gateway.dart'; // ← IMPORT

class InventoryRepositoryImpl implements IInventoryRepository {
  final SupabaseGateway _gateway; // ← NAUDOJA
  
  InventoryRepositoryImpl(this._gateway);
  
  @override
  Future<List<Product>> getProducts() async {
    final data = await _gateway.query('SELECT * FROM products'); // ← NAUDOJA
    // ...
  }
}
```

---

### **5. Entities naudoja Enumerations:**

```
┌───────────────────────┐
│ DomainModel.Entities  │ ────..>───┐
│    (Product)          │           │
└───────────────────────┘           │
                                    ▼
                          ┌─────────────────────────┐
                          │ DomainModel.Enumerations│
                          │    (Category)           │
                          └─────────────────────────┘
```

**Flutter kodas:**
```dart
// lib/domain/entities/product.dart
import 'package:saldytuvas_plus/domain/enumerations/category.dart'; // ← IMPORT

class Product {
  final String name;
  final Category category; // ← NAUDOJA enum
  
  Product({required this.name, required this.category});
}
```

---

## 🔄 **KAIP DUOMENYS TEKA (DATA FLOW):**

### **Vartotojas paspaudžia mygtuką:**

```
1. Vartotojas
   │
   ▼
2. InventoryPage (Views)
   │ import InventoryBloc
   ▼
3. InventoryBloc (Controllers)
   │ import Product, IInventoryRepository
   ▼
4. IInventoryRepository (DataAccess)
   │ import Product, SupabaseGateway
   ▼
5. SupabaseGateway (DataAccess)
   │ import SupabaseClient
   ▼
6. SupabaseClient (Core.Network)
   │
   ▼
7. Supabase Database (išorė)
```

**Kodas:**
```dart
// 1. Vartotojas paspaudžia mygtuką
ElevatedButton(
  onPressed: () {
    // 2. InventoryPage (Views)
    context.read<InventoryBloc>().add(LoadProductsEvent());
  },
)

// 3. InventoryBloc (Controllers)
class InventoryBloc {
  final IInventoryRepository _repository; // 4. Dependency
  
  Future<void> loadProducts() async {
    final products = await _repository.getProducts(); // 5. Kviečia repository
  }
}

// 4. IInventoryRepository (DataAccess)
class InventoryRepositoryImpl {
  final SupabaseGateway _gateway; // 5. Dependency
  
  Future<List<Product>> getProducts() async {
    final data = await _gateway.query('SELECT * FROM products'); // 6. Kviečia gateway
    return data.map((json) => Product.fromJson(json)).toList();
  }
}
```

---

## 📊 **DEPENDENCY CHAIN (Priklausomybių grandinė):**

### **Vizualus pavyzdys:**

```
┌─────────────────────────────────────────────────────────┐
│                    PRESENTATION                         │
│  ┌──────────────┐         ┌──────────────────────┐    │
│  │   Views      │ ..> ..> │   Controllers        │    │
│  │(InventoryPage│         │  (InventoryBloc)     │    │
│  └──────────────┘         └──────┬───────────────┘    │
│                                   │                    │
│                                   │ ..> ..> ..> ..>    │
│                                   │                    │
└───────────────────────────────────┼────────────────────┘
                                    │
                                    ▼
                    ┌───────────────────────────────┐
                    │      DOMAIN MODEL             │
                    │  ┌─────────────────────────┐ │
                    │  │      Entities           │ │
                    │  │   (Product)             │ │
                    │  └───────┬─────────────────┘ │
                    │          │                   │
                    │          │ ..> ..>           │
                    │          │                   │
                    │  ┌───────▼─────────────────┐ │
                    │  │   Enumerations          │ │
                    │  │   (Category)            │ │
                    │  └─────────────────────────┘ │
                    └───────────────────────────────┘
                                    ▲
                                    │
                                    │ ..> ..> ..> ..>
                                    │
┌───────────────────────────────────┼────────────────────┐
│                    DATA ACCESS                         │
│  ┌──────────────────────────────┐ │                   │
│  │   Repositories               │ │                   │
│  │  (IInventoryRepository)      │ │                   │
│  └──────┬───────────────────────┘ │                   │
│         │                         │                   │
│         │ ..> ..>                 │                   │
│         │                         │                   │
│  ┌──────▼───────────────────────┐ │                   │
│  │   SupabaseGateway            │ │                   │
│  └──────┬───────────────────────┘ │                   │
│         │                         │                   │
│         │ ..> ..>                 │                   │
└─────────┼─────────────────────────┼───────────────────┘
          │                         │
          │                         │
          ▼                         ▼
┌─────────────────┐      ┌──────────────────────┐
│   Core.Network  │      │   Core.Network       │
│  SupabaseClient │      │   HttpClient         │
└─────────────────┘      └──────────────────────┘
```

---

## ⚠️ **KĄ REIKIA IŠVENGTI:**

### **❌ 1. CICLINĖ PRIKLAUSOMYBĖ:**

```
┌─────────────┐                ┌─────────────┐
│  Package A  │ ────..>─────── │  Package B  │
└─────────────┘                └─────────────┘
       ▲                              │
       │                              │
       └──────────..>─────────────────┘
```

**Problemos:**
- Package A priklauso nuo Package B
- Package B priklauso nuo Package A
- Neįmanoma atskirai kompiliuoti
- Neįmanoma testuoti

**Pavyzdys (NETEISINGAI):**
```
DomainModel ..> DataAccess
DataAccess ..> DomainModel  ❌ NEGALIMA!
```

---

### **❌ 2. PERŠOKTI PER SLUOKSNIUS:**

```
┌─────────────┐
│ Presentation│ ────..>───┐
└─────────────┘           │
                          ▼
              ┌───────────────────┐
              │ DataAccess.Supabase│ ❌ NEGALIMA!
              │ Gateway            │
              └───────────────────┘
```

**Problema:**
- Presentation tiesiogiai priklauso nuo konkrečios duomenų bazės
- Neįmanoma pakeisti duomenų šaltinio be Presentation keitimo

**TEISINGAI:**
```
Presentation ──..>── DataAccess.Repositories (interface) ✅
```

---

### **❌ 3. DOMAIN PRIKLAUSOMYBĖ NUO DATA:**

```
┌──────────────┐
│ DomainModel  │ ────..>───┐
└──────────────┘           │
                           ▼
              ┌───────────────────┐
              │   DataAccess      │ ❌ NEGALIMA!
              └───────────────────┘
```

**Problema:**
- DomainModel neturėtų žinoti apie duomenų šaltinius
- Clean Architecture principas

**TEISINGAI:**
```
DataAccess ──..>── DomainModel ✅
```

---

## ✅ **TEISINGAS DEPENDENCY FLOW:**

### **Unidirectional (Viena kryptis):**

```
Presentation ──..>── DomainModel ──..>── (nieko nepriklauso)

DataAccess ──..>── DomainModel ──..>── (nieko nepriklauso)

ExternalServices ──..>── Core ──..>── (nieko nepriklauso)
```

---

## 🎯 **GALUTINĖ IŠVADA:**

**Package diagramos rysiai parodo:**

1. ✅ **Kuris paketas naudoja kurį** - import statements
2. ✅ **Kaip duomenys teka** - nuo UI iki duomenų šaltinių
3. ✅ **Kokie principai** - Clean Architecture, Dependency Inversion
4. ✅ **Kokie apribojimai** - kurių priklausomybių turėtų nebūti

**Svarbiausia:** Visi rysiai turėtų būti **viena kryptimi** ir **nuo aukšto sluoksnio žemyn**.


























