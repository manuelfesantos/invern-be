PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_taxes` (
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%f', 'now')) NOT NULL,
	`last_modified_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%f', 'now')) NOT NULL,
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`rate` real,
	`country_id` text NOT NULL,
	FOREIGN KEY (`country_id`) REFERENCES `countries`(`code`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_taxes`("created_at", "last_modified_at", "id", "name", "rate", "country_id") SELECT "created_at", "last_modified_at", "id", "name", "rate", "country_id" FROM `taxes`;--> statement-breakpoint
DROP TABLE `taxes`;--> statement-breakpoint
ALTER TABLE `__new_taxes` RENAME TO `taxes`;--> statement-breakpoint
PRAGMA foreign_keys=ON;