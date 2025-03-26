DROP INDEX "images_collectionId_unique";--> statement-breakpoint
DROP INDEX "productId_index";--> statement-breakpoint
DROP INDEX "orders_stripeId_unique";--> statement-breakpoint
DROP INDEX "users_cartId_unique";--> statement-breakpoint
DROP INDEX "users_googleUserId_unique";--> statement-breakpoint
ALTER TABLE `carts` ALTER COLUMN "createdAt" TO "createdAt" text NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%f', 'now'));--> statement-breakpoint
CREATE UNIQUE INDEX `images_collectionId_unique` ON `images` (`collectionId`);--> statement-breakpoint
CREATE INDEX `productId_index` ON `images` (`productId`);--> statement-breakpoint
CREATE UNIQUE INDEX `orders_stripeId_unique` ON `orders` (`stripeId`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_cartId_unique` ON `users` (`cartId`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_googleUserId_unique` ON `users` (`googleUserId`);--> statement-breakpoint
ALTER TABLE `carts` ALTER COLUMN "lastModifiedAt" TO "lastModifiedAt" text NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%f', 'now'));--> statement-breakpoint
ALTER TABLE `checkoutSessions` ALTER COLUMN "createdAt" TO "createdAt" text NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%f', 'now'));--> statement-breakpoint
ALTER TABLE `checkoutSessions` ALTER COLUMN "lastModifiedAt" TO "lastModifiedAt" text NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%f', 'now'));--> statement-breakpoint
ALTER TABLE `collections` ALTER COLUMN "createdAt" TO "createdAt" text NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%f', 'now'));--> statement-breakpoint
ALTER TABLE `collections` ALTER COLUMN "lastModifiedAt" TO "lastModifiedAt" text NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%f', 'now'));--> statement-breakpoint
ALTER TABLE `countries` ALTER COLUMN "createdAt" TO "createdAt" text NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%f', 'now'));--> statement-breakpoint
ALTER TABLE `countries` ALTER COLUMN "lastModifiedAt" TO "lastModifiedAt" text NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%f', 'now'));--> statement-breakpoint
ALTER TABLE `currencies` ALTER COLUMN "createdAt" TO "createdAt" text NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%f', 'now'));--> statement-breakpoint
ALTER TABLE `currencies` ALTER COLUMN "lastModifiedAt" TO "lastModifiedAt" text NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%f', 'now'));--> statement-breakpoint
ALTER TABLE `images` ALTER COLUMN "createdAt" TO "createdAt" text NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%f', 'now'));--> statement-breakpoint
ALTER TABLE `images` ALTER COLUMN "lastModifiedAt" TO "lastModifiedAt" text NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%f', 'now'));--> statement-breakpoint
ALTER TABLE `orders` ALTER COLUMN "createdAt" TO "createdAt" text NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%f', 'now'));--> statement-breakpoint
ALTER TABLE `orders` ALTER COLUMN "lastModifiedAt" TO "lastModifiedAt" text NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%f', 'now'));--> statement-breakpoint
ALTER TABLE `paymentMethods` ALTER COLUMN "createdAt" TO "createdAt" text NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%f', 'now'));--> statement-breakpoint
ALTER TABLE `paymentMethods` ALTER COLUMN "lastModifiedAt" TO "lastModifiedAt" text NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%f', 'now'));--> statement-breakpoint
ALTER TABLE `payments` ALTER COLUMN "createdAt" TO "createdAt" text NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%f', 'now'));--> statement-breakpoint
ALTER TABLE `payments` ALTER COLUMN "lastModifiedAt" TO "lastModifiedAt" text NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%f', 'now'));--> statement-breakpoint
ALTER TABLE `products` ALTER COLUMN "createdAt" TO "createdAt" text NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%f', 'now'));--> statement-breakpoint
ALTER TABLE `products` ALTER COLUMN "lastModifiedAt" TO "lastModifiedAt" text NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%f', 'now'));--> statement-breakpoint
ALTER TABLE `shippingMethods` ALTER COLUMN "createdAt" TO "createdAt" text NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%f', 'now'));--> statement-breakpoint
ALTER TABLE `shippingMethods` ALTER COLUMN "lastModifiedAt" TO "lastModifiedAt" text NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%f', 'now'));--> statement-breakpoint
ALTER TABLE `shippingRates` ALTER COLUMN "createdAt" TO "createdAt" text NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%f', 'now'));--> statement-breakpoint
ALTER TABLE `shippingRates` ALTER COLUMN "lastModifiedAt" TO "lastModifiedAt" text NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%f', 'now'));--> statement-breakpoint
ALTER TABLE `shippingTransactions` ALTER COLUMN "createdAt" TO "createdAt" text NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%f', 'now'));--> statement-breakpoint
ALTER TABLE `shippingTransactions` ALTER COLUMN "lastModifiedAt" TO "lastModifiedAt" text NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%f', 'now'));--> statement-breakpoint
ALTER TABLE `taxes` ALTER COLUMN "createdAt" TO "createdAt" text NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%f', 'now'));--> statement-breakpoint
ALTER TABLE `taxes` ALTER COLUMN "lastModifiedAt" TO "lastModifiedAt" text NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%f', 'now'));--> statement-breakpoint
ALTER TABLE `users` ALTER COLUMN "createdAt" TO "createdAt" text NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%f', 'now'));--> statement-breakpoint
ALTER TABLE `users` ALTER COLUMN "lastModifiedAt" TO "lastModifiedAt" text NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%f', 'now'));