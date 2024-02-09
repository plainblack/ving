ALTER TABLE `apikeys` DROP FOREIGN KEY `apikeys_userId_users_id_fk`;
--> statement-breakpoint
ALTER TABLE `s3files` DROP FOREIGN KEY `s3files_userId_users_id_fk`;
--> statement-breakpoint
ALTER TABLE `users` DROP FOREIGN KEY `users_avatarId_s3files_id_fk`;
--> statement-breakpoint
ALTER TABLE `apikeys` ADD CONSTRAINT `apikeys_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `s3files` ADD CONSTRAINT `s3files_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `users_avatarId_s3files_id_fk` FOREIGN KEY (`avatarId`) REFERENCES `s3files`(`id`) ON DELETE set null ON UPDATE no action;