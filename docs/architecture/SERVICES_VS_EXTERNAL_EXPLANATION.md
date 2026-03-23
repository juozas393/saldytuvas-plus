# 📦 Services vs ExternalServices - Skirtumas

## ❓ **Klausimas:**

Kodėl yra Services IR ExternalServices? Ar nėra dublikatų?

---

## ✅ **SKIRTUMAS:**

### **ExternalServices = Boundaries (Adapters):**

**Tiesioginis interface** su išoriniu API/įrenginiu:

```
ExternalServices
├── CameraGalleryBoundary ← tiesioginis Flutter image_picker
├── MobileScannerBoundary ← tiesioginis mobile_scanner paketas
└── OpenFoodFactsServiceBoundary ← tiesioginis HTTP kvietimas
```

**Paskirtis:** Minimalus adapteris - tiesiog wrap'ina išorinį API/įrenginį

---

### **Services = Business Logic (Coordinators):**

**Verslo logika** + koordinacija + error handling:

```
Services
├── BarcodeScannerService
│   ├── Naudoja: MobileScannerBoundary (nuskaityti barcode)
│   ├── Naudoja: OpenFoodFactsServiceBoundary (gauti duomenis)
│   ├── Validacija: Barcode checksum
│   ├── Error handling: Jei API fail, fallback
│   └── Business logic: Koordinuoja visą barcode pipeline
│
└── OpenFoodFactsService
    ├── Naudoja: OpenFoodFactsServiceBoundary (HTTP kvietimas)
    ├── Caching: Rezultatų cache
    ├── Error handling: Retry logic
    └── Data transformation: API response → ProductEntity
```

**Paskirtis:** Verslo logika + koordinacija tarp Boundaries

---

## 📊 **PALYGINIMAS:**

| Aspect | ExternalServices | Services |
|--------|------------------|----------|
| **Tikslas** | Adapteris (interface) | Verslo logika (coordination) |
| **Sudėtingumas** | Minimalus (wrap) | Sudėtingas (logic + coordination) |
| **Error handling** | Minimalus | Detalus |
| **Caching** | Ne | Taip |
| **Validation** | Ne | Taip |
| **Business rules** | Ne | Taip |

---

## ✅ **PAVYZDYS:**

### **Barcode Scanning Pipeline:**

```
1. BarcodeScannerService (Services)
   ↓ koordinuoja
2. MobileScannerBoundary (ExternalServices)
   ↓ nuskaitytas barcode
3. BarcodeScannerService (Services)
   ↓ validacija + error handling
4. OpenFoodFactsServiceBoundary (ExternalServices)
   ↓ HTTP kvietimas
5. OpenFoodFactsService (Services)
   ↓ caching + transformation
6. ProductEntity
```

---

## ✅ **IŠVADA:**

**NĖRA DUBLIKATŲ!**

- ✅ **ExternalServices** = Minimalūs adapteriai (boundaries)
- ✅ **Services** = Verslo logika + koordinacija

**Jie dirba KARTU, bet atlieka skirtingas funkcijas!**

---

## 🎯 **MVP Services:**

**Tik 2-4 Services MVP versijai:**

1. ✅ `BarcodeScannerService` - koordinuoja barcode scanning
2. ✅ `OpenFoodFactsService` - produkto duomenys
3. ✅ `ShoppingListService` - pirkinių sąrašas (galbūt)
4. ✅ `NotificationService` - pranešimai (galbūt)

**Kiti services = Po MVP** ✅


























