import { boolean, mysqlEnum, mysqlTable, timestamp, datetime, uniqueIndex, varchar, text, int, json } from '../orm.mjs';
import {S3FileTable} from './S3File.mjs';


export const UserTable = mysqlTable('users',
    {
        id: varchar('id', { length: 36 }).notNull().default('uuid-will-be-generated').primaryKey(),
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
		avatarId: varchar('avatarId', { length: 36 }).default(null).references(() => S3FileTable.id, {onDelete: "set null", onUpdate: "no action"})
    }, 
    (table) => ({
        usernameIndex: uniqueIndex('usernameIndex').on(table.username),
		emailIndex: uniqueIndex('emailIndex').on(table.email)
    })
);

