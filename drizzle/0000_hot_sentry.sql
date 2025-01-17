CREATE TABLE `addresses` (
	`id` text PRIMARY KEY NOT NULL,
	`line1` text NOT NULL,
	`line2` text,
	`postalCode` text NOT NULL,
	`city` text NOT NULL,
	`countryId` text NOT NULL,
	FOREIGN KEY (`countryId`) REFERENCES `countries`(`code`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `carts` (
	`id` text PRIMARY KEY NOT NULL
);
--> statement-breakpoint
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
CREATE TABLE `collections` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `countries` (
	`name` text NOT NULL,
	`code` text PRIMARY KEY NOT NULL,
	`currencyCode` text NOT NULL,
	FOREIGN KEY (`currencyCode`) REFERENCES `currencies`(`currencyId`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `currencies` (
	`currencyId` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`symbol` text NOT NULL,
	`rateToEuro` real NOT NULL
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
	`addressId` text,
	`paymentId` text,
	`snapshot` text,
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`addressId`) REFERENCES `addresses`(`id`) ON UPDATE no action ON DELETE cascade,
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
	`cartId` text NOT NULL,
	FOREIGN KEY (`cartId`) REFERENCES `carts`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `images_collectionId_unique` ON `images` (`collectionId`);--> statement-breakpoint
CREATE UNIQUE INDEX `orders_stripeId_unique` ON `orders` (`stripeId`);