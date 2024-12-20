ALTER TABLE `payments` RENAME COLUMN `amount` TO `grossAmount`;--> statement-breakpoint
ALTER TABLE `payments` ADD `netAmount` integer NOT NULL DEFAULT 0;