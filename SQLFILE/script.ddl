#@(#) script.ddl

DROP TABLE IF EXISTS Dish;
DROP TABLE IF EXISTS ReceiptLine;
DROP TABLE IF EXISTS Inventory;
DROP TABLE IF EXISTS Category;
DROP TABLE IF EXISTS Recipe;
DROP TABLE IF EXISTS Product;
DROP TABLE IF EXISTS FoodRule;
DROP TABLE IF EXISTS Environment;
DROP TABLE IF EXISTS Budget;
DROP TABLE IF EXISTS "User";
DROP TABLE IF EXISTS ShoppingList;
DROP TABLE IF EXISTS NutritionPlan;
DROP TABLE IF EXISTS Notification;
DROP TABLE IF EXISTS Deal;
DROP TABLE IF EXISTS Receipt;
DROP TABLE IF EXISTS PromoFlyer;
DROP TABLE IF EXISTS Store;

CREATE TABLE Store
(
	id_Store SERIAL PRIMARY KEY,
	Chain varchar (255) NOT NULL,
	Address varchar (255),
	WebsiteURL varchar (255),
	WorkingHours varchar (255),
	hasLoyaltyCard boolean,
	Priority varchar (255),
	created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	deleted_at timestamp with time zone
);

CREATE TABLE PromoFlyer
(
	id_PromoFlyer SERIAL PRIMARY KEY,
	Title varchar (255) NOT NULL,
	ValidFrom date NOT NULL,
	ValidTo date NOT NULL,
	SourceURL varchar (255),
	FetchedAt timestamp with time zone,
	fk_Storeid_Store integer NOT NULL,
	created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	deleted_at timestamp with time zone,
	FOREIGN KEY(fk_Storeid_Store) REFERENCES Store (id_Store)
);

CREATE TABLE Receipt
(
	id_Receipt SERIAL PRIMARY KEY,
	TextLine varchar (255),
	PurchaseDateTime timestamp with time zone NOT NULL,
	OCRConfidence integer,
	CreatedByUser varchar (255) NOT NULL,
	fk_Storeid_Store integer NOT NULL,
	created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	deleted_at timestamp with time zone,
	FOREIGN KEY(fk_Storeid_Store) REFERENCES Store (id_Store)
);

CREATE TABLE Deal
(
	id_Deal SERIAL PRIMARY KEY,
	Title varchar (255) NOT NULL,
	Description varchar (255),
	Price double precision NOT NULL,
	DiscountPercent integer,
	ImageURL varchar (255) NOT NULL,
	fk_PromoFlyerid_PromoFlyer integer NOT NULL,
	created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	deleted_at timestamp with time zone,
	FOREIGN KEY(fk_PromoFlyerid_PromoFlyer) REFERENCES PromoFlyer (id_PromoFlyer)
);

CREATE TABLE Environment
(
	id_Environment SERIAL PRIMARY KEY,
	Name varchar (255) NOT NULL,
	UpdatedAt timestamp with time zone,
	CreatedAt timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
	fk_Administratorid_User integer NOT NULL,
	created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	deleted_at timestamp with time zone
);

CREATE TABLE Budget
(
	id_Budget SERIAL PRIMARY KEY,
	PeriodStartDate date NOT NULL,
	PeriodEndDate date NOT NULL,
	Amount double precision NOT NULL,
	SpentAmount double precision NOT NULL DEFAULT 0.0,
	WarningThreshold double precision NOT NULL,
	fk_Administratorid_User integer NOT NULL,
	created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	deleted_at timestamp with time zone
);

CREATE TABLE Inventory
(
	id_Inventory SERIAL PRIMARY KEY,
	StorageLocation varchar (255) NOT NULL,
	fk_Environmentid_Environment integer NOT NULL,
	created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	deleted_at timestamp with time zone,
	FOREIGN KEY(fk_Environmentid_Environment) REFERENCES Environment (id_Environment)
);

CREATE TABLE "User"
(
	id_User SERIAL PRIMARY KEY,
	Email varchar (255) NOT NULL,
	Username varchar (255) NOT NULL,
	Password varchar (255) NOT NULL,
	CreatedAt timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
	Height integer,
	Weight double precision,
	Age integer,
	Gender varchar (50),
	Role char (16) NOT NULL,
	fk_Environmentid_Environment integer,
	fk_Inventoryid_Inventory integer,
	typeSelector char (255),
	created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	deleted_at timestamp with time zone,
	FOREIGN KEY(fk_Environmentid_Environment) REFERENCES Environment (id_Environment),
	FOREIGN KEY(fk_Inventoryid_Inventory) REFERENCES Inventory (id_Inventory)
);

ALTER TABLE Environment
	ADD CONSTRAINT fk_Environment_Administrator
	FOREIGN KEY(fk_Administratorid_User) REFERENCES "User" (id_User);

ALTER TABLE Budget
	ADD CONSTRAINT fk_Budget_Administrator
	FOREIGN KEY(fk_Administratorid_User) REFERENCES "User" (id_User);

CREATE TABLE NutritionPlan
(
	id_NutritionPlan SERIAL PRIMARY KEY,
	Name varchar (255) NOT NULL,
	StartDate date NOT NULL,
	EndDate date NOT NULL,
	DailyCalorieGoal integer NOT NULL,
	Date varchar (255),
	Status char (8) NOT NULL,
	fk_Environmentid_Environment integer NOT NULL,
	created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	deleted_at timestamp with time zone,
	FOREIGN KEY(fk_Environmentid_Environment) REFERENCES Environment (id_Environment)
);

CREATE TABLE Notification
(
	id_Notification SERIAL PRIMARY KEY,
	Title varchar (255) NOT NULL,
	Content varchar (255) NOT NULL,
	Level char (8),
	fk_Budgetid_Budget integer,
	created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	deleted_at timestamp with time zone,
	FOREIGN KEY(fk_Budgetid_Budget) REFERENCES Budget (id_Budget)
);

CREATE TABLE ShoppingList
(
	id_ShoppingList SERIAL PRIMARY KEY,
	Name varchar (255) NOT NULL,
	Description varchar (255),
	LastUpdateAt timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
	fk_Memberid_User integer NOT NULL,
	fk_Budgetid_Budget integer NOT NULL,
	created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	deleted_at timestamp with time zone,
	FOREIGN KEY(fk_Memberid_User) REFERENCES "User" (id_User),
	FOREIGN KEY(fk_Budgetid_Budget) REFERENCES Budget (id_Budget)
);

CREATE TABLE Dish
(
	id_Dish SERIAL PRIMARY KEY,
	Name varchar (255) NOT NULL,
	Description varchar (255) NOT NULL,
	Type varchar (255) NOT NULL,
	fk_NutritionPlanid_NutritionPlan integer NOT NULL,
	created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	deleted_at timestamp with time zone,
	FOREIGN KEY(fk_NutritionPlanid_NutritionPlan) REFERENCES NutritionPlan (id_NutritionPlan)
);

CREATE TABLE Recipe
(
	id_Recipe SERIAL PRIMARY KEY,
	Name varchar (255) NOT NULL,
	Description varchar (255) NOT NULL,
	"Paruošimo laikas" double precision,
	PreparationTime integer NOT NULL,
	fk_Dishid_Dish integer,
	fk_Dishfk_NutritionPlanid_NutritionPlan integer,
	created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	deleted_at timestamp with time zone,
	FOREIGN KEY(fk_Dishid_Dish) REFERENCES Dish (id_Dish),
	FOREIGN KEY(fk_Dishfk_NutritionPlanid_NutritionPlan) REFERENCES NutritionPlan (id_NutritionPlan)
);

CREATE TABLE Product
(
	id_Product SERIAL PRIMARY KEY,
	Name varchar (255) NOT NULL,
	HasBarcode boolean NOT NULL DEFAULT false,
	Brand varchar (255),
	BestBeforeDate date,
	Weight double precision,
	EnergyKcal integer,
	CarbohydratesGrams integer,
	ProteinGrams integer,
	FatGrams integer,
	fk_Notificationid_Notification integer,
	fk_Inventoryid_Inventory integer,
	fk_ShoppingListid_ShoppingList integer,
	fk_Recipeid_Recipe integer,
	fk_Dealid_Deal integer,
	created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	deleted_at timestamp with time zone,
	FOREIGN KEY(fk_Notificationid_Notification) REFERENCES Notification (id_Notification),
	FOREIGN KEY(fk_Inventoryid_Inventory) REFERENCES Inventory (id_Inventory),
	FOREIGN KEY(fk_ShoppingListid_ShoppingList) REFERENCES ShoppingList (id_ShoppingList),
	FOREIGN KEY(fk_Recipeid_Recipe) REFERENCES Recipe (id_Recipe),
	FOREIGN KEY(fk_Dealid_Deal) REFERENCES Deal (id_Deal)
);

CREATE TABLE Category
(
	id_Category SERIAL PRIMARY KEY,
	Name varchar (255) NOT NULL,
	fk_Productid_Product integer NOT NULL,
	created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	deleted_at timestamp with time zone,
	FOREIGN KEY(fk_Productid_Product) REFERENCES Product (id_Product)
);

CREATE TABLE ReceiptLine
(
	id_ReceiptLine SERIAL PRIMARY KEY,
	"Prekės kodas" varchar (255),
	Kaina double precision NOT NULL,
	Kiekis integer NOT NULL,
	Suma double precision NOT NULL,
	fk_Receiptid_Receipt integer NOT NULL,
	fk_Receiptfk_Storeid_Store integer NOT NULL,
	fk_Productid_Product integer NOT NULL,
	created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	deleted_at timestamp with time zone,
	FOREIGN KEY(fk_Receiptid_Receipt) REFERENCES Receipt (id_Receipt),
	FOREIGN KEY(fk_Receiptfk_Storeid_Store) REFERENCES Store (id_Store),
	FOREIGN KEY(fk_Productid_Product) REFERENCES Product (id_Product)
);

CREATE TABLE FoodRule
(
	id_FoodRule SERIAL PRIMARY KEY,
	Name varchar (255) NOT NULL,
	Type varchar (255) NOT NULL,
	RuleText varchar (255) NOT NULL,
	ValidFrom date NOT NULL,
	ValidTo date NOT NULL,
	CreatedAt timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
	FoodRuleStatus char (8) NOT NULL,
	fk_NutritionPlanid_NutritionPlan integer NOT NULL,
	fk_Administratorid_User integer NOT NULL,
	created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	deleted_at timestamp with time zone,
	FOREIGN KEY(fk_NutritionPlanid_NutritionPlan) REFERENCES NutritionPlan (id_NutritionPlan),
	FOREIGN KEY(fk_Administratorid_User) REFERENCES "User" (id_User)
);
