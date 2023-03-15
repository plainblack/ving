CREATE TABLE
    `apikeys` (
        `id` varchar(36) PRIMARY KEY NOT NULL,
        `createdAt` timestamp NOT NULL DEFAULT (now()),
        `updatedAt` timestamp NOT NULL DEFAULT (now()),
        `name` varchar(60) NOT NULL DEFAULT '',
        `url` text NOT NULL,
        `reason` text NOT NULL,
        `privateKey` varchar(39) NOT NULL DEFAULT '',
        `userId` varchar(36) NOT NULL
    );

CREATE TABLE
    `users` (
        `id` varchar(36) PRIMARY KEY NOT NULL,
        `createdAt` timestamp NOT NULL DEFAULT (now()),
        `updatedAt` timestamp NOT NULL DEFAULT (now()),
        `username` varchar(60) NOT NULL DEFAULT '',
        `email` varchar(256) NOT NULL DEFAULT '',
        `realName` varchar(60) NOT NULL DEFAULT '',
        `password` varchar(256) NOT NULL DEFAULT 'no-password-specified',
        `passwordType` enum('bcrypt') NOT NULL DEFAULT 'bcrypt',
        `useAsDisplayName` enum(
            'username',
            'email',
            'realName'
        ) NOT NULL DEFAULT 'username',
        `admin` boolean NOT NULL DEFAULT false,
        `developer` boolean NOT NULL DEFAULT false
    );

ALTER TABLE apikeys
ADD
    CONSTRAINT apikeys_userId_users_id_fk FOREIGN KEY (`userId`) REFERENCES users(`id`);

CREATE UNIQUE INDEX usernameIndex ON users (`username`);

CREATE UNIQUE INDEX emailIndex ON users (`email`);