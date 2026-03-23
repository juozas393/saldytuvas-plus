# Nuskanuoti čeki - Step-by-Step Aprašymas (pagal diagramą)

## Kaip tikrai vyksta viskas - su paaiškinimais

---

## 1. Pradžia: Pasirinkimas nuotraukos šaltinio

### 1.1. Vartotojas inicijuoja procesą
- **Vartotojas:** Paspaudžia mygtuką "Nuskaityti kvitą" (`receipts_page.dart`)
- **Sistema:** Parodo pasirinkimą (BottomSheet arba Dialog):
  - "📷 Nufotografuoti" (kamera)
  - "🖼️ Pasirinkti iš galerijos"

### 1.2. Vartotojas pasirenka vieną iš variantų

**VARIANTAS A: Galerija**
- **Vartotojas:** Paspaudžia mygtuką "Galerija"
- **Sistema:** Tikrina, ar yra leidimas naudotis galerija
  - **Jei leidimas suteiktas:**
    - Sistema atidaro galeriją
    - Vartotojas pasirenka nuotrauką
  - **Jei leidimas nesuteiktas:**
    - Sistema parodo leidimo langą
    - Vartotojas suteikia leidimą
    - Sistema atidaro galeriją
    - Vartotojas pasirenka nuotrauką

**VARIANTAS B: Kamera**
- **Vartotojas:** Paspaudžia mygtuką "Atidaryti kamerą"
- **Sistema:** Tikrina, ar yra leidimas naudotis kamera
  - **Jei leidimas suteiktas:**
    - Sistema atidaro kamerą
    - Vartotojas nufotografuoja čeki
  - **Jei leidimas nesuteiktas:**
    - Sistema parodo leidimo langą
    - Vartotojas suteikia leidimą
    - Sistema atidaro kamerą
    - Vartotojas nufotografuoja čeki

**VARIANTAS C: Rankinis įvedimas**
- **Vartotojas:** Pasirenka "Įvesti ranka"
- **Sistema:** Rodo formą produktų įvedimui
- Vartotojas suveda produktų informaciją
- Vartotojas užpildo visus produkto laukus
- Procesas baigiasi (ne OCR srautas)

---

## 2. Nuotraukos gavimas

**Kas vyksta:**
- **Sistema gauna nuotrauką:**
  - Jei iš galerijos: `ImagePicker().pickImage(source: ImageSource.gallery)`
  - Jei iš kameros: `ImagePicker().pickImage(source: ImageSource.camera)`
- Rezultatas: `XFile?` objektas, konvertuojamas į `File`
- Kelias pavyzdys: `/data/user/0/.../cache/image_picker_123.jpg`

---

## 3. Nuotraukos nuskaitymas į atmintį

**Kas vyksta:**
```dart
import 'package:image/image.dart' as img;

final imageBytes = await file.readAsBytes();
final image = img.decodeImage(imageBytes); // img.Image objektas
```

**Kodėl tai reikalinga?**
- Nuotrauka nuskaityta iš failo sistemos į atmintį kaip `Image` objektas
- Dabar galime manipuliuoti vaizdu (keisti dydį, filtrus, ir t.t.)

---

## 4. Matmenų gavimas

**Kas vyksta:**
```dart
final width = image.width;   // pvz., 3024 pikseliai
final height = image.height; // pvz., 4032 pikseliai
```

**Kodėl tai reikalinga?**
- Reikia matmenų, kad apskaičiuotume DPI
- Reikia matmenų, jei reikės keisti dydį

---

## 5. DPI ekvivalento apskaičiavimas

**Kas vyksta:**

1. **Apskaičiuojame DPI:**
   - Standartinis kvitas yra ~8.5 x 11 colių (A4 formato)
   - Jei nuotrauka 3024x4032 pikseliai → tikėtina, kad yra ~300 DPI (jei fotografuota iš arti)
   - Jei nuotrauka 1500x2000 pikseliai → tikėtina, kad yra ~150 DPI

2. **Jei DPI < 300:**
   ```dart
   final scaleFactor = 300 / calculatedDpi; // pvz., 2.0 jei 150 DPI
   final newWidth = (width * scaleFactor).round();
   final newHeight = (height * scaleFactor).round();
   
   final resized = img.copyResize(
     image,
     width: newWidth,
     height: newHeight,
     interpolation: img.Interpolation.cubic, // geriausias kokybė
   );
   image = resized;
   ```

**Kodėl 300 DPI?**
- OCR bibliotekos (Tesseract, ML Kit) rekomenduoja ≥300 DPI optimaliam rezultatui
- Mažesnė rezoliucija → mažesnis confidence → daugiau klaidų

**Jei DPI ≥ 300:**
- Sistema tęsia be dydžio keitimo

---

## 6. Nuotraukos apdorojimas (vietoje)

### 6.1. Grayscale konversija

**Kas vyksta:**
```dart
final grayscale = img.grayscale(image); // Konvertuoja RGB → Grayscale
```

**Kodėl pašaliname spalvas?**
- OCR analizuoja tik šviesumo skirtumus
- Spalvos gali trukdyti - pvz., raudonas tekstas ant baltos gali būti sunkiau atpažįstamas
- Grayscale sumažina duomenų kiekį → greičiau apdorojama

**Kaip veikia:**
- Kiekvienas pikselis: `(R + G + B) / 3` arba naudoja svorius: `0.299*R + 0.587*G + 0.114*B`

### 6.2. Brightness apskaičiavimas

**Kas vyksta:**
```dart
int totalBrightness = 0;
for (int y = 0; y < height; y++) {
  for (int x = 0; x < width; x++) {
    totalBrightness += grayscale.getPixel(x, y).luminance;
  }
}
final averageBrightness = totalBrightness / (width * height);
```

**Kodėl reikalinga?**
- Reikia vidutinio šviesumo, kad taikytume adaptive threshold

### 6.3. Adaptive Threshold (kontrasto pagerinimas)

**Kas vyksta:**
- Pikseliai, kurie tamsesni už vidurkį → padarome juodus (0)
- Pikseliai, kurie šviesesni už vidurkį → padarome baltus (255)
- Rezultatas: tik juodas tekstas ant baltos fono

**Kodėl "adaptive"?**
- Ne visos nuotraukos turi vienodą apšvietimą
- Adaptive threshold prisitaiko prie vietinio šviesumo kiekvienoje srityje

**Kodėl tai reikalinga?**
- Pagerina teksto ir fonų atskyrimą → aukštesnis confidence

### 6.4. Triukšmo šalinimas

**Kas vyksta:**
- Sistema taiko median filter - kiekvienas pikselis pakeičiamas jo kaimynų median reikšme
- Tai pašalina atskirus triukšmo taškus (pvz., dulkės, scratch'ai)

**Kodėl reikalinga?**
- Nuotraukos dažnai turi triukšmo → OCR gali atpažinti neteisingai
- Šalinimas pagerina confidence

### 6.5. Smoothing (išlyginimas)

**Kas vyksta:**
- Sistema išlygina kraštus, pašalina raiščius

### 6.6. Išsaugojimas

**Kas vyksta:**
```dart
final processedBytes = img.encodeJpg(grayscaleImage, quality: 85);
final processedFile = File('${tempDir.path}/receipt_processed_${timestamp}.jpg');
await processedFile.writeAsBytes(processedBytes);
```

**Kodėl išsaugome?**
- Reikės vėliau siųsti į OCR API
- Jei klaida → galime pakartoti be naujo apdorojimo

---

## 7. OCR apdorojimas (Isolate)

**Kodėl naudojame Isolate?**
- OCR apdorojimas gali užtrukti 3-5 sekundes
- Jei vykdoma pagrindiniame thread'e → UI užstringa (freeze)
- Isolate leidžia vykdyti fone, neblokuojant UI

**Kas vyksta:**
```dart
final ocrResult = await compute(_processOcr, processedFile);
// compute() automatiškai sukuria Isolate ir perduoda darbą į jį
```

### 7.1. OCR API kvietimas

**Variantas A: ML Kit (Google)**
```dart
final inputImage = InputImage.fromFile(processedFile);
final textRecognizer = TextRecognizer(script: TextRecognitionScript.latin);

final recognizedText = await textRecognizer.processImage(inputImage);
```

**Variantas B: Tesseract OCR**
```dart
final result = await TesseractOcr.extractText(
  processedFile.path,
  language: 'lit+eng+rus', // lietuvių + anglų + rusų
);
```

**Kodėl lit+eng+rus?**
- Lietuvos čekiai dažnai turi lietuvių, anglų ir rusų kalbas
- Daugiakalbė OCR pagerina tikslumą

### 7.2. Teksto normalizavimas

**Kas vyksta:**

1. **Whitespace normalizavimas:**
   ```dart
   String normalizeWhitespace(String text) {
     return text
       .replaceAll(RegExp(r'\s+'), ' ') // kelis tarpus → vienas
       .replaceAll(RegExp(r'\n\s*\n'), '\n') // kelias tuščias eilutes → viena
       .trim();
   }
   ```

2. **Valiutos simbolių konversija:**
   ```dart
   text = text.replaceAll('EUR', '€');
   text = text.replaceAll('Euro', '€');
   ```

3. **Eilučių išskaldymas:**
   ```dart
   final lines = text.split('\n').where((line) => line.trim().isNotEmpty).toList();
   ```

4. **Confidence skaičiavimas:**
   ```dart
   double calculateOverallConfidence(List<Line> lines) {
     if (lines.isEmpty) return 0.0;
     final sum = lines.map((l) => l.confidence).reduce((a, b) => a + b);
     return sum / lines.length; // vidutinis confidence
   }
   ```

**Rezultatas:** Sistema turi struktūrizuotą tekstą su confidence reikšme

---

## 8. Barcode paieška ir Supabase patikra

### 8.1. Barcode paieška OCR tekste

**Kas vyksta:**

1. **Ieškome barcode modelio:**
   ```dart
   // EAN-13: 13 skaitmenų (pvz., 5901234123457)
   // UPC: 12 skaitmenų
   final barcodeRegex = RegExp(r'\b\d{12,13}\b');
   final matches = barcodeRegex.allMatches(ocrText);
   ```

2. **Validuojame barcode (checksum):**
   ```dart
   bool isValidEan13(String barcode) {
     if (barcode.length != 13) return false;
     
     int sum = 0;
     for (int i = 0; i < 12; i++) {
       int digit = int.parse(barcode[i]);
       sum += (i % 2 == 0) ? digit : digit * 3;
     }
     int checksum = (10 - (sum % 10)) % 10;
     return checksum == int.parse(barcode[12]);
   }
   ```

**Kodėl validuojame?**
- OCR gali atpažinti neteisingai (pvz., `5901234123457` → `5901234123451`)
- Checksum validacija pašalina neteisingus barcode

### 8.2. Supabase barcode užklausa

**Jei barcode rastas ir validus:**

```dart
// Sistema → Supabase
final response = await supabase
  .from('products')
  .select('id, name, category, nutrition_info, barcode')
  .eq('barcode', barcode)
  .maybeSingle(); // grąžina null jei nerasta
```

**Supabase gauna ir apdoroja:**
- Supabase vykdo SQL užklausą: `SELECT * FROM products WHERE barcode = '5901234123457'`
- Jei rastas → grąžina produkto objektą
- Jei nerastas → grąžina `null`

**Kodėl pirmiausia Supabase?**
- Greitesnis nei Gemini API
- Patikimesnis (duomenys iš mūsų DB)
- Nemokamas (nemokame už API kvietimą)

**Rezultato apdorojimas:**
- Jei rastas: `confidence = 0.9` (aukštas, nes iš DB)
- Jei nerastas: sistema pereina prie Gemini API

---

## 9. Gemini API klasifikacija (fallback)

**Kodėl naudojame Gemini?**
- Kai barcode nerastas DB → reikia AI, kad išanalizuotų tekstą
- Gemini supranta lietuvių kalbą ir produkto pavadinimus

**Kas vyksta:**

```dart
final prompt = '''
Išanalizuok šį čekio tekstą ir grąžink produktų sąrašą JSON formatu.

Čekio tekstas:
$ocrText

Grąžink JSON su šia struktūra:
{
  "products": [...],
  "store": "...",
  "totalAmount": ...,
  "date": "..."
}
''';

final geminiResponse = await geminiApi.generateContent(
  model: 'gemini-pro',
  contents: [Content.text(prompt)],
);
```

**Gemini API gauna ir apdoroja:**
- Gemini analizuoja tekstą naudojant LLM
- Gemini supranta lietuvių kalbą, produktų pavadinimus
- Gemini generuoja struktūrizuotą JSON

**Gemini grąžina sistemai:**
```json
{
  "products": [
    {"name": "Pienas", "quantity": 1.0, "unit": "l", "price": 2.49}
  ],
  "store": "Maxima",
  "totalAmount": 42.18,
  "date": "2025-03-11"
}
```

**Sistema gauna ir validuoja:**
- Validuojame JSON struktūrą
- Jei neteisingas → fallback į rankinį įvedimą
- Jei teisingas: `confidence = 0.7` (vidutinis - AI gali klysti)

---

## 10. Rezultatų validacija ir rankinis patvirtinimas

**Kas vyksta:**

```dart
if (overallConfidence < 0.6) {
  // Rodo redagavimo langą
  showManualConfirmationDialog(products);
}
```

**Kodėl 0.6 riba?**
- Confidence < 0.6 → tikimybė, kad yra klaidų, yra didelė
- Geriau leisti vartotojui patikrinti/redaguoti

**Rankinis patvirtinimas:**
- Sistema rodo UI su produktų sąrašu
- Kiekvienas produktas turi redaguojamus laukus ir confidence indikatorių
- Vartotojas redaguoja, pašalina, prideda

**Rezultatas:** Sistema turi patvirtintą produktų sąrašą

---

## 11. Duomenų įrašymas į Supabase

### 11.1. Inventoriaus atnaujinimas (jei pažymėta)

**Kas vyksta:**

```dart
// Sistema → Supabase Inventory
final inventoryItems = selectedProducts.map((product) => {
  'user_id': userId,
  'product_name': product.name,
  'quantity': product.quantity,
  'unit': product.unit,
  'expiry_date': product.expiryDate,
  'receipt_id': receiptId,
}).toList();

final response = await supabase
  .from('inventory_items')
  .insert(inventoryItems)
  .select('id');

final inventoryIds = response.map((r) => r['id']).toList();
```

**Supabase gauna ir įrašo:**
- Supabase vykdo `INSERT INTO inventory_items ...`
- Supabase grąžina sukurtų įrašų ID

### 11.2. Čekio įrašymas į biudžetą

**Kas vyksta:**

```dart
// Sistema → Supabase Budget
final receiptData = {
  'user_id': userId,
  'store': store,
  'total_amount': totalAmount,
  'date': date.toIso8601String(),
  'category': category,
  'items_count': products.length,
};

final receiptResponse = await supabase
  .from('receipts')
  .insert(receiptData)
  .select('id')
  .single();

final receiptId = receiptResponse['id'];
```

**Supabase gauna ir įrašo:**
- Supabase įrašo į `receipts` lentelę
- Supabase atnaujina `budget_summary` lentelę (mėnesio išlaidos)

**Rezultatas:** Visi duomenys įrašyti, susieti su vartotoju

---

## 12. UI atnaujinimas ir užbaigimas

### 12.1. Raw nuotraukos ištrynimas

**Kas vyksta:**

```dart
if (!userConfirmedSave) {
  await processedFile.delete(); // ištriname apdorotą
  await originalFile.delete();  // ištriname originalą (jei temp)
}
```

**Kodėl triname?**
- Privatumas - nereikalingi vaizdai neturėtų būti laikomi
- Taupome vietą

### 12.2. Logavimas

**Kas vyksta:**

```dart
logger.info('Receipt scanned', {
  'receiptId': receiptId,
  'store': store,
  'totalAmount': totalAmount,
  // NEIŠSAUGOJAME: nuotraukos kelio, asmeninių duomenų
});
```

**Kodėl tik receiptId, store, amount?**
- Privatumas - loguose nereikia jautrios informacijos
- Pakanka diagnostikai

### 12.3. Vartotojo pranešimas

**Kas vyksta:**
- Sistema rodo `SnackBar`: "✅ Čekis sėkmingai pridėtas"
- Sistema naviguoja į `ReceiptDetailPage(receiptId: receiptId)`
- UI atnaujina biudžeto diagramą

**Rezultatas:** Vartotojas mato sėkmės pranešimą ir naują čekį

---

**Versija:** 2025-03-11  
**Aprašymas pagal activity diagramą su paaiškinimais**
