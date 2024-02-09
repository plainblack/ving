ALTER TABLE `users` ADD `avatarType` enum('robot','uploaded') DEFAULT 'robot' NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `avatarId` varchar(36);--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `users_avatarId_s3files_id_fk` FOREIGN KEY (`avatarId`) REFERENCES `s3files`(`id`) ON DELETE no action ON UPDATE no action;