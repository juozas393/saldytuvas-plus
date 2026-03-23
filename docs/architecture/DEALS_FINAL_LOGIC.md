# 🎯 Deals (Nuolaidos) - Galutinė Logika

## ✅ **JŪSŲ REIKALAVIMAI:**

1. **Nuolaidas galima peržiūrėti** (Member + Admin)
2. **Nuolaidas atnaujina tik sistema** (automatiškai, be admin intervention)

---

## 📋 **STRUKTŪRA:**

### **1. Peržiūrėti Nuolaidas (Member + Admin):**

```
Member/Admin → DealsPage
  ↓
DealsController (MemberSubsystem.Controllers) ← REIKIA!
  ↓
- Peržiūri nuolaidas
- Filtruoja pagal store
- Rodo akcijų detales
  ↓
IDealsRepository
```

**Controller'is REIKIA** ✅ - `DealsController` (MemberSubsystem)

---

### **2. Atnaujinti Nuolaidas (Automatinis):**

```
Cron Job (kasdien, automatiškai)
  ↓ (tiesiogiai, BE controller'io)
DealsScraperService
  ↓
- Scraping iš store websites
- Parsing duomenų
  ↓
IDealsRepository
  ↓
Supabase
```

**Controller'io NEREIKIA** ✅ - Visiškai automatinis

---

## ✅ **ARCHITEKTŪRA:**

### **MemberSubsystem.Controllers:**
- ✅ `DealsController` - Peržiūrėti nuolaidas (read-only)

### **AdminSubsystem.Controllers:**
- ❌ `DealsUpdateController` - **PAŠALINTAS** (sistema atnaujina automatiškai)

---

## 📊 **PALYGINIMAS:**

| Funkcija | Member/Admin | Sistema |
|----------|--------------|---------|
| **Peržiūrėti nuolaidas** | ✅ DealsController | - |
| **Atnaujinti nuolaidas** | ❌ | ✅ Cron → DealsScraperService (automatiškai) |

---

## ✅ **GALUTINĖ IŠVADA:**

### **Struktūra:**

1. ✅ **`DealsController`** (MemberSubsystem) - Peržiūrėti nuolaidas
2. ❌ **`DealsUpdateController`** - **PAŠALINTAS** (sistema atnaujina automatiškai)

**Viskas tvarkoje!** ✅


























