CREATE TABLE `carts` (
	`createdAt` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%f', 'now')) NOT NULL,
	`lastModifiedAt` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%f', 'now')) NOT NULL,
	`id` text PRIMARY KEY NOT NULL,
	`isLoggedIn` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `checkoutSessions` (
	`createdAt` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%f', 'now')) NOT NULL,
	`lastModifiedAt` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%f', 'now')) NOT NULL,
	`id` text PRIMARY KEY NOT NULL,
	`products` text NOT NULL,
	`expiresAt` text NOT NULL,
	`userId` text,
	`cartId` text,
	`shippingMethod` text NOT NULL,
	`personalDetails` text NOT NULL,
	`country` text NOT NULL,
	`address` text NOT NULL,
	`orderId` text NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`cartId`) REFERENCES `carts`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `collections` (
	`createdAt` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%f', 'now')) NOT NULL,
	`lastModifiedAt` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%f', 'now')) NOT NULL,
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `countries` (
	`createdAt` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%f', 'now')) NOT NULL,
	`lastModifiedAt` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%f', 'now')) NOT NULL,
	`name` text NOT NULL,
	`code` text PRIMARY KEY NOT NULL,
	`locale` text NOT NULL,
	`currencyCode` text NOT NULL,
	FOREIGN KEY (`currencyCode`) REFERENCES `currencies`(`code`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `currencies` (
	`createdAt` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%f', 'now')) NOT NULL,
	`lastModifiedAt` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%f', 'now')) NOT NULL,
	`code` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`symbol` text NOT NULL,
	`rateToEuro` real NOT NULL,
	`stripeName` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `images` (
	`createdAt` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%f', 'now')) NOT NULL,
	`lastModifiedAt` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%f', 'now')) NOT NULL,
	`url` text PRIMARY KEY NOT NULL,
	`alt` text NOT NULL,
	`productId` text NOT NULL,
	`collectionId` text,
	`isThumbnail` integer DEFAULT false NOT NULL,
	FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`collectionId`) REFERENCES `collections`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `images_collectionId_unique` ON `images` (`collectionId`);--> statement-breakpoint
CREATE INDEX `productId_index` ON `images` (`productId`);--> statement-breakpoint
CREATE TABLE `orders` (
	`createdAt` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%f', 'now')) NOT NULL,
	`lastModifiedAt` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%f', 'now')) NOT NULL,
	`id` text PRIMARY KEY NOT NULL,
	`stripeId` text NOT NULL,
	`userId` text,
	`paymentId` text,
	`shippingTransactionId` text NOT NULL,
	`address` text NOT NULL,
	`country` text NOT NULL,
	`personalDetails` text NOT NULL,
	`shippingMethod` text NOT NULL,
	`products` text NOT NULL,
	`isCanceled` integer,
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`paymentId`) REFERENCES `payments`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`shippingTransactionId`) REFERENCES `shippingTransactions`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `orders_stripeId_unique` ON `orders` (`stripeId`);--> statement-breakpoint
CREATE TABLE `paymentMethods` (
	`createdAt` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%f', 'now')) NOT NULL,
	`lastModifiedAt` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%f', 'now')) NOT NULL,
	`id` text PRIMARY KEY NOT NULL,
	`type` text NOT NULL,
	`issuer` text,
	`last4` text
);
--> statement-breakpoint
CREATE TABLE `payments` (
	`createdAt` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%f', 'now')) NOT NULL,
	`lastModifiedAt` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%f', 'now')) NOT NULL,
	`id` text PRIMARY KEY NOT NULL,
	`state` text NOT NULL,
	`netAmount` integer DEFAULT 0 NOT NULL,
	`grossAmount` integer NOT NULL,
	`paymentMethodId` text,
	FOREIGN KEY (`paymentMethodId`) REFERENCES `paymentMethods`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `products` (
	`createdAt` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%f', 'now')) NOT NULL,
	`lastModifiedAt` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%f', 'now')) NOT NULL,
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
CREATE TABLE `shippingMethods` (
	`createdAt` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%f', 'now')) NOT NULL,
	`lastModifiedAt` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%f', 'now')) NOT NULL,
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `shippingRates` (
	`createdAt` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%f', 'now')) NOT NULL,
	`lastModifiedAt` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%f', 'now')) NOT NULL,
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
	PRIMARY KEY(`shippingRateId`, `countryCode`),
	FOREIGN KEY (`shippingRateId`) REFERENCES `shippingRates`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`countryCode`) REFERENCES `countries`(`code`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `shippingTransactions` (
	`createdAt` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%f', 'now')) NOT NULL,
	`lastModifiedAt` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%f', 'now')) NOT NULL,
	`id` text PRIMARY KEY NOT NULL,
	`status` text NOT NULL,
	`trackingUrl` text
);
--> statement-breakpoint
CREATE TABLE `taxes` (
	`createdAt` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%f', 'now')) NOT NULL,
	`lastModifiedAt` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%f', 'now')) NOT NULL,
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`rate` integer,
	`countryId` text NOT NULL,
	FOREIGN KEY (`countryId`) REFERENCES `countries`(`code`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `users` (
	`createdAt` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%f', 'now')) NOT NULL,
	`lastModifiedAt` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%f', 'now')) NOT NULL,
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`firstName` text NOT NULL,
	`lastName` text,
	`password` text,
	`version` integer DEFAULT 1 NOT NULL,
	`role` text DEFAULT 'USER' NOT NULL,
	`cartId` text,
	`address` text,
	`isOauth` integer DEFAULT false NOT NULL,
	`googleUserId` text,
	`isValidated` integer DEFAULT false NOT NULL,
	FOREIGN KEY (`cartId`) REFERENCES `carts`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_cartId_unique` ON `users` (`cartId`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_googleUserId_unique` ON `users` (`googleUserId`);