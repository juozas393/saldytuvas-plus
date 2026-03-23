# 🔗 Package Diagram Rysiai (Dependencies) - Kaip Jie Veikia

## 📊 **KAS YRA DEPENDENCY (RYSYS)?**

**Dependency (priklausomybė)** yra rodyklė, kuri parodo, kad vienas paketas **priklauso** nuo kito - t.y., naudoja jo funkcionalumą.

---

## 🎯 **DEPENDENCY TIPAI Package Diagramoje:**

### **1. `..>` - Dependency Arrow (Punktyrinė rodyklė):**

```
PackageA ..> PackageB : uses
```

**Reikšmė:**
- PackageA **naudoja** PackageB
- PackageA turi **import'ų** į PackageB klasės/funkcijas
- **Neprievarta priklausomybė** (compile-time arba runtime)

**Pavyzdys:**
```
Presentation.Controllers ..> DomainModel.Entities : uses entities
```
- Controllers **naudoja** Entities
- Controllers importuoja `Product`, `Inventory`, `Receipt` ir t.t.

---

### **2. `-->` - Association Arrow (Ištisinė rodyklė):**

```
PackageA --> PackageB : contains
```

**Reikšmė:**
- PackageA **turi/talpina** PackageB
- **Kompozicija arba asociacija** (vienas objektas turi kitą)

**Pavyzdys:**
```
InventoryEntity --> ProductEntity : contains
```
- Inventory **turi** Products (1 Inventory turi daug Product)

---

## 🔄 **KAIP RYSIAI VEIKIA MŪSŲ SISTEMOJE:**

---

## ✅ **1. PRESENTATION LAYER RYSIAI:**

### **Views → Controllers:**
```
Presentation.Views ..> Presentation.Controllers : uses
```

**Kaip veikia:**
- `InventoryPage` importuoja `InventoryBloc`
- `ProductDetailsPage` importuoja `ProductBloc`
- Views naudoja `BlocBuilder`/`BlocListener` widget'us

**Konkretus pavyzdys Flutter kode:**
```dart
// lib/features/inventory/pages/inventory_page.dart
import 'package:saldytuvas_plus/features/inventory/bloc/inventory_bloc.dart';

class InventoryPage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return BlocBuilder<InventoryBloc, InventoryState>(
      builder: (context, state) {
        // Naudoja InventoryBloc
      },
    );
  }
}
```

---

### **Controllers → DomainModel:**
```
Presentation.Controllers ..> DomainModel.Entities : uses entities
```

**Kaip veikia:**
- `InventoryBloc` importuoja `Product`, `Inventory` entitės
- Controllers naudoja entitės duomenims apdoroti

**Konkretus pavyzdys:**
```dart
// lib/features/inventory/bloc/inventory_bloc.dart
import 'package:saldytuvas_plus/domain/entities/product.dart';
import 'package:saldytuvas_plus/domain/entities/inventory.dart';

class InventoryBloc {
  Future<List<Product>> getProducts() {
    // Naudoja Product entity
  }
}
```

---

### **Presentation → Core:**
```
Presentation ..> Core : uses
```

**Kaip veikia:**
- Visi Presentation komponentai naudoja Core utilities:
  - `Core.Config` - konfigūracija
  - `Core.Theme` - dizaino tema
  - `Core.Errors` - klaidos valdymas
  - `Core.Utils` - helper funkcijos

**Konkretus pavyzdys:**
```dart
// lib/features/inventory/pages/inventory_page.dart
import 'package:saldytuvas_plus/core/theme/app_theme.dart';
import 'package:saldytuvas_plus/core/utils/helpers.dart';

class InventoryPage extends StatelessWidget {
  // Naudoja AppTheme, Helpers
}
```

---

## ✅ **2. DOMAIN MODEL RYSIAI:**

### **Entities → Enumerations:**
```
DomainModel.Entities ..> DomainModel.Enumerations : uses
```

**Kaip veikia:**
- `Product` entity naudoja `Category` enum
- `Receipt` entity naudoja `StorePriority` enum

**Konkretus pavyzdys:**
```dart
// lib/domain/entities/product.dart
import 'package:saldytuvas_plus/domain/enumerations/category.dart';

class Product {
  final String name;
  final Category category; // Naudoja enum
  
  Product({required this.name, required this.category});
}
```

---

## ✅ **3. DATA ACCESS RYSIAI:**

### **Repositories → Entities:**
```
DataAccess.Repositories ..> DomainModel.Entities : uses entities
```

**Kaip veikia:**
- Repository interfeisai naudoja Domain entities kaip grąžinimo tipus
- Repositories grąžina `Product`, `Inventory` ir t.t.

**Konkretus pavyzdys:**
```dart
// lib/data/repositories/inventory_repository.dart
import 'package:saldytuvas_plus/domain/entities/product.dart';

abstract class IInventoryRepository {
  Future<List<Product>> getProducts(); // Grąžina Product entity
  Future<void> addProduct(Product product); // Priima Product entity
}
```

---

### **Repositories → SupabaseGateway:**
```
DataAccess.Repositories ..> DataAccess.SupabaseGateway : uses
```

**Kaip veikia:**
- Repository implementacijos naudoja SupabaseGateway duomenų persistencijai

**Konkretus pavyzdys:**
```dart
// lib/data/repositories/inventory_repository_impl.dart
import 'package:saldytuvas_plus/data/gateway/supabase_gateway.dart';

class InventoryRepositoryImpl implements IInventoryRepository {
  final SupabaseGateway _gateway;
  
  InventoryRepositoryImpl(this._gateway);
  
  @override
  Future<List<Product>> getProducts() async {
    final data = await _gateway.query('SELECT * FROM products');
    // Konvertuoja į Product entities
  }
}
```

---

### **SupabaseGateway → SupabaseClient:**
```
DataAccess.SupabaseGateway ..> Core.Network.SupabaseClient : uses
```

**Kaip veikia:**
- SupabaseGateway wrap'ina SupabaseClient (supabase_flutter paketas)

**Konkretus pavyzdys:**
```dart
// lib/data/gateway/supabase_gateway.dart
import 'package:supabase_flutter/supabase_flutter.dart';

class SupabaseGateway {
  final SupabaseClient _client = Supabase.instance.client;
  
  Future<Map<String, dynamic>> query(String sql) async {
    return await _client.from('products').select().execute();
  }
}
```

---

## ✅ **4. EXTERNAL SERVICES RYSIAI:**

### **ExternalServices → Core.Network.HttpClient:**
```
ExternalServices ..> Core.Network.HttpClient : uses
```

**Kaip veikia:**
- External boundaries naudoja HTTP client API kvietimams

**Konkretus pavyzdys:**
```dart
// lib/data/external/open_food_facts_boundary.dart
import 'package:http/http.dart' as http;

class OpenFoodFactsServiceBoundary {
  final http.Client _client;
  
  Future<Map<String, dynamic>> getProductByBarcode(String barcode) async {
    final response = await _client.get(
      Uri.parse('https://world.openfoodfacts.org/api/v0/product/$barcode.json'),
    );
    return jsonDecode(response.body);
  }
}
```

---

## 🔄 **DEPENDENCY FLOW (Kaip duomenys teka):**

```
┌─────────────────────────────────────────────┐
│         PRESENTATION LAYER                  │
│  ┌──────────────┐      ┌──────────────┐   │
│  │    Views     │ ───> │ Controllers  │   │
│  └──────────────┘      └──────┬───────┘   │
│                                │           │
│                                ├───────> DomainModel.Entities
│                                │           │
│                                ├───────> DataAccess.Repositories
│                                │           │
│                                └───────> Core (utilities)
└────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────┐
│          DOMAIN MODEL LAYER                 │
│  ┌──────────────┐      ┌──────────────┐   │
│  │   Entities   │ ───> │ Enumerations │   │
│  └──────────────┘      └──────────────┘   │
└─────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────┐
│          DATA ACCESS LAYER                  │
│  ┌──────────────┐      ┌──────────────┐   │
│  │ Repositories │ ───> │ Supabase     │   │
│  └──────┬───────┘      │ Gateway      │   │
│         │              └──────┬───────┘   │
│         │                     │           │
│         │                     └───────> Core.Network.SupabaseClient
│         │                                 │
│         └─────────────────────────────> DomainModel.Entities
└─────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────┐
│       EXTERNAL SERVICES LAYER               │
│  ┌──────────────┐      ┌──────────────┐   │
│  │ Boundaries   │ ───> │ Core.Network │   │
│  └──────────────┘      │ .HttpClient  │   │
│         │              └──────────────┘   │
│         │                                 │
│         └─────────────────────────────> External APIs
└─────────────────────────────────────────────┘
```

---

## 📝 **SVARBIAUSIOS TAISYKLĖS:**

### ✅ **1. UNIDIRECTIONAL FLOW (Viena kryptis):**

**TEISINGAI:**
```
Presentation → DomainModel ✅
DataAccess → DomainModel ✅
ExternalServices → Core ✅
```

**NETEISINGAI:**
```
DomainModel → DataAccess ❌ (Clean Architecture pažeidimas!)
Core → ExternalServices ❌ (Core neturi priklausyti nuo External)
```

**Kodėl?**
- DomainModel neturėtų žinoti apie duomenų šaltinius (DataAccess)
- Core yra bendra infrastruktūra, nepriklausoma nuo external services

---

### ✅ **2. DEPENDENCY INVERSION PRINCIPLE:**

**Controllers priklauso nuo abstrakcijų, ne implementacijų:**

```
Presentation.Controllers ..> DataAccess.Repositories (interface)
```

**Kaip veikia:**
```dart
// Controller naudoja INTERFACE, ne konkrečią implementaciją
class InventoryBloc {
  final IInventoryRepository _repository; // Interface, ne klasė!
  
  InventoryBloc(this._repository);
}
```

---

### ✅ **3. LAYER SEPARATION:**

**Kiekvienas sluoksnis priklauso tik nuo žemesnių sluoksnių:**

```
Presentation (aukščiausias)
    ↓ depends on
DomainModel (vidurinis)
    ↓ depends on
DataAccess (žemiausias)
    ↓ depends on
Core (infrastruktūra)
```

---

## 🎯 **KONKRETŪS PAVYZDŽIAI MŪSŲ DIAGRAMOJE:**

### **1. Views naudoja Controllers:**
```
Presentation.Views ..> Presentation.Controllers : uses
```
**Kodėl:** Views rodo duomenis iš Controllers (BLoC pattern)

---

### **2. Controllers naudoja Entities:**
```
Presentation.Controllers ..> DomainModel.Entities : uses entities
```
**Kodėl:** Controllers apdoroja duomenis kaip Entities

---

### **3. Controllers naudoja Repositories:**
```
Presentation.Controllers ..> DataAccess.Repositories : uses (via Services)
```
**Kodėl:** Controllers gauna duomenis per Repository interfeisus

---

### **4. Repositories naudoja Entities:**
```
DataAccess.Repositories ..> DomainModel.Entities : uses entities
```
**Kodėl:** Repositories grąžina ir priima Entities kaip duomenis

---

### **5. Entities naudoja Enumerations:**
```
DomainModel.Entities ..> DomainModel.Enumerations : uses
```
**Kodėl:** Entities naudoja Enum'us kaip tipus (Category, UserRole, ir t.t.)

---

### **6. ExternalServices naudoja HttpClient:**
```
ExternalServices ..> Core.Network.HttpClient : uses
```
**Kodėl:** External boundaries reikia HTTP kliento API kvietimams

---

## ⚠️ **KĄ REIKIA IŠVENGTI:**

### ❌ **1. CYCLIC DEPENDENCIES (Ciklinės priklausomybės):**

```
PackageA ..> PackageB
PackageB ..> PackageA  ❌ NEGALIMA!
```

**Problemos:**
- Sudėtinga priežiūra
- Neįmanoma atskirai testuoti
- Compilation problemos

---

### ❌ **2. CROSS-LAYER DEPENDENCIES (Peršokti per sluoksnius):**

```
Presentation ..> DataAccess.SupabaseGateway  ❌ NEGALIMA!
```

**Problema:**
- Presentation neturėtų žinoti apie konkretų duomenų šaltinį

**TEISINGAI:**
```
Presentation ..> DataAccess.Repositories (interface) ✅
```

---

### ❌ **3. DOMAIN PRIKLAUSOMYBĖ NUO DATA:**

```
DomainModel ..> DataAccess  ❌ NEGALIMA!
```

**Kodėl:**
- DomainModel turi būti nepriklausomas nuo duomenų šaltinių
- Clean Architecture principas

**TEISINGAI:**
```
DataAccess ..> DomainModel ✅
```

---

## ✅ **GALUTINĖ IŠVADA:**

**Package diagramos rysiai parodo:**

1. **Kuris paketas naudoja kurį** - import statements, compile-time dependencies
2. **Kaip duomenys teka** - nuo UI iki duomenų šaltinių
3. **Kokie principai taikomi** - Clean Architecture, Dependency Inversion
4. **Kokie yra apribojimai** - kurių priklausomybių turėtų nebūti

**Svarbiausia:** Visi rysiai turėtų būti **unidirectional** (viena kryptimi) ir **nuo aukšto sluoksnio žemyn**.


























