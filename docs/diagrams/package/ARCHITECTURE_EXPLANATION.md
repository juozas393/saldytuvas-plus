# 📐 Loginė vs Fizinė Architektūra

## ⚠️ SVARBU: Diagrama rodo LOGINĘ architektūrą, ne fizinę struktūrą!

---

## 🎯 Kuo skiriasi?

### 📦 **LOGINĖ ARCHITEKTŪRA** (Package Diagram)
Rodo **komponentų priklausomybes ir ryšius** - KAS naudoja KĄ.

**Diagramoje:**
- `DomainModel` - bendras paketas (entities/enums)
- `DataAccess` - bendras paketas (repositories)
- `Services` - bendras paketas

**REIKŠMĖ:**
- Rodo, kad visi controllers/services naudoja tuos pačius entities
- Rodo, kad repositories yra bendri visoms features

---

### 📁 **FIZINĖ STRUKTŪRA** (Jūsų kodo struktūra)
Rodo **faktinę failų organizaciją** - KUR yra failai.

**Jūsų kode:**
```dart
lib/
  core/                    // ✅ Diagramoje = "Core"
    config/
    errors/
    network/
    storage/
    theme/
    utils/
  
  features/                // ✅ Diagramoje = "Šeimos nario posistemis"
    inventory/
      bloc/               // ✅ Diagramoje = "Controllers"
      models/             // ✅ Diagramoje = "DomainModel.Entities" 
      pages/              // ✅ Diagramoje = "Views"
      repositories/       // ✅ Diagramoje = "DataAccess.Repositories"
      widgets/
    
    meal_planner/
      bloc/
      models/
      pages/
      ...
  
  services/               // ✅ Diagramoje = "Services"
    meal_planning_service.dart
    shopping_list_service.dart
    ...
```

---

## ✅ Ar diagrama teisinga?

### ✅ **TAIP** - Loginė architektūra teisinga:

1. **Views → Controllers** ✅
   - Jūsų kode: `pages/` → `bloc/`
   - Diagramoje: `Views` → `Controllers`

2. **Controllers → Services** ✅
   - Jūsų kode: `bloc/` → `services/` (globalios)
   - Diagramoje: `Controllers` → `Services`

3. **Controllers → Repositories** ✅
   - Jūsų kode: `bloc/` → `repositories/` (feature-based)
   - Diagramoje: `Controllers` → `DataAccess.Repositories`

4. **Services → Domain + Repositories** ✅
   - Jūsų kode: `services/` naudoja `features/*/models/` ir `features/*/repositories/`
   - Diagramoje: `Services` → `DomainModel` + `DataAccess`

---

## 🤔 Kodėl diagramoje Entities/Repositories yra bendri?

**Loginė architektūra rodo:**
- KAD visos features naudoja tuos pačius entities (Product, Budget, ir t.t.)
- KAD repositories yra prieinami visiems

**Fizinė struktūra:**
- Entities yra `lib/features/inventory/models/`, `lib/features/budget/models/`, ir t.t.
- Bet tai yra **tos pačios klasės**, tik organizuotos pagal feature

---

## ✅ Išvada:

**Diagrama yra teisinga** - ji rodo LOGINĘ architektūrą (priklausomybes), ne fizinę struktūrą.

**Jūsų fizinė struktūra (feature-based) yra teisinga Flutter!**

```
Loginė architektūra (Diagrama):
- Rodo KAS naudoja KĄ
- Entities = bendri (visos features naudoja)

Fizinė struktūra (Jūsų kodas):
- Rodo KUR yra failai
- Entities = feature-based (bet tai tie patys objektai)
```

---

## 📋 Kaip naudoti diagramą:

1. **Loginė architektūra** (diagrama):
   - Suprasti priklausomybes
   - Pamatyti bendrus komponentus
   - Dizainuoti ryšius

2. **Fizinė struktūra** (jūsų kodas):
   - Organizuoti failus
   - Feature-based organizacija
   - Clean Architecture sluoksniai kiekvienoje feature

**Abu yra teisingi ir reikalingi!** ✅



























