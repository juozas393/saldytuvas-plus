# 💰 Biudžeto Controller'iai - Kaip Jie Veikia?

## 🎯 **JŪSŲ REIKALAVIMAI:**

1. **Biudžeto dydis ir valdymas:** Tik admin'as valdo
2. **Pranešimai apie biudžetą:** Sistema siunčia automatiškai, bet admin'as nustato, **kada** siųsti

---

## 📋 **DU CONTROLLER'IAI - SKIRTINGOMS FUNKCIJOMS:**

### **1. BudgetController - Biudžeto Valdymas:**

**Funkcija:** Admin'as valdo biudžeto dydį ir tvarkymą

```
Admin → ReceiptAndBudgetPage
  ↓
BudgetController ← REIKIA!
  ↓
- Nustato biudžeto dydį (pvz., 500€ per mėnesį)
- Valdo biudžeto kategorijas
- Redaguoja biudžeto nustatymus
- Peržiūri biudžeto suvestinę
  ↓
IBudgetRepository
```

**Use Case:** PAA6 - Valdyti biudžetą

---

### **2. BudgetAlertController - Pranešimų Konfigūracija:**

**Funkcija:** Admin'as nustato, **kada** siųsti pranešimus (automatinis siuntimas vyksta be controller'io)

```
AUTOMATINIS SIUNTIMAS (be controller'io):
Cron Job (periodiškai, automatiškai)
  ↓ (tiesiogiai)
NotificationService
  ↓
- Tikrina: Ar biudžetas pasiekė limitą?
  (pagal BudgetAlertController nustatymus)
  ↓
Siunčia pranešimus (push/email)

ADMIN KONFIGŪRACIJA (su controller'iu):
Admin → ReceiptAndBudgetPage
  ↓
BudgetAlertController ← REIKIA!
  ↓
- Nustato: Kada siųsti? (pvz., kai pasiekta 80% biudžeto)
- Nustato: Kiekvienam nariui ar tik admin'ui?
- Nustato: Email arba push notification?
- Nustato: Perspėjimo dažnumą
  ↓
Išsaugo nustatymus (Repository)
```

**Use Case:** PAA5 - Perspėti apie biudžeto būseną

---

## ✅ **KODĖL DU CONTROLLER'IAI?**

| Controller | Funkcija | Automatinis | Admin Valdymas |
|------------|----------|-------------|----------------|
| `BudgetController` | Valdyti biudžetą (dydis, kategorijos) | ❌ | ✅ Admin valdo |
| `BudgetAlertController` | Nustatyti pranešimų parametrus | ✅ Sistema siunčia automatiškai | ✅ Admin konfigūruoja |

---

## 🎯 **ARCHITEKTŪRA:**

### **Biudžeto Valdymas:**
```
ReceiptAndBudgetPage (MemberSubsystem.Views)
  ↓ (su admin permissions)
BudgetController (AdminSubsystem.Controllers)
  ↓
- Nustato biudžeto dydį
- Valdo kategorijas
  ↓
IBudgetRepository
```

### **Pranešimų Konfigūracija:**
```
ReceiptAndBudgetPage (MemberSubsystem.Views)
  ↓ (su admin permissions)
BudgetAlertController (AdminSubsystem.Controllers)
  ↓
- Nustato pranešimų parametrus
  ↓
IBudgetRepository (išsaugo nustatymus)
```

### **Automatinis Siuntimas:**
```
Cron Job
  ↓ (tiesiogiai, be controller'io)
NotificationService
  ↓
- Skaito BudgetAlertController nustatymus (iš Repository)
- Tikrina biudžeto būseną
- Siunčia pranešimus pagal nustatymus
```

---

## ✅ **IŠVADA:**

### **Du Controller'iai - Teisinga Struktūra:**

1. ✅ **`BudgetController`** - Admin valdo biudžetą (dydis, tvarkymas)
2. ✅ **`BudgetAlertController`** - Admin nustato pranešimų parametrus (kada siųsti)

**Automatinis siuntimas vyksta be controller'io** (cron → NotificationService), bet naudoja `BudgetAlertController` nustatymus!

**Viskas tvarkoje!** ✅


























