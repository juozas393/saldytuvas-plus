# 🔗 Visi Rysiai (Dependencies) - Kaip Turėtų Būti

## 📊 **PAGAL CLEAN ARCHITECTURE:**

---

## ✅ **1. VIEWS → CONTROLLERS (MVC Pattern):**

```
Views → Controllers
```

**Konkretus rysys:**
```
ClientApp.Views ..> ClientApp.Controllers : uses
```

**Logika:** Views naudoja Controllers (BLoC pattern Flutter'e)

---

## ✅ **2. CONTROLLERS → DOMAIN MODEL:**

```
Controllers → DomainModel.Entities
```

**Konkretūs rysiai:**
```
ClientApp.Controllers.Member ..> DomainModel.Entities : uses entities
ClientApp.Controllers.Admin ..> DomainModel.Entities : uses entities
```

**Logika:** Controllers naudoja Domain Entities duomenims apdoroti

---

## ✅ **3. CONTROLLERS → DATAACCESS:**

**PRIEŠ (tiesiogiai):**
```
Controllers → DataAccess.Repositories
```

**PO (per Services - implied):**
```
Controllers → Services (implied) → DataAccess.Repositories
```

**REKOMENDACIJA:** 
- Controllers NETIESIOGINIAI naudoja Repositories (per Services)
- Arba: `ClientApp.Controllers ..> DataAccess.Repositories : uses (via Services)`

---

## ✅ **4. CONTROLLERS → EXTERNAL SERVICES:**

**PRIEŠ (tiesiogiai):**
```
Controllers → ExternalServices
```

**PO (per Services - implied):**
```
Controllers → Services (implied) → ExternalServices
```

**REKOMENDACIJA:**
- Controllers NETIESIOGINIAI naudoja ExternalServices (per Services)
- Arba: `ClientApp.Controllers ..> ExternalServices : uses (via Services)`

---

## ✅ **5. DATAACCESS → DOMAIN MODEL:**

```
DataAccess.Repositories → DomainModel.Entities
```

**Konkretus rysys:**
```
DataAccess.Repositories ..> DomainModel.Entities : uses entities
```

**Logika:** Repositories dirba su Domain Entities

---

## ✅ **6. DATAACCESS → SUPABASEGATEWAY:**

```
DataAccess.Repositories → DataAccess.SupabaseGateway
```

**Konkretus rysys:**
```
DataAccess.Repositories ..> DataAccess.SupabaseGateway : uses
```

**Pastaba:** Jei SupabaseGateway yra diagramoje

---

## ✅ **7. SUPABASEGATEWAY → CORE.NETWORK:**

```
DataAccess.SupabaseGateway → Core.Network.SupabaseClient
```

**Konkretus rysys:**
```
DataAccess.SupabaseGateway ..> Core.Network.SupabaseClient : uses
```

**Pastaba:** Jei SupabaseGateway ir SupabaseClient yra diagramoje

---

## ✅ **8. DOMAIN MODEL - Vidinės Priklausomybės:**

```
DomainModel.Entities → DomainModel.Enumerations
```

**Konkretus rysys:**
```
DomainModel.Entities ..> DomainModel.Enumerations : uses
```

**Logika:** Entities naudoja Enumerations

---

## ✅ **9. CLIENTAPP → CORE:**

```
ClientApp → Core
```

**Konkretus rysys:**
```
ClientApp ..> Core : uses
```

**Logika:** ClientApp naudoja Core utilities (Config, Errors, Theme, Utils, Storage)

---

## ✅ **10. EXTERNAL SERVICES → CORE.NETWORK:**

```
ExternalServices → Core.Network.HttpClient
```

**Konkretus rysys:**
```
ExternalServices ..> Core.Network.HttpClient : uses
```

**Logika:** External boundaries naudoja HTTP client

---

## ✅ **11. DATAACCESS → CORE (jei reikia):**

```
DataAccess.Repositories → Core (implied)
```

**Pastaba:** Jei Repositories naudoja Core utilities

---

## ✅ **GALUTINIS RYSIŲ SĄRAŠAS:**

### **PAGRINDINIAI RYSIAI:**

1. ✅ `ClientApp.Views → ClientApp.Controllers : uses`
2. ✅ `ClientApp.Controllers → DomainModel.Entities : uses entities`
3. ✅ `ClientApp → Core : uses`
4. ✅ `ClientApp → DataAccess.Repositories : uses (via Services)`
5. ✅ `ClientApp → ExternalServices : uses (via Services)`

### **DATA ACCESS RYSIAI:**

6. ✅ `DataAccess.Repositories → DomainModel.Entities : uses entities`
7. ✅ `DataAccess.Repositories → DataAccess.SupabaseGateway : uses` (jei yra)
8. ✅ `DataAccess.SupabaseGateway → Core.Network.SupabaseClient : uses` (jei yra)

### **DOMAIN MODEL RYSIAI:**

9. ✅ `DomainModel.Entities → DomainModel.Enumerations : uses`

### **EXTERNAL SERVICES RYSIAI:**

10. ✅ `ExternalServices → Core.Network.HttpClient : uses`

### **CORE RYSIAI:**

11. ✅ `Core → ExternalServices` ❌ (NETEISINGAI - ExternalServices naudoja Core, ne atvirkščiai!)

---

## ⚠️ **KLAIDOS NUOTRAUKOJE:**

### **❌ NETeisingas rysys:**

```
Core → External Services ❌
```

**Problema:** Core neturėtų priklausyti nuo External Services

**TEISINGAI:**
```
ExternalServices → Core.Network.HttpClient ✅
```

**Logika:** External boundaries naudoja HTTP client iš Core, ne atvirkščiai

---

### **❌ NETeisingas rysys:**

```
DomainModel → DataAccess ❌
```

**Problema:** DomainModel neturėtų priklausyti nuo DataAccess (Clean Architecture pažeidimas!)

**TEISINGAI:**
```
DataAccess.Repositories → DomainModel.Entities ✅
```

**Logika:** Repositories naudoja Entities, ne atvirkščiai

---

## ✅ **TEISINGI RYSIAI (Pilnas Sąrašas):**

1. ✅ `ClientApp.Views → ClientApp.Controllers : uses`
2. ✅ `ClientApp.Controllers → DomainModel.Entities : uses entities`
3. ✅ `ClientApp → Core : uses`
4. ✅ `ClientApp → DataAccess.Repositories : uses (via Services)`
5. ✅ `ClientApp → ExternalServices : uses (via Services)`
6. ✅ `DataAccess.Repositories → DomainModel.Entities : uses entities`
7. ✅ `DataAccess.Repositories → DataAccess.SupabaseGateway : uses` (jei yra)
8. ✅ `DataAccess.SupabaseGateway → Core.Network.SupabaseClient : uses` (jei yra)
9. ✅ `DomainModel.Entities → DomainModel.Enumerations : uses`
10. ✅ `ExternalServices → Core.Network.HttpClient : uses`

**ATVIRSČIAI NETURI BŪTI:**
- ❌ `Core → ExternalServices`
- ❌ `DomainModel → DataAccess`

---

## ✅ **DEPENDENCY FLOW:**

```
Views → Controllers → DomainModel.Entities
                    ↓
                    Services (implied) → DataAccess.Repositories
                                        → ExternalServices
                                        ↓
                                    DomainModel.Entities
                                        ↓
                                    DomainModel.Enumerations

DataAccess.Repositories → DomainModel.Entities
                        → SupabaseGateway → SupabaseClient

ExternalServices → Core.Network.HttpClient

ClientApp → Core
```

---

## ✅ **GALUTINĖ IŠVADA:**

**Visi rysiai turėtų būti unidirectional (viena kryptimi):**
- Views → Controllers
- Controllers → DomainModel
- DataAccess → DomainModel (ne atvirkščiai!)
- ExternalServices → Core (ne atvirkščiai!)


























