# 🔍 Barcode Scanning - Kaip Veikia?

## ❓ **Klausimas:**

Su OpenFoodFactsService atpažįstame Barcodes?

---

## ✅ **Atsakymas: NE - jie atlieka SKIRTINGAS funkcijas!**

---

## 📊 **KAIP VEIKIA BARCODE PIPELINE:**

### **1. MobileScannerBoundary - Nuskaityti Barcode:**

```
User → MobileScannerBoundary (kamera)
  ↓
Nuskaitytas barcode: "5901234123457"
  ↓
BarcodeScannerService
```

**Funkcija:** Nuskaityti barcode numerį iš produkto (kamera)

---

### **2. BarcodeScannerService - Koordinuoja:**

```
BarcodeScannerService
  ↓
1. Naudoja MobileScannerBoundary (nuskaityti barcode)
2. Naudoja OpenFoodFactsServiceBoundary (gauti produkto duomenis)
```

---

### **3. OpenFoodFactsServiceBoundary - Gauti Produkto Duomenis:**

```
BarcodeScannerService → OpenFoodFactsServiceBoundary
  ↓
HTTP GET: https://world.openfoodfacts.org/api/v0/product/5901234123457.json
  ↓
Produkto duomenys:
  - name: "Coca Cola"
  - category: "Beverages"
  - nutrition_info: {...}
  - ingredients: {...}
```

**Funkcija:** Gauti produkto duomenis PAGAL barcode (API kvietimas)

---

## ✅ **IŠVADA:**

**ABU REIKALINGI:**

1. ✅ **MobileScannerBoundary** - nuskaityti barcode (INPUT)
2. ✅ **OpenFoodFactsServiceBoundary** - gauti produkto duomenis (API)

**Jie dirba KARTU, bet atlieka skirtingas funkcijas!**

---

## 📋 **PIPELINE:**

```
User
  ↓
MobileScannerBoundary (kamera)
  ↓ Nuskaitytas barcode
BarcodeScannerService
  ↓ Barcode numeris
OpenFoodFactsServiceBoundary (API)
  ↓ Produkto duomenys
ProductEntity
```

---

## ✅ **DIAGRAMOJE:**

- ✅ **MobileScannerBoundary** - ExternalServices (kamera)
- ✅ **OpenFoodFactsServiceBoundary** - ExternalServices (API)
- ✅ **BarcodeScannerService** - Services (koordinuoja abu)

**Viskas teisingai!** ✅


























