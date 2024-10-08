CREATE TABLE `checkoutSessions` (
	`checkoutSessionId` text PRIMARY KEY NOT NULL,
	`products` text NOT NULL,
	`createdAt` text NOT NULL,
	`expiresAt` integer NOT NULL,
	`userId` text,
	`cartId` text,
	FOREIGN KEY (`userId`) REFERENCES `users`(`userId`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`cartId`) REFERENCES `carts`(`cartId`) ON UPDATE no action ON DELETE cascade
);