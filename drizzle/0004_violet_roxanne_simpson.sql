ALTER TABLE `currencies` RENAME COLUMN "currencyId" TO "code";--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_countries` (
	`createdAt` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%f', 'now')) NOT NULL,
	`lastModifiedAt` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%f', 'now')) NOT NULL,
	`name` text NOT NULL,
	`code` text PRIMARY KEY NOT NULL,
	`locale` text NOT NULL,
	`currencyCode` text NOT NULL,
	FOREIGN KEY (`currencyCode`) REFERENCES `currencies`(`code`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_countries`("createdAt", "lastModifiedAt", "name", "code", "locale", "currencyCode") SELECT "createdAt", "lastModifiedAt", "name", "code", "locale", "currencyCode" FROM `countries`;--> statement-breakpoint
DROP TABLE `countries`;--> statement-breakpoint
ALTER TABLE `__new_countries` RENAME TO `countries`;--> statement-breakpoint
PRAGMA foreign_keys=ON;