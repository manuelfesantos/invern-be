CREATE TABLE `carts` (
	`id` text PRIMARY KEY NOT NULL,
	`lastModifiedAt` integer NOT NULL,
	`isLoggedIn` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `checkoutSessions` (
	`id` text PRIMARY KEY NOT NULL,
	`products` text NOT NULL,
	`createdAt` text NOT NULL,
	`expiresAt` integer NOT NULL,
	`userId` text,
	`cartId` text,
	`address` text NOT NULL,
	`shippingAddressId` text,
	`personalDetails` text NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`cartId`) REFERENCES `carts`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`shippingAddressId`) REFERENCES `shippingMethods`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `collections` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `countries` (
	`name` text NOT NULL,
	`code` text PRIMARY KEY NOT NULL,
	`locale` text NOT NULL,
	`currencyCode` text NOT NULL,
	FOREIGN KEY (`currencyCode`) REFERENCES `currencies`(`currencyId`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `currencies` (
	`currencyId` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`symbol` text NOT NULL,
	`rateToEuro` real NOT NULL,
	`stripeName` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `images` (
	`url` text PRIMARY KEY NOT NULL,
	`alt` text NOT NULL,
	`productId` text NOT NULL,
	`collectionId` text,
	FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`collectionId`) REFERENCES `collections`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` text PRIMARY KEY NOT NULL,
	`stripeId` text NOT NULL,
	`createdAt` text NOT NULL,
	`userId` text,
	`address` text NOT NULL,
	`paymentId` text,
	`snapshot` text,
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`paymentId`) REFERENCES `payments`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `payments` (
	`id` text PRIMARY KEY NOT NULL,
	`createdAt` text NOT NULL,
	`type` text NOT NULL,
	`state` text NOT NULL,
	`netAmount` integer DEFAULT 0 NOT NULL,
	`grossAmount` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text NOT NULL,
	`stock` integer NOT NULL,
	`collectionId` text NOT NULL,
	`priceInCents` integer NOT NULL,
	`weight` integer NOT NULL,
	FOREIGN KEY (`collectionId`) REFERENCES `collections`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `productsOnCarts` (
	`cartId` text NOT NULL,
	`productId` text NOT NULL,
	`quantity` integer NOT NULL,
	PRIMARY KEY(`cartId`, `productId`),
	FOREIGN KEY (`cartId`) REFERENCES `carts`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `productsToOrders` (
	`orderId` text NOT NULL,
	`productId` text NOT NULL,
	`quantity` integer NOT NULL,
	PRIMARY KEY(`orderId`, `productId`),
	FOREIGN KEY (`orderId`) REFERENCES `orders`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `shippingMethods` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `shippingRates` (
	`id` text PRIMARY KEY NOT NULL,
	`priceInCents` integer NOT NULL,
	`minWeight` integer NOT NULL,
	`maxWeight` integer NOT NULL,
	`deliveryTime` integer NOT NULL,
	`shippingMethodId` text NOT NULL,
	FOREIGN KEY (`shippingMethodId`) REFERENCES `shippingMethods`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `shippingRatesToCountries` (
	`shippingRateId` text NOT NULL,
	`countryCode` text NOT NULL,
	PRIMARY KEY(`countryCode`, `shippingRateId`),
	FOREIGN KEY (`shippingRateId`) REFERENCES `shippingRates`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`countryCode`) REFERENCES `countries`(`code`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `taxes` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`rate` integer,
	`countryId` text NOT NULL,
	FOREIGN KEY (`countryId`) REFERENCES `countries`(`code`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`firstName` text NOT NULL,
	`lastName` text NOT NULL,
	`password` text NOT NULL,
	`version` integer DEFAULT 1 NOT NULL,
	`role` text DEFAULT 'USER' NOT NULL,
	`cartId` text,
	`address` text,
	FOREIGN KEY (`cartId`) REFERENCES `carts`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `images_collectionId_unique` ON `images` (`collectionId`);--> statement-breakpoint
CREATE UNIQUE INDEX `orders_stripeId_unique` ON `orders` (`stripeId`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_cartId_unique` ON `users` (`cartId`);