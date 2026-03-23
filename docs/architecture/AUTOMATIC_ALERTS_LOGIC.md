# 🎯 Automatiniai Įspėjimai - Ar Reikia Controller'ių?

## ❓ **Klausimas:**

Jei sistema **automatiškai** siunčia įspėjimus apie:
1. Galiojimo pabaigą (`ExpirationAlertController`)
2. Biudžeto keičiančią būseną (`BudgetAlertController`)

Kam reikia šių controller'ių?

---

## ✅ **Atsakymas: Controller'iai reikalingi KONFIGŪRACIJAI!**

---

## 📋 **AUTOMATINIS PROCESAS:**

### **1. Automatiniai Įspėjimai (Backend Cron):**

```
Cron Job (periodiškai)
  ↓
NotificationService (tiesiogiai)
  ↓
- Tikrina expiring products
- Tikrina budget status
  ↓
Siunčia įspėjimus (push/email)
```

**Controller'io NEREIKIA** - tai backend procesas ✅

---

## 📋 **ADMIN KONFIGŪRACIJA (UI):**

### **2. Admin'as nustato perspėjimo parametrus:**

```
Admin → SettingsPage
  ↓
"Biudžeto perspėjimai" sekcija
  ↓
BudgetAlertController ← REIKIA!
  ↓
- Nustato: prieš kiek dienų perspėti
- Nustato: limitą (pvz., 80% biudžeto)
- Nustato: kokiems nariams siųsti
```

```
Admin → InventoryPage
  ↓
"Galiojimo perspėjimai" sekcija
  ↓
ExpirationAlertController ← REIKIA!
  ↓
- Nustato: prieš kiek dienų perspėti
- Nustato: kokiems nariams siųsti
```

---

## ✅ **KODĖL REIKIA CONTROLLER'IŲ?**

### **Admin'as valdo AUTOMATINIO proceso PARAMETRUS:**

| Controller | Funkcija | Automatinis procesas | Admin valdymas |
|------------|----------|---------------------|----------------|
| `BudgetAlertController` | Nustatyti biudžeto perspėjimo parametrus | ✅ Siunčia automatiškai | ✅ Admin konfigūruoja |
| `ExpirationAlertController` | Nustatyti galiojimo perspėjimo parametrus | ✅ Siunčia automatiškai | ✅ Admin konfigūruoja |

---

## 🎯 **ARCHITEKTŪRA:**

### **Automatinis Įspėjimas:**
```
Cron Job
  ↓ (tiesiogiai)
Services.NotificationService
  ↓
- Tikrina: ExpirationAlertController nustatymus
- Tikrina: BudgetAlertController nustatymus
  ↓
Siunčia įspėjimus
```

### **Admin Konfigūracija:**
```
MemberSubsystem.Views.SettingsPage / InventoryPage
  ↓
AdminSubsystem.Controllers.BudgetAlertController / ExpirationAlertController
  ↓
- Nustato parametrus (kiek dienų, limitai, ir t.t.)
  ↓
IDealsRepository / IBudgetRepository (išsaugo nustatymus)
```

---

## ✅ **IŠVADA:**

### **Controller'iai yra LOGIŠKI, nes:**

1. ✅ **Automatinis siuntimas** vyksta be controller'io (cron → NotificationService)
2. ✅ **Admin konfigūracija** vyksta per controller'ius (UI → controller → repository)
3. ✅ Controller'iai saugo **PARAMETRUS** (kiek dienų, limitai, ir t.t.)
4. ✅ NotificationService naudoja šiuos parametrus automatiškai

---

## 📊 **PALYGINIMAS:**

| Procesas | Automatinis | Admin valdymas | Controller'is |
|----------|-------------|----------------|---------------|
| **Biudžeto perspėjimai** | ✅ Cron → NotificationService | ✅ Nustato parametrus | ✅ `BudgetAlertController` |
| **Galiojimo perspėjimai** | ✅ Cron → NotificationService | ✅ Nustato parametrus | ✅ `ExpirationAlertController` |

---

## ✅ **GALUTINĖ IŠVADA:**

**Controller'iai yra REIKALINGI ir LOGIŠKI!**

- ✅ Automatinis siuntimas = be controller'io (cron tiesiogiai)
- ✅ Admin konfigūracija = su controller'iais (nustato parametrus)
- ✅ Controller'iai saugo **nustatymus**, kuriuos naudoja automatinis procesas

**Viskas tvarkoje!** ✅


























