#@(#) script.ddl

DROP TABLE IF EXISTS ReceiptLine;
DROP TABLE IF EXISTS Category;
DROP TABLE IF EXISTS Product;
DROP TABLE IF EXISTS FoodRule;
DROP TABLE IF EXISTS ShoppingList;
DROP TABLE IF EXISTS NutritionPlan;
DROP TABLE IF EXISTS Notification;
DROP TABLE IF EXISTS Environment;
DROP TABLE IF EXISTS User;
DROP TABLE IF EXISTS Recipe;
DROP TABLE IF EXISTS Dish;
DROP TABLE IF EXISTS Budget;
DROP TABLE IF EXISTS Inventory;
DROP TABLE IF EXISTS Deal;
DROP TABLE IF EXISTS Receipt;
DROP TABLE IF EXISTS PromoFlyer;
DROP TABLE IF EXISTS Store;
CREATE TABLE Store
(
	id_Store integer,
	Chain varchar (255) NOT NULL,
	Address varchar (255),
	WebsiteURL varchar (255),
	WorkingHours date,
	hasLoyaltyCard boolean,
	Priority varchar (255),
	PRIMARY KEY(id_Store)
);

CREATE TABLE PromoFlyer
(
	id_PromoFlyer integer,
	Title varchar (255) NOT NULL,
	ValidFrom date NOT NULL,
	ValidTo date NOT NULL,
	SourceURL varchar (255),
	FetchedAt date,
	fk_Storeid_Store integer NOT NULL,
	PRIMARY KEY(id_PromoFlyer),
	CONSTRAINT kuria FOREIGN KEY(fk_Storeid_Store) REFERENCES Store (id_Store)
);

CREATE TABLE Receipt
(
	id_Receipt integer,
	TextLine varchar (255),
	PurchaseDateTime date,
	OCRConfidence integer,
	CreatedByUser varchar (255),
	fk_Storeid_Store integer NOT NULL,
	PRIMARY KEY(id_Receipt, fk_Storeid_Store),
	FOREIGN KEY(fk_Storeid_Store) REFERENCES Store (id_Store)
);

CREATE TABLE Deal
(
	id_Deal integer,
	Title varchar (255) NOT NULL,
	Description varchar (255),
	Price double precision NOT NULL,
	DiscountPercent integer,
	ImageURL varchar (255) NOT NULL,
	fk_PromoFlyerid_PromoFlyer integer NOT NULL,
	PRIMARY KEY(id_Deal),
	CONSTRAINT yra FOREIGN KEY(fk_PromoFlyerid_PromoFlyer) REFERENCES PromoFlyer (id_PromoFlyer)
);

CREATE TABLE Inventory
(
	id_Inventory integer,
	StorageLocation varchar (255) NOT NULL,
	fk_Environmentid_Environment integer NOT NULL,
	PRIMARY KEY(id_Inventory),
	CONSTRAINT turi FOREIGN KEY(fk_Environmentid_Environment) REFERENCES Environment (id_Environment)
);

CREATE TABLE Budget
(
	id_Budget integer,
	PeriodStartDate date NOT NULL,
	PeriodEndDate date NOT NULL,
	Amount double precision NOT NULL,
	SpentAmount double precision NOT NULL,
	WarningThreshold double precision NOT NULL,
	fk_Administratorid_User integer NOT NULL,
	PRIMARY KEY(id_Budget),
	CONSTRAINT nustato FOREIGN KEY(fk_Administratorid_User) REFERENCES User (id_User)
);

CREATE TABLE Dish
(
	id_Dish integer,
	Name varchar (255) NOT NULL,
	Description varchar (255) NOT NULL,
	Type varchar (255) NOT NULL,
	fk_NutritionPlanid_NutritionPlan integer NOT NULL,
	PRIMARY KEY(id_Dish, fk_NutritionPlanid_NutritionPlan),
	FOREIGN KEY(fk_NutritionPlanid_NutritionPlan) REFERENCES NutritionPlan (id_NutritionPlan)
);

CREATE TABLE Recipe
(
	id_Recipe integer,
	Name varchar (255) NOT NULL,
	Description varchar (255) NOT NULL,
	Paruošimo laikas double precision,
	PreparationTime integer NOT NULL,
	fk_Dishid_Dish integer,
	fk_Dishfk_NutritionPlanid_NutritionPlan integer,
	PRIMARY KEY(id_Recipe),
	CONSTRAINT priklauso FOREIGN KEY(fk_Dishid_Dish, fk_Dishfk_NutritionPlanid_NutritionPlan) REFERENCES Dish (id_Dish, fk_NutritionPlanid_NutritionPlan)
);

CREATE TABLE User
(
	id_User integer,
	Email varchar (255) NOT NULL,
	Username varchar (255) NOT NULL,
	Password varchar (255) NOT NULL,
	CreatedAt date NOT NULL,
	Height int,
	Weight double precision,
	Age int,
	Gender,
	Role char (16) NOT NULL,
	fk_Environmentid_Environment integer,
	fk_Inventoryid_Inventory integer,
	typeSelector char (255),
	CHECK(Role in ('Administratorius', 'Member')),
	PRIMARY KEY(id_User),
	CONSTRAINT priklauso FOREIGN KEY(fk_Environmentid_Environment) REFERENCES Environment (id_Environment),
	CONSTRAINT pildo FOREIGN KEY(fk_Inventoryid_Inventory) REFERENCES Inventory (id_Inventory)
);

CREATE TABLE Environment
(
	id_Environment integer,
	Name varchar (255) NOT NULL,
	UpdatedAt date,
	CreatedAt date NOT NULL,
	fk_Administratorid_User integer NOT NULL,
	PRIMARY KEY(id_Environment),
	CONSTRAINT sukuria FOREIGN KEY(fk_Administratorid_User) REFERENCES User (id_User)
);

CREATE TABLE Notification
(
	id_Notification integer,
	Title varchar (255) NOT NULL,
	Content varchar (255) NOT NULL,
	Level char (8),
	fk_Budgetid_Budget integer,
	CHECK(Level in ('Critical', 'Reminder', 'Warning')),
	PRIMARY KEY(id_Notification),
	CONSTRAINT praneša apie FOREIGN KEY(fk_Budgetid_Budget) REFERENCES Budget (id_Budget)
);

CREATE TABLE NutritionPlan
(
	id_NutritionPlan integer,
	Name varchar (255) NOT NULL,
	StartDate date NOT NULL,
	EndDate date NOT NULL,
	DailyCalorieGoal integer NOT NULL,
	Date varchar (255),
	Status char (8) NOT NULL,
	fk_Environmentid_Environment integer NOT NULL,
	CHECK(Status in ('Active', 'Inactive')),
	PRIMARY KEY(id_NutritionPlan),
	CONSTRAINT turi FOREIGN KEY(fk_Environmentid_Environment) REFERENCES Environment (id_Environment)
);

CREATE TABLE ShoppingList
(
	id_ShoppingList integer,
	Name varchar (255) NOT NULL,
	Description varchar (255),
	LastUpdateAt date NOT NULL,
	fk_Memberid_User integer NOT NULL,
	fk_Budgetid_Budget integer NOT NULL,
	PRIMARY KEY(id_ShoppingList),
	CONSTRAINT Pildo FOREIGN KEY(fk_Memberid_User) REFERENCES User (id_User),
	CONSTRAINT priklauso FOREIGN KEY(fk_Budgetid_Budget) REFERENCES Budget (id_Budget)
);

CREATE TABLE FoodRule
(
	id_FoodRule integer,
	Name varchar (255) NOT NULL,
	Type varchar (255) NOT NULL,
	RuleText varchar (255) NOT NULL,
	ValidFrom date NOT NULL,
	ValidTo date NOT NULL,
	CreatedAt date NOT NULL,
	FoodRuleStatus char (8) NOT NULL,
	fk_NutritionPlanid_NutritionPlan integer NOT NULL,
	fk_Administratorid_User integer NOT NULL,
	CHECK(FoodRuleStatus in ('Active', 'Inactive')),
	PRIMARY KEY(id_FoodRule),
	CONSTRAINT turi FOREIGN KEY(fk_NutritionPlanid_NutritionPlan) REFERENCES NutritionPlan (id_NutritionPlan),
	CONSTRAINT nustato FOREIGN KEY(fk_Administratorid_User) REFERENCES User (id_User)
);

CREATE TABLE Product
(
	id_Product integer,
	Name varchar (255) NOT NULL,
	HasBarcode boolean NOT NULL,
	Brand varchar (255),
	BestBeforeDate date,
	Weight double precision,
	EnergyKcal integer,
	CarbohydratesGrams integer,
	ProteinGrams integer,
	FatGrams integer,
	fk_Notificationid_Notification integer NOT NULL,
	fk_Inventoryid_Inventory integer NOT NULL,
	fk_ShoppingListid_ShoppingList integer NOT NULL,
	fk_Recipeid_Recipe integer,
	fk_Dealid_Deal integer NOT NULL,
	PRIMARY KEY(id_Product),
	UNIQUE(fk_Dealid_Deal),
	CONSTRAINT praneša apie FOREIGN KEY(fk_Notificationid_Notification) REFERENCES Notification (id_Notification),
	CONSTRAINT turi FOREIGN KEY(fk_Inventoryid_Inventory) REFERENCES Inventory (id_Inventory),
	CONSTRAINT priklauso FOREIGN KEY(fk_ShoppingListid_ShoppingList) REFERENCES ShoppingList (id_ShoppingList),
	CONSTRAINT sudaro FOREIGN KEY(fk_Recipeid_Recipe) REFERENCES Recipe (id_Recipe),
	CONSTRAINT atitinka FOREIGN KEY(fk_Dealid_Deal) REFERENCES Deal (id_Deal)
);

CREATE TABLE Category
(
	id_Category integer,
	Name varchar (255) NOT NULL,
	fk_Productid_Product integer NOT NULL,
	PRIMARY KEY(id_Category),
	CONSTRAINT turi FOREIGN KEY(fk_Productid_Product) REFERENCES Product (id_Product)
);

CREATE TABLE ReceiptLine
(
	id_ReceiptLine integer,
	Prekės kodas varchar (255),
	Kaina double precision NOT NULL,
	Kiekis integer NOT NULL,
	Suma double precision NOT NULL,
	fk_Receiptid_Receipt integer NOT NULL,
	fk_Receiptfk_Storeid_Store integer NOT NULL,
	fk_Productid_Product integer NOT NULL,
	PRIMARY KEY(id_ReceiptLine),
	FOREIGN KEY(fk_Receiptid_Receipt, fk_Receiptfk_Storeid_Store) REFERENCES Receipt (id_Receipt, fk_Storeid_Store),
	CONSTRAINT turi FOREIGN KEY(fk_Productid_Product) REFERENCES Product (id_Product)
);
