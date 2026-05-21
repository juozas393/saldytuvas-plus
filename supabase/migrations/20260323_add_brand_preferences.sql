-- Add brand preferences and substitute rules to app_user
-- brand_preferences: JSON array of { category, preferredBrand, avoidBrands }
-- e.g. [{ "category": "varškė", "preferredBrand": "Vilkyškių", "avoidBrands": ["Dvaro"] }]
ALTER TABLE app_user ADD COLUMN IF NOT EXISTS brand_preferences JSONB DEFAULT '[]'::jsonb;

-- Add substitute_rules: JSON array of { product, substituteWith, reason }
-- e.g. [{ "product": "sviestas", "substituteWith": "kokosų aliejus", "reason": "laktozės netoleravimas" }]
ALTER TABLE app_user ADD COLUMN IF NOT EXISTS substitute_rules JSONB DEFAULT '[]'::jsonb;
