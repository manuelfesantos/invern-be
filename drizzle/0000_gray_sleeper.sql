DROP TABLE IF EXISTS `addresses`;
CREATE TABLE `addresses` (
	`addressId` text PRIMARY KEY NOT NULL,
	`line1` text NOT NULL,
	`line2` text NOT NULL,
	`postalCode` text NOT NULL,
	`city` text NOT NULL,
	`countryId` text NOT NULL,
	FOREIGN KEY (`countryId`) REFERENCES `countries`(`code`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
DROP TABLE IF EXISTS `carts`;
CREATE TABLE `carts` (
	`cartId` text PRIMARY KEY NOT NULL
);
--> statement-breakpoint
DROP TABLE IF EXISTS `collections`;
CREATE TABLE `collections` (
	`collectionId` text PRIMARY KEY NOT NULL,
	`collectionName` text NOT NULL,
	`description` text NOT NULL
);
--> statement-breakpoint
DROP TABLE IF EXISTS `countries`;
CREATE TABLE `countries` (
	`name` text NOT NULL,
	`code` text PRIMARY KEY NOT NULL
);
--> statement-breakpoint
DROP TABLE IF EXISTS `countriesToCurrencies`;
CREATE TABLE `countriesToCurrencies` (
	`countryId` text NOT NULL,
	`currencyId` text NOT NULL,
	PRIMARY KEY(`countryId`, `currencyId`),
	FOREIGN KEY (`countryId`) REFERENCES `countries`(`code`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`currencyId`) REFERENCES `currencies`(`currencyId`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
DROP TABLE IF EXISTS `currencies`;
CREATE TABLE `currencies` (
	`currencyId` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`symbol` text NOT NULL,
	`rateToEuro` real NOT NULL
);
--> statement-breakpoint
DROP TABLE IF EXISTS `images`;
CREATE TABLE `images` (
	`url` text PRIMARY KEY NOT NULL,
	`alt` text NOT NULL,
	`productId` text NOT NULL,
	`collectionId` text,
	FOREIGN KEY (`productId`) REFERENCES `products`(`productId`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`collectionId`) REFERENCES `collections`(`collectionId`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
DROP TABLE IF EXISTS `orders`;
CREATE TABLE `orders` (
	`orderId` text PRIMARY KEY NOT NULL,
	`createdAt` text NOT NULL,
	`userId` text,
	`addressId` text,
	`paymentId` text,
	`clientOrderId` text NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `users`(`userId`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`addressId`) REFERENCES `addresses`(`addressId`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`paymentId`) REFERENCES `payments`(`paymentId`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
DROP TABLE IF EXISTS `payments`;
CREATE TABLE `payments` (
	`paymentId` text PRIMARY KEY NOT NULL,
	`createdAt` text NOT NULL,
	`type` text NOT NULL,
	`state` text NOT NULL,
	`amount` integer NOT NULL
);
--> statement-breakpoint
DROP TABLE IF EXISTS `products`;
CREATE TABLE `products` (
	`productId` text PRIMARY KEY NOT NULL,
	`productName` text NOT NULL,
	`description` text NOT NULL,
	`stock` integer NOT NULL,
	`collectionId` text NOT NULL,
	`priceInCents` integer NOT NULL,
	FOREIGN KEY (`collectionId`) REFERENCES `collections`(`collectionId`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
DROP TABLE IF EXISTS `productsOnCarts`;
CREATE TABLE `productsOnCarts` (
	`cartId` text NOT NULL,
	`productId` text NOT NULL,
	`quantity` integer NOT NULL,
	PRIMARY KEY(`cartId`, `productId`),
	FOREIGN KEY (`cartId`) REFERENCES `carts`(`cartId`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`productId`) REFERENCES `products`(`productId`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
DROP TABLE IF EXISTS `productsToOrders`;
CREATE TABLE `productsToOrders` (
	`orderId` text NOT NULL,
	`productId` text NOT NULL,
	`quantity` integer NOT NULL,
	PRIMARY KEY(`orderId`, `productId`),
	FOREIGN KEY (`orderId`) REFERENCES `orders`(`orderId`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`productId`) REFERENCES `products`(`productId`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
DROP TABLE IF EXISTS `taxes`;
CREATE TABLE `taxes` (
	`taxId` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`amount` integer,
	`countryId` text NOT NULL,
	FOREIGN KEY (`countryId`) REFERENCES `countries`(`code`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
	`userId` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`firstName` text NOT NULL,
	`lastName` text NOT NULL,
	`password` text NOT NULL,
	`version` integer DEFAULT 1 NOT NULL,
	`role` text DEFAULT 'USER' NOT NULL,
	`cartId` text NOT NULL UNIQUE,
	FOREIGN KEY (`cartId`) REFERENCES `carts`(`cartId`)
);
--> statement-breakpoint
DROP INDEX IF EXISTS `images_collectionId_unique`;
CREATE UNIQUE INDEX `images_collectionId_unique` ON `images` (`collectionId`);