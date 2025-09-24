CREATE TABLE `carts` (
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%f', 'now')) NOT NULL,
	`last_modified_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%f', 'now')) NOT NULL,
	`id` text PRIMARY KEY NOT NULL,
	`is_logged_in` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `checkout_sessions` (
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%f', 'now')) NOT NULL,
	`last_modified_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%f', 'now')) NOT NULL,
	`id` text PRIMARY KEY NOT NULL,
	`products` text NOT NULL,
	`expires_at` text NOT NULL,
	`user_id` text,
	`cart_id` text,
	`shipping_method` text NOT NULL,
	`personal_details` text NOT NULL,
	`country` text NOT NULL,
	`address` text NOT NULL,
	`order_id` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`cart_id`) REFERENCES `carts`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `collections` (
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%f', 'now')) NOT NULL,
	`last_modified_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%f', 'now')) NOT NULL,
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `countries` (
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%f', 'now')) NOT NULL,
	`last_modified_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%f', 'now')) NOT NULL,
	`name` text NOT NULL,
	`code` text PRIMARY KEY NOT NULL,
	`locale` text NOT NULL,
	`currency_code` text NOT NULL,
	FOREIGN KEY (`currency_code`) REFERENCES `currencies`(`code`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `currencies` (
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%f', 'now')) NOT NULL,
	`last_modified_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%f', 'now')) NOT NULL,
	`code` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`symbol` text NOT NULL,
	`rate_to_euro` real NOT NULL,
	`stripe_name` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `images` (
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%f', 'now')) NOT NULL,
	`last_modified_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%f', 'now')) NOT NULL,
	`url` text PRIMARY KEY NOT NULL,
	`alt` text NOT NULL,
	`product_id` text NOT NULL,
	`collection_id` text,
	`is_thumbnail` integer DEFAULT false NOT NULL,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`collection_id`) REFERENCES `collections`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `images_collection_id_unique` ON `images` (`collection_id`);--> statement-breakpoint
CREATE INDEX `product_id_index` ON `images` (`product_id`);--> statement-breakpoint
CREATE TABLE `orders` (
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%f', 'now')) NOT NULL,
	`last_modified_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%f', 'now')) NOT NULL,
	`id` text PRIMARY KEY NOT NULL,
	`stripe_id` text NOT NULL,
	`user_id` text,
	`payment_id` text,
	`shipping_transaction_id` text NOT NULL,
	`address` text NOT NULL,
	`country` text NOT NULL,
	`personal_details` text NOT NULL,
	`shipping_method` text NOT NULL,
	`products` text NOT NULL,
	`is_canceled` integer,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`payment_id`) REFERENCES `payments`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`shipping_transaction_id`) REFERENCES `shipping_transactions`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `orders_stripe_id_unique` ON `orders` (`stripe_id`);--> statement-breakpoint
CREATE TABLE `payment_methods` (
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%f', 'now')) NOT NULL,
	`last_modified_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%f', 'now')) NOT NULL,
	`id` text PRIMARY KEY NOT NULL,
	`type` text NOT NULL,
	`issuer` text,
	`last_4` text
);
--> statement-breakpoint
CREATE TABLE `payments` (
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%f', 'now')) NOT NULL,
	`last_modified_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%f', 'now')) NOT NULL,
	`id` text PRIMARY KEY NOT NULL,
	`state` text NOT NULL,
	`net_amount` integer DEFAULT 0 NOT NULL,
	`gross_amount` integer NOT NULL,
	`payment_method_id` text,
	FOREIGN KEY (`payment_method_id`) REFERENCES `payment_methods`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `products` (
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%f', 'now')) NOT NULL,
	`last_modified_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%f', 'now')) NOT NULL,
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text NOT NULL,
	`stock` integer NOT NULL,
	`collection_id` text NOT NULL,
	`price_in_cents` integer NOT NULL,
	`weight` integer NOT NULL,
	FOREIGN KEY (`collection_id`) REFERENCES `collections`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `products_on_carts` (
	`cart_id` text NOT NULL,
	`product_id` text NOT NULL,
	`quantity` integer NOT NULL,
	PRIMARY KEY(`cart_id`, `product_id`),
	FOREIGN KEY (`cart_id`) REFERENCES `carts`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `shipping_methods` (
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%f', 'now')) NOT NULL,
	`last_modified_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%f', 'now')) NOT NULL,
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `shipping_rates` (
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%f', 'now')) NOT NULL,
	`last_modified_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%f', 'now')) NOT NULL,
	`id` text PRIMARY KEY NOT NULL,
	`price_in_cents` integer NOT NULL,
	`min_weight` integer NOT NULL,
	`max_weight` integer NOT NULL,
	`delivery_time` integer NOT NULL,
	`shipping_method_id` text NOT NULL,
	FOREIGN KEY (`shipping_method_id`) REFERENCES `shipping_methods`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `shipping_rates_to_countries` (
	`shipping_rate_id` text NOT NULL,
	`country_code` text NOT NULL,
	PRIMARY KEY(`shipping_rate_id`, `country_code`),
	FOREIGN KEY (`shipping_rate_id`) REFERENCES `shipping_rates`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`country_code`) REFERENCES `countries`(`code`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `shipping_transactions` (
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%f', 'now')) NOT NULL,
	`last_modified_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%f', 'now')) NOT NULL,
	`id` text PRIMARY KEY NOT NULL,
	`status` text NOT NULL,
	`tracking_url` text
);
--> statement-breakpoint
CREATE TABLE `taxes` (
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%f', 'now')) NOT NULL,
	`last_modified_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%f', 'now')) NOT NULL,
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`rate` integer,
	`country_id` text NOT NULL,
	FOREIGN KEY (`country_id`) REFERENCES `countries`(`code`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `users` (
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%f', 'now')) NOT NULL,
	`last_modified_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%f', 'now')) NOT NULL,
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`first_name` text NOT NULL,
	`last_name` text,
	`password` text,
	`version` integer DEFAULT 1 NOT NULL,
	`role` text DEFAULT 'USER' NOT NULL,
	`cart_id` text,
	`address` text,
	`is_oauth` integer DEFAULT false NOT NULL,
	`google_user_id` text,
	`is_validated` integer DEFAULT false NOT NULL,
	FOREIGN KEY (`cart_id`) REFERENCES `carts`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_cart_id_unique` ON `users` (`cart_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_google_user_id_unique` ON `users` (`google_user_id`);