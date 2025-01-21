import { boolean, mysqlEnum, mysqlTable, timestamp, datetime, uniqueIndex, unique, char, varchar, text, int, bigint, json, mediumText, foreignKey } from '#ving/drizzle/orm.mjs';
import {S3FileTable} from '#ving/drizzle/schema/S3File.mjs';


export const UserTable = mysqlTable('users',
    {
        id: bigint('id', {mode:'number', unsigned: true}).notNull().autoincrement().primaryKey(),
		createdAt: timestamp('createdAt').defaultNow().notNull(),
		updatedAt: timestamp('updatedAt').defaultNow().notNull().onUpdateNow(),
		username: varchar('username', { length: 60 }).notNull().default(''),
		email: varchar('email', { length: 256 }).notNull().default(''),
		realName: varchar('realName', { length: 60 }).notNull().default(''),
		password: varchar('password', { length: 256 }).notNull().default('no-password-specified'),
		passwordType: mysqlEnum('passwordType', ['bcrypt']).notNull().default('bcrypt'),
		useAsDisplayName: mysqlEnum('useAsDisplayName', ['username','email','realName']).notNull().default('username'),
		verifiedEmail: boolean('verifiedEmail').notNull().default(false),
		admin: boolean('admin').notNull().default(false),
		developer: boolean('developer').notNull().default(false),
		avatarType: mysqlEnum('avatarType', ['robot','uploaded']).notNull().default('robot'),
		bio: mediumText('bio').notNull(),
		avatarId: bigint('avatarId', {mode:'number', unsigned: true}).default(null)
    }, 
    (table) => ([
        uniqueIndex('usernameIndex').on(table.username),
		uniqueIndex('emailIndex').on(table.email),
		foreignKey({ name: "users_avatar_39d62890_fk", columns: [table.avatarId], foreignColumns: [S3FileTable.id]}).onDelete("set null").onUpdate("no action")
    ])
);

