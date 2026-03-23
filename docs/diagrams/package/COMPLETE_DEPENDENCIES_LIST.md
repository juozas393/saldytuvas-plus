# 🔗 Visi Rysiai (Dependencies) - Pilnas Sąrašas

## ✅ **TEISINGI RYSIAI - Kaip Turėtų Būti:**

---

## 📊 **1. CLIENTAPP VIDINIAI RYSIAI:**

### **Views → Controllers:**
```
ClientApp.Views ..> ClientApp.Controllers : uses
```
**Logika:** Views naudoja Controllers (BLoC pattern Flutter'e)

---

## 📊 **2. CLIENTAPP → DOMAIN MODEL:**

### **Controllers → Entities:**
```
ClientApp.Controllers.Member ..> DomainModel.Entities : uses entities
ClientApp.Controllers.Admin ..> DomainModel.Entities : uses entities
```
**Logika:** Controllers naudoja Domain Entities duomenims apdoroti

---

## 📊 **3. CLIENTAPP → DATAACCESS:**

### **Controllers → Repositories:**
```
ClientApp.Controllers ..> DataAccess.Repositories : uses (via Services)
```
**Pastaba:** Services yra implied tarpinis sluoksnis

**ARBA tiesiogiai (jei Services nėra implied):**
```
ClientApp.Controllers ..> DataAccess.Repositories : uses
```

---

## 📊 **4. CLIENTAPP → EXTERNAL SERVICES:**

### **Controllers → ExternalServices:**
```
ClientApp.Controllers ..> ExternalServices : uses (via Services)
```
**Pastaba:** Services yra implied tarpinis sluoksnis

**ARBA tiesiogiai (jei Services nėra implied):**
```
ClientApp.Controllers ..> ExternalServices : uses
```

---

## 📊 **5. CLIENTAPP → CORE:**

### **ClientApp → Core:**
```
ClientApp ..> Core : uses
```
**Logika:** ClientApp naudoja Core utilities (Config, Errors, Theme, Utils, Storage)

---

## 📊 **6. DATAACCESS → DOMAIN MODEL:**

### **Repositories → Entities:**
```
DataAccess.Repositories ..> DomainModel.Entities : uses entities
```
**Logika:** Repositories dirba su Domain Entities

---

## 📊 **7. DATAACCESS VIDINIAI RYSIAI:**

### **Repositories → SupabaseGateway (jei yra):**
```
DataAccess.Repositories ..> DataAccess.SupabaseGateway : uses
```
**Logika:** Repositories naudoja Gateway duomenų persistencijai

### **SupabaseGateway → SupabaseClient (jei yra):**
```
DataAccess.SupabaseGateway ..> Core.Network.SupabaseClient : uses
```
**Logika:** Gateway naudoja SupabaseClient

---

## 📊 **8. DOMAIN MODEL VIDINIAI RYSIAI:**

### **Entities → Enumerations:**
```
DomainModel.Entities ..> DomainModel.Enumerations : uses
```
**Logika:** Entities naudoja Enumerations

---

## 📊 **9. EXTERNAL SERVICES → CORE:**

### **ExternalServices → Core.Network.HttpClient:**
```
ExternalServices ..> Core.Network.HttpClient : uses
```
**Logika:** External boundaries naudoja HTTP client

---

## ❌ **NETEISINGI RYSIAI (Kurių NETURI BŪTI):**

### **1. Core → ExternalServices:**
```
Core ..> ExternalServices : uses ❌
```
**Problema:** Core neturėtų priklausyti nuo External Services

**Logika:** External Services naudoja Core, ne atvirkščiai

---

### **2. DomainModel → DataAccess:**
```
DomainModel ..> DataAccess : uses ❌
```
**Problema:** DomainModel neturėtų priklausyti nuo DataAccess (Clean Architecture pažeidimas!)

**Logika:** DataAccess naudoja DomainModel, ne atvirkščiai

---

## ✅ **GALUTINIS RYSIŲ SĄRAŠAS:**

### **CLIENTAPP RYSIAI:**

1. ✅ `ClientApp.Views → ClientApp.Controllers : uses`

2. ✅ `ClientApp.Controllers.Member → DomainModel.Entities : uses entities`
3. ✅ `ClientApp.Controllers.Admin → DomainModel.Entities : uses entities`

4. ✅ `ClientApp → Core : uses`

5. ✅ `ClientApp.Controllers → DataAccess.Repositories : uses (via Services)`
   - ARBA: `ClientApp.Controllers → DataAccess.Repositories : uses`

6. ✅ `ClientApp.Controllers → ExternalServices : uses (via Services)`
   - ARBA: `ClientApp.Controllers → ExternalServices : uses`

---

### **DATAACCESS RYSIAI:**

7. ✅ `DataAccess.Repositories → DomainModel.Entities : uses entities`

8. ✅ `DataAccess.Repositories → DataAccess.SupabaseGateway : uses` (jei SupabaseGateway yra)

9. ✅ `DataAccess.SupabaseGateway → Core.Network.SupabaseClient : uses` (jei SupabaseGateway yra)

---

### **DOMAIN MODEL RYSIAI:**

10. ✅ `DomainModel.Entities → DomainModel.Enumerations : uses`

---

### **EXTERNAL SERVICES RYSIAI:**

11. ✅ `ExternalServices → Core.Network.HttpClient : uses`

---

## 📊 **DEPENDENCY FLOW (Vizualiai):**

```
┌─────────────────┐
│  ClientApp      │
│  ┌───────────┐  │
│  │  Views    │──┼──→ Controllers
│  └───────────┘  │
│  ┌───────────┐  │
│  │Controllers│──┼──→ DomainModel.Entities
│  └───────────┘  │
└────────┬────────┘
         │
         ├──→ Core
         ├──→ DataAccess.Repositories
         └──→ ExternalServices

┌─────────────────┐
│  DataAccess     │
│  ┌───────────┐  │
│  │Repositories│─┼──→ DomainModel.Entities
│  └───────────┘  │
│  ┌───────────┐  │
│  │Supabase   │─┼──→ Core.Network.SupabaseClient
│  │Gateway    │  │
│  └───────────┘  │
└─────────────────┘

┌─────────────────┐
│  DomainModel    │
│  ┌───────────┐  │
│  │ Entities  │──┼──→ Enumerations
│  └───────────┘  │
└─────────────────┘

┌─────────────────┐
│External Services│
└────────┬────────┘
         │
         └──→ Core.Network.HttpClient
```

---

## ✅ **UNIDIRECTIONAL PRINCIPAS:**

**Visi rysiai turėtų būti unidirectional (viena kryptimi):**

- ✅ Views → Controllers
- ✅ Controllers → DomainModel
- ✅ Controllers → DataAccess
- ✅ Controllers → ExternalServices
- ✅ DataAccess → DomainModel
- ✅ ExternalServices → Core
- ✅ ClientApp → Core

**NEATVIRSČIAI:**
- ❌ Core → ExternalServices
- ❌ DomainModel → DataAccess

---

## ✅ **GALUTINĖ IŠVADA:**

**Visi rysiai:**
1. ✅ Views → Controllers
2. ✅ Controllers → DomainModel.Entities (Member + Admin)
3. ✅ ClientApp → Core
4. ✅ Controllers → DataAccess.Repositories
5. ✅ Controllers → ExternalServices
6. ✅ DataAccess.Repositories → DomainModel.Entities
7. ✅ DataAccess.Repositories → SupabaseGateway (jei yra)
8. ✅ SupabaseGateway → SupabaseClient (jei yra)
9. ✅ DomainModel.Entities → DomainModel.Enumerations
10. ✅ ExternalServices → Core.Network.HttpClient

**Iš viso: 10 rysių**


























