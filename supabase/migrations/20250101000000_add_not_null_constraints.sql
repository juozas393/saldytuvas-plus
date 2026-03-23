-- Migration: Add NOT NULL constraints to critical fields
-- Created: 2025-01-01
-- Description: Ensures data integrity by making critical fields NOT NULL

-- ============================================
-- 1. PromoFlyer Table
-- ============================================
ALTER TABLE PromoFlyer
  ALTER COLUMN Title SET NOT NULL,
  ALTER COLUMN ValidFrom SET NOT NULL,
  ALTER COLUMN ValidTo SET NOT NULL;

-- ============================================
-- 2. Store Table
-- ============================================
ALTER TABLE Store
  ALTER COLUMN Chain SET NOT NULL;

-- ============================================
-- 3. Deal Table
-- ============================================
ALTER TABLE Deal
  ALTER COLUMN Title SET NOT NULL;

-- ============================================
-- 4. Receipt Table
-- ============================================
ALTER TABLE Receipt
  ALTER COLUMN PurchaseDateTime SET NOT NULL,
  ALTER COLUMN CreatedByUser SET NOT NULL;

-- ============================================
-- 5. ReceiptLine Table
-- ============================================
ALTER TABLE ReceiptLine
  ALTER COLUMN Kaina SET NOT NULL,
  ALTER COLUMN Kiekis SET NOT NULL,
  ALTER COLUMN Suma SET NOT NULL;

-- ============================================
-- 6. Product Table
-- ============================================
ALTER TABLE Product
  ALTER COLUMN Name SET NOT NULL,
  ALTER COLUMN HasBarcode SET NOT NULL,
  ALTER COLUMN fk_Dealid_Deal SET NOT NULL;

-- ============================================
-- 7. Category Table
-- ============================================
ALTER TABLE Category
  ALTER COLUMN Name SET NOT NULL,
  ALTER COLUMN fk_Productid_Product SET NOT NULL;

-- ============================================
-- 8. Notification Table
-- ============================================
ALTER TABLE Notification
  ALTER COLUMN Title SET NOT NULL,
  ALTER COLUMN Content SET NOT NULL,
  ALTER COLUMN Level SET NOT NULL;

-- ============================================
-- 9. ShoppingList Table
-- ============================================
ALTER TABLE ShoppingList
  ALTER COLUMN Name SET NOT NULL,
  ALTER COLUMN LastUpdateAt SET NOT NULL;

-- ============================================
-- 10. Inventory Table
-- ============================================
ALTER TABLE Inventory
  ALTER COLUMN StorageLocation SET NOT NULL;

-- ============================================
-- 11. User Table
-- ============================================
ALTER TABLE "User"
  ALTER COLUMN Email SET NOT NULL,
  ALTER COLUMN Username SET NOT NULL,
  ALTER COLUMN Password SET NOT NULL,
  ALTER COLUMN CreatedAt SET NOT NULL,
  ALTER COLUMN Role SET NOT NULL;

-- ============================================
-- 12. Budget Table
-- ============================================
ALTER TABLE Budget
  ALTER COLUMN PeriodStartDate SET NOT NULL,
  ALTER COLUMN PeriodEndDate SET NOT NULL,
  ALTER COLUMN Amount SET NOT NULL,
  ALTER COLUMN SpentAmount SET NOT NULL,
  ALTER COLUMN WarningThreshold SET NOT NULL;

-- ============================================
-- 13. FoodRule Table
-- ============================================
ALTER TABLE FoodRule
  ALTER COLUMN Name SET NOT NULL,
  ALTER COLUMN Type SET NOT NULL,
  ALTER COLUMN RuleText SET NOT NULL,
  ALTER COLUMN ValidFrom SET NOT NULL,
  ALTER COLUMN ValidTo SET NOT NULL,
  ALTER COLUMN CreatedAt SET NOT NULL,
  ALTER COLUMN FoodRuleStatus SET NOT NULL;

-- ============================================
-- 14. Environment Table
-- ============================================
ALTER TABLE Environment
  ALTER COLUMN Name SET NOT NULL,
  ALTER COLUMN CreatedAt SET NOT NULL;

-- ============================================
-- 15. NutritionPlan Table
-- ============================================
ALTER TABLE NutritionPlan
  ALTER COLUMN Name SET NOT NULL,
  ALTER COLUMN StartDate SET NOT NULL,
  ALTER COLUMN EndDate SET NOT NULL,
  ALTER COLUMN DailyCalorieGoal SET NOT NULL,
  ALTER COLUMN Status SET NOT NULL;

-- ============================================
-- 16. Recipe Table
-- ============================================
ALTER TABLE Recipe
  ALTER COLUMN Name SET NOT NULL,
  ALTER COLUMN Description SET NOT NULL,
  ALTER COLUMN PreparationTime SET NOT NULL;

-- ============================================
-- 17. Dish Table
-- ============================================
ALTER TABLE Dish
  ALTER COLUMN Name SET NOT NULL,
  ALTER COLUMN Description SET NOT NULL,
  ALTER COLUMN Type SET NOT NULL;

-- ============================================
-- Add default values where needed
-- ============================================
-- Set default for HasBarcode if not already set
ALTER TABLE Product
  ALTER COLUMN HasBarcode SET DEFAULT false;

-- Set default for LastUpdateAt if not already set
ALTER TABLE ShoppingList
  ALTER COLUMN LastUpdateAt SET DEFAULT CURRENT_DATE;

-- Set default for CreatedAt if not already set
ALTER TABLE "User"
  ALTER COLUMN CreatedAt SET DEFAULT CURRENT_DATE;

-- Set default for CreatedAt in FoodRule
ALTER TABLE FoodRule
  ALTER COLUMN CreatedAt SET DEFAULT CURRENT_DATE;

-- Set default for CreatedAt in Environment
ALTER TABLE Environment
  ALTER COLUMN CreatedAt SET DEFAULT CURRENT_DATE;

-- Set default for SpentAmount in Budget (if not already set)
ALTER TABLE Budget
  ALTER COLUMN SpentAmount SET DEFAULT 0.0;

