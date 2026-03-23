# 🔄 Architektūra BE Repositories - Kaip Veikia?

## 📊 **KAS PAKEISTA:**

### **PRIEŠ (su Repository):**
```
Controllers → Repositories → SupabaseGateway → SupabaseClient
```

### **DABAR (be Repository):**
```
Controllers → SupabaseGateway (tiesiogiai) → SupabaseClient
```

**ARBA:**
```
Controllers → SupabaseClient (tiesiogiai)
```

---

## 🔄 **KAIP DABAR VEIKIA:**

### **1. Controllers → SupabaseGateway (tiesiogiai):**

**Flutter kodas:**
```dart
// lib/features/inventory/bloc/inventory_bloc.dart
import 'package:saldytuvas_plus/data/gateway/supabase_gateway.dart'; // ← TIESIOGINIS IMPORT

class InventoryBloc {
  final SupabaseGateway _gateway; // ← TIESIOGIAI SupabaseGateway
  
  InventoryBloc(this._gateway);
  
  Future<List<Product>> getProducts() async {
    final data = await _gateway.query('SELECT * FROM products'); // ← TIESIOGIAI
    return data.map((json) => Product.fromJson(json)).toList();
  }
}
```

---

### **2. Controllers → SupabaseClient (tiesiogiai):**

**Flutter kodas:**
```dart
// lib/features/inventory/bloc/inventory_bloc.dart
import 'package:supabase_flutter/supabase_flutter.dart'; // ← TIESIOGINIS IMPORT

class InventoryBloc {
  final SupabaseClient _supabase = Supabase.instance.client; // ← TIESIOGIAI
  
  Future<List<Product>> getProducts() async {
    final data = await _supabase.from('products').select(); // ← TIESIOGIAI
    return data.map((json) => Product.fromJson(json)).toList();
  }
}
```

---

## 📊 **NAUJOS PRIKLAUSOMYBĖS (Dependencies):**

### **1. Controllers → DomainModel.Entities:**
```
✅ IŠLIEKA (nepakeista)
Presentation.Controllers ..> DomainModel.Entities : uses entities
```

**Kodėl:**
- Controllers vis tiek naudoja Domain Entities (Product, Inventory, ir t.t.)

---

### **2. Controllers → Core.Network.SupabaseClient:**
```
✅ PRIDĖTA (nauja priklausomybė)
Presentation.Controllers ..> Core.Network.SupabaseClient : uses (tiesiogiai)
```

**Arba:**
```
✅ PRIDĖTA (jei naudojate SupabaseGateway)
Presentation.Controllers ..> DataAccess.SupabaseGateway : uses (tiesiogiai)
```

---

### **3. Controllers → ExternalServices:**
```
✅ IŠLIEKA (nepakeista)
Presentation.Controllers ..> ExternalServices : uses (tiesiogiai arba per Services)
```

---

### **4. Controllers → Core:**
```
✅ IŠLIEKA (nepakeista)
Presentation.Controllers ..> Core : uses (utilities)
```

---

## 🔄 **DEPENDENCY FLOW (Be Repository):**

```
┌─────────────────────────────────────────────┐
│         PRESENTATION LAYER                  │
│  ┌──────────────┐      ┌──────────────┐   │
│  │    Views     │ ───> │ Controllers  │   │
│  └──────────────┘      └──────┬───────┘   │
│                                │           │
│                                ├───────> DomainModel.Entities
│                                │           │
│                                ├───────> Core.Network.SupabaseClient
│                                │           │
│                                ├───────> ExternalServices
│                                │           │
│                                └───────> Core (utilities)
└────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────┐
│          CORE.NETWORK                       │
│  ┌──────────────┐                           │
│  │ SupabaseClient│                          │
│  └──────┬───────┘                           │
│         │                                   │
│         └───────> Supabase Database
└─────────────────────────────────────────────┘
```

---

## ⚠️ **KAS KEIČIASI:**

### **1. Prarandate Abstrakciją:**

**PROBLEMA:**
- Controllers dabar **tiesiogiai priklauso** nuo Supabase
- Neįmanoma lengvai pakeisti duomenų šaltinio

**Pavyzdys:**
```dart
// Jei reikia pakeisti iš Supabase į Firestore:
// ❌ Turite keisti VISUS controllers (100+ vietų!)
class InventoryBloc {
  final SupabaseClient _supabase; // ← TURI KEISTI VISUR
  // ...
}
```

---

### **2. Sudėtingas Testavimas:**

**PROBLEMA:**
- Turite mock'inti SupabaseClient (sudėtingiau)
- Negalite lengvai testuoti be realaus Supabase

**Pavyzdys:**
```dart
// Testavimas be Repository:
test('getProducts should return products', () async {
  // ❌ Kaip mock'inti SupabaseClient? Sudėtinga...
  final mockSupabase = MockSupabaseClient(); // Reikia sudėtingo mock
  final bloc = InventoryBloc(mockSupabase);
  // ...
});
```

---

### **3. Pažeidžiate Clean Architecture:**

**PROBLEMA:**
- Presentation Layer (Controllers) tiesiogiai priklauso nuo Core.Network (infrastruktūra)
- Clean Architecture reikalauja, kad Presentation priklausytų tik nuo Domain

---

## ✅ **KAS LIEKA TAIP PAT:**

### **1. Views → Controllers:**
```
✅ IŠLIEKA (nepakeista)
Presentation.Views ..> Presentation.Controllers : uses
```

---

### **2. Controllers → DomainModel.Entities:**
```
✅ IŠLIEKA (nepakeista)
Presentation.Controllers ..> DomainModel.Entities : uses entities
```

**Kodėl:**
- Controllers vis tiek naudoja Domain Entities

---

### **3. Entities → Enumerations:**
```
✅ IŠLIEKA (nepakeista)
DomainModel.Entities ..> DomainModel.Enumerations : uses
```

---

### **4. ExternalServices → Core.Network.HttpClient:**
```
✅ IŠLIEKA (nepakeista)
ExternalServices ..> Core.Network.HttpClient : uses
```

---

## 🔄 **NAUJA ARCHITEKTŪRA (Be Repository):**

### **Package Structure:**

```
ClientApp
  ├── Views (15 langų)
  └── Controllers
      ├── MemberControllers (13)
      └── AdminControllers (6)

DomainModel
  ├── Entities (19)
  └── Enumerations (7)

Core
  ├── Config
  ├── Errors
  ├── Theme
  ├── Network
  │   └── SupabaseClient ← NAUDOJA Controllers
  ├── Storage
  └── Utils

ExternalServices
  ├── CameraGalleryBoundary
  ├── MobileScannerBoundary
  ├── OpenFoodFactsServiceBoundary
  ├── OCRServiceBoundary
  └── GeminiServiceBoundary
```

---

### **Naujos Dependencies:**

```
1. ✅ Presentation.Views → Presentation.Controllers : uses

2. ✅ Presentation.Controllers → DomainModel.Entities : uses entities

3. ✅ Presentation.Controllers → Core.Network.SupabaseClient : uses (tiesiogiai)

4. ✅ Presentation.Controllers → ExternalServices : uses

5. ✅ Presentation → Core : uses

6. ✅ DomainModel.Entities → DomainModel.Enumerations : uses

7. ✅ ExternalServices → Core.Network.HttpClient : uses
```

---

## ⚠️ **TRŪKSTAMOS DEPENDENCIES:**

### **1. Controllers → SupabaseClient:**

**PRIDĖTI:**
```
Presentation.Controllers ..> Core.Network.SupabaseClient : uses
```

**Arba (jei naudojate SupabaseGateway):**
```
Presentation.Controllers ..> DataAccess.SupabaseGateway : uses
```

---

## 📊 **PALYGINIMAS:**

### **SU Repository:**
```
Controllers → IInventoryRepository (interface)
             → InventoryRepositoryImpl → SupabaseGateway → SupabaseClient
```

**Privalumai:**
- ✅ Lengvas testavimas
- ✅ Galima keisti duomenų šaltinį
- ✅ Clean Architecture

**Trūkumai:**
- ❌ Daugiau kodo

---

### **BE Repository:**
```
Controllers → SupabaseClient (tiesiogiai)
```

**Privalumai:**
- ✅ Mažiau kodo
- ✅ Paprasčiau (tiesioginis)

**Trūkumai:**
- ❌ Sudėtingas testavimas
- ❌ Neįmanoma lengvai keisti duomenų šaltinio
- ❌ Pažeidžia Clean Architecture

---

## ✅ **GALUTINĖ IŠVADA:**

### **KAS KEITĖSI:**

1. ✅ **Pašalinti:** DataAccess.Repositories paketas
2. ✅ **Pridėti:** Controllers → Core.Network.SupabaseClient (tiesiogiai)
3. ✅ **Išlieka:** Visi kiti rysiai (Views → Controllers, Entities → Enumerations, ir t.t.)

### **NAUJOS DEPENDENCIES:**

```
Controllers → SupabaseClient (tiesiogiai)
Controllers → DomainModel.Entities (išlieka)
Controllers → ExternalServices (išlieka)
Controllers → Core (išlieka)
```

### **KĄ TURITE PADARYTI:**

1. ✅ **Pridėti dependency:**
   ```
   Presentation.Controllers ..> Core.Network.SupabaseClient : uses
   ```

2. ✅ **Pašalinti dependency:**
   ```
   Presentation.Controllers ..> DataAccess.Repositories : uses (nebeegzistuoja)
   ```

3. ✅ **Išliko nepakeista:**
   - Views → Controllers
   - Controllers → DomainModel.Entities
   - Controllers → ExternalServices
   - Controllers → Core
   - Entities → Enumerations
   - ExternalServices → Core.Network.HttpClient

---

## 📝 **PASTABA:**

**Jei vėliau norėsite grįžti prie Repository:**

1. Sukurkite Repository interfaces
2. Sukurkite Repository implementacijas
3. Atnaujinkite Controllers, kad naudotų Repository
4. Pridėkite dependencies atgal į diagramą

**Bet dabar be Repository - viskas veiks, tik bus:**
- ⚠️ Sudėtingiau testuoti
- ⚠️ Neįmanoma lengvai keisti duomenų šaltinio
- ⚠️ Pažeidžia Clean Architecture principus


























