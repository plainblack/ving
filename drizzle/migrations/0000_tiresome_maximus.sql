CREATE TABLE `apikeys` (
	`id` varchar(36) PRIMARY KEY NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()),
	`name` varchar(60) NOT NULL,
	`url` varchar(256) NOT NULL DEFAULT '',
	`reason` text NOT NULL DEFAULT (''),
	`privateKey` varchar(36) NOT NULL,
	`userId` varchar(36) NOT NULL
);

CREATE TABLE `users` (
	`id` varchar(36) PRIMARY KEY NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()),
	`username` varchar(60) NOT NULL,
	`email` varchar(256) NOT NULL,
	`realName` varchar(60) NOT NULL,
	`password` varchar(256) NOT NULL DEFAULT 'no-password-specified',
	`passwordType` enum('bcrypt') NOT NULL DEFAULT 'bcrypt',
	`useAsDisplayName` enum('username','email','realName') NOT NULL DEFAULT 'username',
	`admin` boolean NOT NULL DEFAULT false,
	`developer` boolean NOT NULL DEFAULT false
);

ALTER TABLE apikeys ADD CONSTRAINT apikeys_userId_users_id_fk FOREIGN KEY (`userId`) REFERENCES users(`id`) ;
CREATE UNIQUE INDEX usernameIndex ON users (`username`);
CREATE UNIQUE INDEX emailIndex ON users (`email`);