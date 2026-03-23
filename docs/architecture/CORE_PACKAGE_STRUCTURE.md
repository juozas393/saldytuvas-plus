# 📦 Core Package - Kaip Susikurti?

## 🎯 **STRUKTŪRA:**

```
lib/core/
├── config/
│   └── app_config.dart
├── errors/
│   ├── exceptions.dart
│   └── failures.dart
├── network/
│   ├── supabase_client.dart
│   └── http_client.dart
├── storage/
│   └── local_storage.dart
├── theme/
│   └── app_theme.dart
└── utils/
    └── helpers.dart
```

---

## 📋 **1. CONFIG (Konfigūracija):**

### **lib/core/config/app_config.dart:**

```dart
class AppConfig {
  // Supabase
  static const String supabaseUrl = String.fromEnvironment('SUPABASE_URL');
  static const String supabaseAnonKey = String.fromEnvironment('SUPABASE_ANON_KEY');
  
  // Gemini (jei reikia)
  static const String geminiApiKey = String.fromEnvironment('GEMINI_API_KEY');
  
  // Open Food Facts
  static const String openFoodFactsBaseUrl = 'https://world.openfoodfacts.org';
  
  // App
  static const String appVersion = '1.0.0';
  static const bool isDebugMode = bool.fromEnvironment('DEBUG', defaultValue: false);
}
```

**Paskirtis:** Visos konfigūracijos (API keys, URLs, app nustatymai)

---

## 📋 **2. ERRORS (Klaidos):**

### **lib/core/errors/exceptions.dart:**

```dart
// Base exception
abstract class AppException implements Exception {
  final String message;
  AppException(this.message);
}

// Network exceptions
class NetworkException extends AppException {
  NetworkException(super.message);
}

class UnauthorizedException extends AppException {
  UnauthorizedException(super.message);
}

// Repository exceptions
class RepositoryException extends AppException {
  RepositoryException(super.message);
}
```

### **lib/core/errors/failures.dart:**

```dart
// Base failure
abstract class Failure {
  final String message;
  Failure(this.message);
}

// Specific failures
class NetworkFailure extends Failure {
  NetworkFailure(super.message);
}

class CacheFailure extends Failure {
  CacheFailure(super.message);
}
```

**Paskirtis:** Klaidos ir exception'ai visai sistemai

---

## 📋 **3. NETWORK (Tinklas):**

### **lib/core/network/supabase_client.dart:**

```dart
import 'package:supabase_flutter/supabase_flutter.dart';
import '../config/app_config.dart';

class SupabaseClient {
  static SupabaseClient? _instance;
  
  late final SupabaseClient client;
  
  SupabaseClient._() {
    client = Supabase.instance.client;
  }
  
  static SupabaseClient get instance {
    _instance ??= SupabaseClient._();
    return _instance!;
  }
}
```

### **lib/core/network/http_client.dart:**

```dart
import 'dart:io';
import 'package:http/http.dart' as http;
import '../errors/exceptions.dart';

class HttpClient {
  final http.Client _client;
  
  HttpClient({http.Client? client}) : _client = client ?? http.Client();
  
  Future<http.Response> get(Uri url, {Map<String, String>? headers}) async {
    try {
      final response = await _client.get(url, headers: headers);
      return response;
    } on SocketException {
      throw NetworkException('No internet connection');
    } catch (e) {
      throw NetworkException('Failed to fetch data: $e');
    }
  }
}
```

**Paskirtis:** HTTP ir Supabase klientai

---

## 📋 **4. STORAGE (Saugojimas):**

### **lib/core/storage/local_storage.dart:**

```dart
import 'package:shared_preferences/shared_preferences.dart';

class LocalStorage {
  static SharedPreferences? _prefs;
  
  static Future<void> init() async {
    _prefs = await SharedPreferences.getInstance();
  }
  
  static Future<bool> setString(String key, String value) async {
    return await _prefs?.setString(key, value) ?? false;
  }
  
  static String? getString(String key) {
    return _prefs?.getString(key);
  }
  
  static Future<bool> remove(String key) async {
    return await _prefs?.remove(key) ?? false;
  }
}
```

**Paskirtis:** Vietinis duomenų saugojimas (SharedPreferences, Hive, ir t.t.)

---

## 📋 **5. THEME (Tema):**

### **lib/core/theme/app_theme.dart:**

```dart
import 'package:flutter/material.dart';

class AppTheme {
  static ThemeData get lightTheme {
    return ThemeData(
      useMaterial3: true,
      colorScheme: ColorScheme.fromSeed(
        seedColor: Colors.blue,
        brightness: Brightness.light,
      ),
      // ... kiti nustatymai
    );
  }
  
  static ThemeData get darkTheme {
    return ThemeData(
      useMaterial3: true,
      colorScheme: ColorScheme.fromSeed(
        seedColor: Colors.blue,
        brightness: Brightness.dark,
      ),
      // ... kiti nustatymai
    );
  }
}
```

**Paskirtis:** Temos (light/dark mode)

---

## 📋 **6. UTILS (Pagalbinės funkcijos):**

### **lib/core/utils/helpers.dart:**

```dart
class Helpers {
  // Data formatavimas
  static String formatDate(DateTime date) {
    return '${date.day}/${date.month}/${date.year}';
  }
  
  // Validacija
  static bool isValidEmail(String email) {
    return RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$').hasMatch(email);
  }
  
  // Kiekiai
  static String formatQuantity(double quantity, String unit) {
    return '${quantity.toStringAsFixed(2)} $unit';
  }
}
```

**Paskirtis:** Pagalbinės funkcijos (formatavimas, validacija, ir t.t.)

---

## ✅ **PANAUDOJIMAS:**

### **Pavyzdys:**

```dart
// Config
final url = AppConfig.supabaseUrl;

// Network
final response = await HttpClient().get(Uri.parse(url));

// Storage
await LocalStorage.setString('token', 'abc123');

// Theme
return MaterialApp(theme: AppTheme.lightTheme);

// Utils
final formatted = Helpers.formatDate(DateTime.now());
```

---

## ✅ **IŠVADA:**

**Core paketas = Cross-cutting concerns:**
- ✅ Konfigūracija
- ✅ Klaidos
- ✅ Tinklas
- ✅ Saugojimas
- ✅ Tema
- ✅ Pagalbinės funkcijos

**Viskas paruošta naudoti visoje sistemoje!** ✅


























