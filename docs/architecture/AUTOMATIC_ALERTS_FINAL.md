# ✅ Automatiniai Įspėjimai - Ar Reikia Controller'ių?

## ✅ **Atsakymas: TAIP, controller'iai reikalingi KONFIGŪRACIJAI!**

---

## 🎯 **KAIP VEIKIA:**

### **1. AUTOMATINIS SIUNTIMAS (Be Controller'io):**

```
Cron Job (periodiškai, automatiškai)
  ↓ (tiesiogiai, BE controller'io)
Services.NotificationService
  ↓
- Tikrina: Ar yra expiring products?
- Tikrina: Ar biudžetas pasiekė limitą?
  ↓
Siunčia įspėjimus (push/email)
```

**Controller'io NEREIKIA** - automatinis procesas ✅

---

### **2. ADMIN KONFIGŪRACIJA (Reikia Controller'ių):**

#### **BudgetAlertController:**
```
Admin → ReceiptAndBudgetPage
  ↓
"Biudžeto perspėjimai" nustatymai
  ↓
BudgetAlertController ← REIKIA!
  ↓
Nustato:
- Kada perspėti? (pvz., 80% biudžeto)
- Kiekvienam nariui ar tik admin'ui?
- Email ar push notification?
  ↓
Išsaugo nustatymus (Repository)
```

#### **ExpirationAlertController:**
```
Admin → InventoryPage
  ↓
"Galiojimo perspėjimai" nustatymai
  ↓
ExpirationAlertController ← REIKIA!
  ↓
Nustato:
- Prieš kiek dienų perspėti? (pvz., 3 dienos)
- Kiekvienam nariui ar tik admin'ui?
- Email ar push notification?
  ↓
Išsaugo nustatymus (Repository)
```

---

## 📊 **PALYGINIMAS:**

| Procesas | Automatinis Siuntimas | Admin Konfigūracija |
|----------|----------------------|---------------------|
| **Biudžeto perspėjimai** | ✅ Cron → NotificationService (be controller'io) | ✅ Admin → BudgetAlertController (nustato parametrus) |
| **Galiojimo perspėjimai** | ✅ Cron → NotificationService (be controller'io) | ✅ Admin → ExpirationAlertController (nustato parametrus) |

---

## ✅ **KODĖL REIKIA CONTROLLER'IŲ?**

### **Controller'iai valdo KONFIGŪRACIJĄ, ne siuntimą:**

1. ✅ **Automatinis siuntimas** vyksta be controller'io (cron → NotificationService)
2. ✅ **Admin konfigūracija** vyksta per controller'ius (nustato parametrus)
3. ✅ Controller'iai išsaugo **nustatymus** (kiek dienų, limitai, ir t.t.)
4. ✅ NotificationService naudoja šiuos nustatymus automatiškai

---

## 🎯 **ARCHITEKTŪRA:**

### **Automatinis Siuntimas:**
```
Cron Job
  ↓
NotificationService
  ↓
- Skaito: BudgetAlertController nustatymus (iš Repository)
- Skaito: ExpirationAlertController nustatymus (iš Repository)
  ↓
Siunčia įspėjimus pagal nustatymus
```

### **Admin Konfigūracija:**
```
Views (SettingsPage / InventoryPage)
  ↓
BudgetAlertController / ExpirationAlertController
  ↓
- Nustato parametrus
  ↓
Repository (išsaugo nustatymus)
```

---

## ✅ **IŠVADA:**

### **Controller'iai yra LOGIŠKI ir REIKALINGI:**

- ✅ **Automatinis siuntimas** = be controller'io (cron tiesiogiai)
- ✅ **Admin konfigūracija** = su controller'iais (nustato parametrus)
- ✅ Controller'iai saugo **nustatymus**, kuriuos naudoja automatinis procesas

**Viskas tvarkoje!** ✅

---

## 📋 **PRIEŽASTYS, KODĖL ADMIN'UI REIKIA KONFIGŪRACIJOS:**

1. **Skirtingi nariai turi skirtingus poreikius:**
   - Vieni nori perspėjimo prieš 7 dienas
   - Kiti - prieš 2 dienas

2. **Biudžeto limitai:**
   - Vienos šeimos limitas - 500€
   - Kitos - 1000€
   - Admin'as nustato

3. **Notifikacijų tipai:**
   - Email arba Push notification?
   - Admin'as renkasi

4. **Perspėjimo taisyklės:**
   - Visiems nariams ar tik admin'ui?
   - Admin'as nustato

**Controller'iai reikalingi admin'ui, kad galėtų KONFIGŪRUOTI automatinio proceso parametrus!**


























