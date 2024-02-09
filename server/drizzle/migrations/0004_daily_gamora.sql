CREATE TABLE `s3files` (
	`id` varchar(36) NOT NULL DEFAULT 'uuid-will-be-generated',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`filename` varchar(256) NOT NULL DEFAULT '',
	`s3folder` varchar(256) NOT NULL DEFAULT '',
	`sizeInBytes` int NOT NULL DEFAULT 0,
	`metadata` json NOT NULL DEFAULT ('{}'),
	`icon` enum('pending','thumbnail','extension','self') NOT NULL DEFAULT 'pending',
	`userId` varchar(36) NOT NULL,
	CONSTRAINT `s3files_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `apikeys` DROP FOREIGN KEY `apikeys_userId_users_id_fk`;
--> statement-breakpoint
ALTER TABLE `apikeys` ADD CONSTRAINT `apikeys_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `s3files` ADD CONSTRAINT `s3files_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;