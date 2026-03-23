# ✅ Services ir Actors Pašalinti iš Package Diagramos

## 🔄 **KĄ PADARĖME:**

### **1. PAŠALINTA Services paketas:**
- ❌ Services paketas pašalintas
- ✅ Services rodomi kaip "implied" sluoksnis
- ✅ Pastaba pridėta, kad Services koordinuoja Repositories + External Boundaries

### **2. PAŠALINTA Actors paketas:**
- ❌ Actors paketas pašalintas
- ✅ Actors rodomi kaip "implied" (išoriniai veikėjai)
- ✅ Pastaba pridėta, kad Actors sąveikauja su sistema per Views/Controllers

---

## 📊 **DABAR TURIME:**

### **6 top-level paketai (vietoje 8):**

```
1. MemberSubsystem
2. AdminSubsystem
3. DomainModel
4. DataAccess
5. ExternalServices
6. Core
```

---

## ✅ **PRIKLAUSOMYBĖS:**

### **Pašalintos:**
- ❌ `Controllers ..> Services : uses`
- ❌ `Services ..> DomainModel.Entities : uses entities`
- ❌ `Services ..> DataAccess.Repositories : uses`
- ❌ `Services ..> ExternalServices : calls`
- ❌ `Services ..> Core : uses`
- ❌ `Actors.FamilyMember ..> Views : interacts`
- ❌ `Actors.FamilyAdministrator ..> Views : interacts`
- ❌ `Actors.GoogleAuthentication ..> AuthController : OAuth flow`

### **Paliktos:**
- ✅ `Controllers ..> DomainModel.Entities : uses entities`
- ✅ `Controllers → Services (implied per pastabas)`
- ✅ `DataAccess.Repositories ..> DomainModel.Entities : uses entities`
- ✅ `DataAccess.Repositories ..> SupabaseGateway : uses`
- ✅ `DomainModel.Entities ..> DomainModel.Enumerations : uses`

---

## 📝 **PASTABOS:**

### **Services (implied):**
```
Services (implied, ne parodyta kaip paketas):
- Verslo logikos sluoksnis, koordinuoja Repositories + External Boundaries
- Naudoja Domain entities
- Vyksta Flutter app viduje
- Controllers naudoja Services per dependencies (implied)
```

### **Actors (implied):**
```
Actors (išoriniai veikėjai) nėra sistemos komponentai
Jie sąveikauja su sistema per Views/Controllers (implied):
- FamilyMember, FamilyAdministrator, Guest → Views
- GoogleAuthentication → AuthController
- StoreWebsite → DealsScraperService (external data)
```

---

## ✅ **IŠVADA:**

**Package diagrama dabar supaprastinta:**
- ✅ 6 top-level paketai (vietoje 8)
- ✅ Services ir Actors rodomi kaip "implied" (per pastabas)
- ✅ Viskas vis tiek aiškiai parodyta
- ✅ Diagrama supaprastinta, bet informacija neprarasta


























