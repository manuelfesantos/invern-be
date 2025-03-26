ALTER TABLE `shippingTransactions` RENAME COLUMN "updatedAt" TO "lastModifiedAt";--> statement-breakpoint
DROP INDEX "images_collectionId_unique";--> statement-breakpoint
DROP INDEX "productId_index";--> statement-breakpoint
DROP INDEX "orders_stripeId_unique";--> statement-breakpoint
DROP INDEX "users_cartId_unique";--> statement-breakpoint
DROP INDEX "users_googleUserId_unique";--> statement-breakpoint
ALTER TABLE `shippingTransactions` ALTER COLUMN "createdAt" TO "createdAt" text;--> statement-breakpoint
CREATE UNIQUE INDEX `images_collectionId_unique` ON `images` (`collectionId`);--> statement-breakpoint
CREATE INDEX `productId_index` ON `images` (`productId`);--> statement-breakpoint
CREATE UNIQUE INDEX `orders_stripeId_unique` ON `orders` (`stripeId`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_cartId_unique` ON `users` (`cartId`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_googleUserId_unique` ON `users` (`googleUserId`);--> statement-breakpoint
ALTER TABLE `shippingTransactions` ALTER COLUMN "lastModifiedAt" TO "lastModifiedAt" text;--> statement-breakpoint
ALTER TABLE `carts` ALTER COLUMN "lastModifiedAt" TO "lastModifiedAt" text;--> statement-breakpoint
ALTER TABLE `carts` ADD `createdAt` text;--> statement-breakpoint
ALTER TABLE `checkoutSessions` ALTER COLUMN "createdAt" TO "createdAt" text;--> statement-breakpoint
ALTER TABLE `checkoutSessions` ADD `lastModifiedAt` text;--> statement-breakpoint
ALTER TABLE `orders` ALTER COLUMN "createdAt" TO "createdAt" text;--> statement-breakpoint
ALTER TABLE `orders` ADD `lastModifiedAt` text;--> statement-breakpoint
ALTER TABLE `payments` ALTER COLUMN "createdAt" TO "createdAt" text;--> statement-breakpoint
ALTER TABLE `payments` ADD `lastModifiedAt` text;--> statement-breakpoint
ALTER TABLE `collections` ADD `createdAt` text;--> statement-breakpoint
ALTER TABLE `collections` ADD `lastModifiedAt` text;--> statement-breakpoint
ALTER TABLE `countries` ADD `createdAt` text;--> statement-breakpoint
ALTER TABLE `countries` ADD `lastModifiedAt` text;--> statement-breakpoint
ALTER TABLE `currencies` ADD `createdAt` text;--> statement-breakpoint
ALTER TABLE `currencies` ADD `lastModifiedAt` text;--> statement-breakpoint
ALTER TABLE `images` ADD `createdAt` text;--> statement-breakpoint
ALTER TABLE `images` ADD `lastModifiedAt` text;--> statement-breakpoint
ALTER TABLE `paymentMethods` ADD `createdAt` text;--> statement-breakpoint
ALTER TABLE `paymentMethods` ADD `lastModifiedAt` text;--> statement-breakpoint
ALTER TABLE `products` ADD `createdAt` text;--> statement-breakpoint
ALTER TABLE `products` ADD `lastModifiedAt` text;--> statement-breakpoint
ALTER TABLE `shippingMethods` ADD `createdAt` text;--> statement-breakpoint
ALTER TABLE `shippingMethods` ADD `lastModifiedAt` text;--> statement-breakpoint
ALTER TABLE `shippingRates` ADD `createdAt` text;--> statement-breakpoint
ALTER TABLE `shippingRates` ADD `lastModifiedAt` text;--> statement-breakpoint
ALTER TABLE `taxes` ADD `createdAt` text;--> statement-breakpoint
ALTER TABLE `taxes` ADD `lastModifiedAt` text;--> statement-breakpoint
ALTER TABLE `users` ADD `createdAt` text;--> statement-breakpoint
ALTER TABLE `users` ADD `lastModifiedAt` text;

