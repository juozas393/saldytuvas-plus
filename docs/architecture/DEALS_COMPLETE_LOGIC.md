# ✅ Deals (Nuolaidos) - Pilna Logika

## 🎯 **JŪSŲ REIKALAVIMAI:**

1. ✅ **Nuolaidas galima peržiūrėti** (Member + Admin)
2. ✅ **Nuolaidas atnaujina tik sistema** (automatiškai, be admin intervention)

---

## 📋 **STRUKTŪRA:**

### **1. Peržiūrėti Nuolaidas (Member + Admin):**

```
Member/Admin → DealsPage (MemberSubsystem.Views)
  ↓
DealsController (MemberSubsystem.Controllers) ← REIKIA!
  ↓
- Peržiūri nuolaidas
- Filtruoja pagal store (Maxima, Lidl, IKI, Rimi)
- Rodo akcijų detales
- StoreDealsPage (filtruota per store)
  ↓
IDealsRepository
  ↓
Supabase
```

**Controller'is:** ✅ `DealsController` (MemberSubsystem) - peržiūrėti

---

### **2. Atnaujinti Nuolaidas (Automatinis):**

```
Cron Job (kasdien, automatiškai)
  ↓ (tiesiogiai, BE controller'io)
DealsScraperService (Services)
  ↓
- Scraping iš store websites (Maxima, Lidl, IKI, Rimi)
- Parsing HTML/PDF
- Normalizavimas į Deal modelį
  ↓
IDealsRepository
  ↓
SupabaseGateway
  ↓
Supabase
```

**Controller'is:** ❌ **NEREIKIA** - Visiškai automatinis

---

## ✅ **ARCHITEKTŪRA:**

### **MemberSubsystem.Controllers:**
- ✅ `DealsController` - Peržiūrėti nuolaidas (read-only)

### **AdminSubsystem.Controllers:**
- ❌ `DealsUpdateController` - **PAŠALINTAS** (sistema atnaujina automatiškai)

---

## 📊 **PALYGINIMAS:**

| Funkcija | Vartotojas (Member/Admin) | Sistema |
|----------|---------------------------|---------|
| **Peržiūrėti nuolaidas** | ✅ DealsController | - |
| **Filtruoti pagal store** | ✅ DealsController | - |
| **Atnaujinti nuolaidas** | ❌ | ✅ Cron → DealsScraperService (automatiškai) |

---

## 🎯 **USE CASE MAPPING:**

### **Member Use Cases:**
- ✅ **PAN6 - Peržiūrėti akcijas** → `DealsController` (MemberSubsystem)

### **Admin Use Cases:**
- ❌ **PAA3 - Atnaujinti akcijas** → **PAŠALINTAS** (sistema atnaujina automatiškai)

---

## ✅ **GALUTINĖ IŠVADA:**

### **Struktūra:**

1. ✅ **`DealsController`** (MemberSubsystem) - Peržiūrėti nuolaidas
   - Member: Peržiūri
   - Admin: Peržiūri

2. ❌ **`DealsUpdateController`** - **PAŠALINTAS**
   - Sistema atnaujina automatiškai per cron job

**Viskas tvarkoje!** ✅

---

## 📋 **AUTOMATINIS PROCESAS:**

```
Backend (Docker/Supabase Edge Function)
  ↓
Cron Job (kasdien 06:00)
  ↓
DealsScraperService.scrapeDeals()
  ↓
StoreWebsite (Maxima, Lidl, IKI, Rimi)
  ↓
Parse → Deal entities
  ↓
IDealsRepository.upsertDeals()
  ↓
Supabase
```

**Nėra UI interaction, nėra controller'io!** ✅


























