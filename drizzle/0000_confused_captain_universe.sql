DROP TABLE IF EXISTS `countries`;
CREATE TABLE `countries` (
     `name` text NOT NULL,
     `code` text PRIMARY KEY NOT NULL
);
--> statement-breakpoint
DROP TABLE IF EXISTS `addresses`;
CREATE TABLE `addresses` (
	`id` text PRIMARY KEY NOT NULL,
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
	`id` text PRIMARY KEY NOT NULL
);
--> statement-breakpoint
DROP TABLE IF EXISTS `collections`;
CREATE TABLE `collections` (
   `id` text PRIMARY KEY NOT NULL,
   `name` text NOT NULL,
   `description` text NOT NULL
);
--> statement-breakpoint
DROP TABLE IF EXISTS `products`;
CREATE TABLE `products` (
    `id` text PRIMARY KEY NOT NULL,
    `name` text NOT NULL,
    `description` text NOT NULL,
    `stock` integer NOT NULL,
    `collectionId` text NOT NULL,
    `priceInCents` integer NOT NULL,
    FOREIGN KEY (`collectionId`) REFERENCES `collections`(`id`) ON UPDATE no action ON DELETE cascade
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
DROP TABLE IF EXISTS `countriesToCurrencies`;
DROP TABLE IF EXISTS `countriesToCurrencies`;
CREATE TABLE `countriesToCurrencies` (
	`countryId` text NOT NULL,
	`currencyId` text NOT NULL,
	PRIMARY KEY(`countryId`, `currencyId`),
	FOREIGN KEY (`countryId`) REFERENCES `countries`(`code`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`currencyId`) REFERENCES `currencies`(`currencyId`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
     `id` text PRIMARY KEY NOT NULL,
     `email` text NOT NULL,
     `firstName` text NOT NULL,
     `lastName` text NOT NULL,
     `password` text NOT NULL,
     `version` integer DEFAULT 1 NOT NULL,
     `role` text DEFAULT 'USER' NOT NULL,
     `cartId` text NOT NULL,
     FOREIGN KEY (`cartId`) REFERENCES `carts`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
DROP TABLE IF EXISTS `checkoutSessions`;
CREATE TABLE `checkoutSessions` (
    `id` text PRIMARY KEY NOT NULL,
    `products` text NOT NULL,
    `createdAt` text NOT NULL,
    `expiresAt` integer NOT NULL,
    `userId` text,
    `cartId` text,
    FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
    FOREIGN KEY (`cartId`) REFERENCES `carts`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
DROP TABLE IF EXISTS `images`;
CREATE TABLE `images` (
	`url` text PRIMARY KEY NOT NULL,
	`alt` text NOT NULL,
	`productId` text NOT NULL,
	`collectionId` text,
	FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`collectionId`) REFERENCES `collections`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
DROP TABLE IF EXISTS `payments`;
CREATE TABLE `payments` (
    `id` text PRIMARY KEY NOT NULL,
    `createdAt` text NOT NULL,
    `type` text NOT NULL,
    `state` text NOT NULL,
    `netAmount` integer DEFAULT 0 NOT NULL,
    `grossAmount` integer NOT NULL
);
--> statement-breakpoint
DROP TABLE IF EXISTS `orders`;
CREATE TABLE `orders` (
	`id` text PRIMARY KEY NOT NULL,
	`clientId` text NOT NULL,
	`createdAt` text NOT NULL,
	`userId` text,
	`addressId` text,
	`paymentId` text,
	`snapshot` text,
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`addressId`) REFERENCES `addresses`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`paymentId`) REFERENCES `payments`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
DROP TABLE IF EXISTS `productsOnCarts`;
CREATE TABLE `productsOnCarts` (
	`cartId` text NOT NULL,
	`productId` text NOT NULL,
	`quantity` integer NOT NULL,
	PRIMARY KEY(`cartId`, `productId`),
	FOREIGN KEY (`cartId`) REFERENCES `carts`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
DROP TABLE IF EXISTS `productsToOrders`;
CREATE TABLE `productsToOrders` (
	`orderId` text NOT NULL,
	`productId` text NOT NULL,
	`quantity` integer NOT NULL,
	PRIMARY KEY(`orderId`, `productId`),
	FOREIGN KEY (`orderId`) REFERENCES `orders`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
DROP TABLE IF EXISTS `taxes`;
CREATE TABLE `taxes` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`rate` integer,
	`countryId` text NOT NULL,
	FOREIGN KEY (`countryId`) REFERENCES `countries`(`code`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `images_collectionId_unique` ON `images` (`collectionId`);--> statement-breakpoint
CREATE UNIQUE INDEX `orders_clientId_unique` ON `orders` (`clientId`);