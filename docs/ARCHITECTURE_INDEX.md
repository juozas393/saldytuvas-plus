# 📚 Architektūros Dokumentacijos Indeksas

> **Tikslas:** Greitai rasti visus pages, diagramas ir architektūros dokumentus.

---

## 📋 **1. VISI PAGES (Langai)**

### **Pagrindiniai Dokumentai:**
- **`docs/architecture/LANGAI_SARASAS.md`** - Pilnas 14-15 langų sąrašas su statusais
- **`docs/architecture/COMPLETE_ARCHITECTURE_OVERVIEW.md`** - 15 langų sąrašas (MemberSubsystem.Views)
- **`docs/architecture/mvc_robustness_structure.md`** - Visi langai su Controller'iais ir API

### **15 Langų Sąrašas (MemberSubsystem.Views):**
1. `HomePage` (Dashboard) - Pagrindinis ekranas
2. `LoginPage` - Prisijungimas
3. `InventoryPage` - Inventorius
4. `ProductDetailsPage` - Produkto detalės
5. `AddProductPage` - Pridėti produktą
6. `ReceiptAndBudgetPage` - Čekiai ir biudžetas
7. `DealsPage` - Akcijos
8. `StoreDealsPage` - Parduotuvės akcijos
9. `ShoppingListScreen` - Pirkinių sąrašas
10. `MealPlanningPage` - Mitybos planavimas
11. `DishDetailsPage` - Patiekalo detalės
12. `AddRecipePage` - Pridėti receptą
13. `NutritionPage` - Mitybos informacija
14. `ProfilePage` - Profilis
15. `SettingsPage` - Nustatymai

### **Feature-Specific Dokumentai:**
- **`docs/features/NUTRITION_SCREEN.md`** - NutritionPage aprašymas

---

## 📊 **2. SEQUENCE DIAGRAMOS**

### **Vieta:** `docs/diagrams/sequence/`

#### **Meal Planning:**
- `create_meal_plan.puml` - Sukurti mitybos planą
- `edit_meal_plan.puml` - Redaguoti mitybos planą
- `delete_meal_plan.puml` - Ištrinti mitybos planą
- `view_meal_plan.puml` - Peržiūrėti mitybos planą
- `recognize_and_update_meal.puml` - Atpažinti ir atnaujinti valgį

#### **Products:**
- `manage_products.puml` - Valdyti produktus
- `manage_products_COMPLETE.puml` - Pilnas produktų valdymas
- `manage_products_EXPLANATION.md` - Paaiškinimas

#### **Health:**
- `evaluate_health_score.puml` - Įvertinti sveikatos balą

---

## 🎯 **3. USE CASE DIAGRAMOS**

### **Vieta:** `docs/diagrams/use_case/`
- `crud_operations.puml` - CRUD operacijos

---

## 🔄 **4. ACTIVITY DIAGRAMOS**

### **Vieta:** `docs/diagrams/activity/`
- `manage_meal_plan.puml` - Valdyti mitybos planą
- `meal_planning_management.puml` - Mitybos planavimo valdymas
- `receipt_scanning.puml` - Čekio skanavimas
- `recognize_food_from_image.puml` - Atpažinti maistą iš nuotraukos
- `shopping_list_management.puml` - Pirkinių sąrašo valdymas
- `update_deals.puml` - Atnaujinti akcijas
- `view_meal_plan.puml` - Peržiūrėti mitybos planą

---

## 🏗️ **5. ROBUSTNESS DIAGRAMOS**

### **Vieta:** `docs/diagrams/robustness/`

#### **Products:**
- `manage_products.puml` - Valdyti produktus
- `manage_products_SCHEMA.puml` - Produktų schema
- `manage_products_SCHEMA_SIMPLE.puml` - Supaprastinta schema
- `manage_products_PILNA.puml` - Pilna schema
- `manage_products_simple.puml` - Paprasta versija
- `manage_products_simple_overview.puml` - Apžvalga
- `manage_products_aprasymas.md` - Aprašymas
- `manage_products_PILNA_aprasymas.md` - Pilnas aprašymas
- `manage_products_PILNA_LOGIKE_PATIKRA.md` - Loginė patikra
- `manage_products_PILNA_LOGIKOS_PATIKRA.md` - Logikos patikra
- `manage_products_PILNA_SUMMA.md` - Santrauka
- `manage_products_SCHEMA_AIŠKINIMAS.md` - Schema paaiškinimas

#### **Meal Planning:**
- `create_meal_plan.puml` - Sukurti mitybos planą
- `manage_meal_plan.puml` - Valdyti mitybos planą
- `meal_planning_robustness_analysis.md` - Analizė

#### **Overview:**
- `project_robustness_overview.puml` - Projekto apžvalga
- `controllers_entities_mapping.puml` - Controller'iai ir Entities

---

## 📦 **6. PACKAGE DIAGRAMOS**

### **Vieta:** `docs/diagrams/package/`

#### **Pagrindinės:**
- `complete_architecture_NO_ROOT.puml` - Pilna architektūra (be root)
- `complete_architecture.puml` - Pilna architektūra
- `logical_architecture.puml` - Loginė architektūra

#### **Dokumentacija:**
- `MAGICDRAW_STRUCTURE.md` - MagicDraw struktūra
- `MAGICDRAW_INSTRUCTIONS_NO_ROOT.md` - Instrukcijos (be root)
- `COMPLETE_ARCHITECTURE_OVERVIEW.md` - Apžvalga
- `ARCHITECTURE_EXPLANATION.md` - Paaiškinimas
- `COMPLETE_DEPENDENCIES_ANALYSIS.md` - Priklausomybių analizė

---

## 🎨 **7. COMPONENT DIAGRAMOS**

### **Vieta:** `docs/diagrams/component/`
- `component_diagram.puml` - Komponentų diagrama
- `component_diagram_final.puml` - Galutinė versija
- `component_diagram_simple.puml` - Supaprastinta
- `component_diagram_with_artifacts.puml` - Su artefaktais
- `component_diagram_with_operations.puml` - Su operacijomis

---

## 🚀 **8. DEPLOYMENT DIAGRAMOS**

### **Vieta:** `docs/diagrams/deployment/`
- `deployment_diagram.puml` - Deployment diagrama
- `deployment_diagram_development.puml` - Development
- `deployment_diagram_react.puml` - React Native
- `deployment_diagram_web.puml` - Web

---

## 📐 **9. CLASS DIAGRAMOS**

### **Vieta:** `docs/diagrams/class/`
- `entities_diagram.puml` - Entities diagrama

---

## 🎭 **10. VIEWS DIAGRAMOS**

### **Vieta:** `docs/diagrams/views/`
- `views_diagram.puml` - Views diagrama

---

## 🏛️ **11. ARCHITEKTŪROS DOKUMENTAI**

### **Pagrindiniai:**
- **`docs/architecture/COMPLETE_ARCHITECTURE_OVERVIEW.md`** - Pilna architektūros apžvalga (8 paketai, 15 langų, 14 Controller'ių)
- **`docs/architecture/HOW_ARCHITECTURE_WORKS_IN_CODE.md`** - Kaip architektūra veikia kode
- **`docs/architecture/MEALPLAN_NO_DUPLICATION.md`** - Meal Plan be dubliavimo
- **`docs/architecture/mvc_robustness_structure.md`** - MVC/Robustness struktūra

### **Statusas ir Planai:**
- **`docs/architecture/REALITY_CHECK.md`** - Kas yra, kas trūksta
- **`docs/architecture/REALISTIC_PLAN.md`** - Realistiškas planas (MVP fazės)
- **`docs/architecture/REALISTIC_BOUNDARIES.md`** - Realistiškos ribos

### **Controllers:**
- **`docs/architecture/FLUTTER_BLOC_CONTROLLERS.md`** - Flutter BLoC Controller'iai
- **`docs/architecture/CONSOLIDATED_CONTROLLERS.md`** - Sujungti Controller'iai
- **`docs/architecture/CONTROLLERS_AND_ENTITIES.md`** - Controller'iai ir Entities

### **Services:**
- **`docs/architecture/SERVICES_ANALYSIS.md`** - Services analizė
- **`docs/architecture/SERVICES_SIMPLIFIED.md`** - Supaprastinti Services

### **Data Access:**
- **`docs/architecture/DO_I_NEED_REPOSITORIES.md`** - Ar reikia Repository?
- **`docs/architecture/WITHOUT_REPOSITORIES_HOW_IT_WORKS.md`** - Kaip be Repository

### **External Services:**
- **`docs/architecture/EXTERNAL_SERVICES_CHECK.md`** - External Services patikra
- **`docs/architecture/MVP_EXTERNAL_SERVICES.md`** - MVP External Services

### **Admin:**
- **`docs/architecture/ADMIN_SUBSYSTEM_CONTROLLERS.md`** - Admin Controller'iai
- **`docs/architecture/ADMIN_HOW_IT_WORKS.md`** - Kaip veikia Admin

### **Deals:**
- **`docs/architecture/DEALS_COMPLETE_LOGIC.md`** - Deals logika
- **`docs/architecture/WHY_DEALS_CONTROLLER_NEEDED.md`** - Kodėl reikia Deals Controller

### **Shopping List:**
- **`docs/architecture/SHOPPING_LIST_CONTROLLER_EXPLANATION.md`** - Shopping List paaiškinimas
- **`docs/architecture/SHOPPING_LIST_ADMIN_ONLY.md`** - Shopping List tik Admin

### **Budget:**
- **`docs/architecture/BUDGET_CONTROLLERS_EXPLANATION.md`** - Budget Controller'iai
- **`docs/architecture/AUTOMATIC_ALERTS_FINAL.md`** - Automatiniai perspėjimai

---

## 🔧 **12. MIGRATION & SETUP**

### **React Native:**
- **`docs/setup/REACT_NATIVE_MIGRATION.md`** - React Native migracija
- **`docs/setup/PWA_SETUP.md`** - PWA setup

---

## 📝 **13. FEATURES**

### **Feature-Specific:**
- **`docs/features/NUTRITION_SCREEN.md`** - Nutrition Screen aprašymas
- **`docs/features/receipt_scanning_flow.md`** - Čekio skanavimo srautas

---

## 🎯 **Greitas Paieškos Gidas**

### **Norite rasti:**
- **Visus pages?** → `docs/architecture/LANGAI_SARASAS.md`
- **Sequence diagramas?** → `docs/diagrams/sequence/`
- **Use case diagramas?** → `docs/diagrams/use_case/`
- **Activity diagramas?** → `docs/diagrams/activity/`
- **Robustness diagramas?** → `docs/diagrams/robustness/`
- **Package diagramas?** → `docs/diagrams/package/`
- **Architektūros apžvalgą?** → `docs/architecture/COMPLETE_ARCHITECTURE_OVERVIEW.md`
- **Kaip veikia kode?** → `docs/architecture/HOW_ARCHITECTURE_WORKS_IN_CODE.md`

---

## 📊 **Statistika**

| Kategorija | Kiekis |
|-----------|--------|
| **Pages (Langai)** | 15 |
| **Controllers** | 14 (Member) + 8 (Admin) = 22 |
| **Sequence Diagramos** | 9+ |
| **Activity Diagramos** | 7 |
| **Robustness Diagramos** | 10+ |
| **Package Diagramos** | 3+ |
| **Component Diagramos** | 5+ |
| **Architektūros Dokumentai** | 50+ |

---

**Versija:** 1.0.0  
**Atnaujinta:** 2025-01-06  
**Status:** ✅ Aktualus




