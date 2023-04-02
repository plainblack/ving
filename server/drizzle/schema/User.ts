import { boolean, mysqlEnum, mysqlTable, timestamp, uniqueIndex, varchar, text } from 'drizzle-orm/mysql-core/index.js';



export const UserTable = mysqlTable('users',
	{
		id: varchar('id', { length: 36 }).notNull().default('uuid-will-be-generated').primaryKey(),
		createdAt: timestamp('createdAt').defaultNow().notNull(),
		updatedAt: timestamp('updatedAt').defaultNow().notNull(),
		username: varchar('username', { length: 60 }).notNull().default(''),
		email: varchar('email', { length: 256 }).notNull().default(''),
		realName: varchar('realName', { length: 60 }).notNull().default(''),
		password: varchar('password', { length: 256 }).notNull().default('no-password-specified'),
		passwordType: mysqlEnum('passwordType', ['bcrypt']).notNull().default('bcrypt'),
		useAsDisplayName: mysqlEnum('useAsDisplayName', ['username', 'email', 'realName']).notNull().default('username'),
		admin: boolean('admin').notNull().default(false),
		developer: boolean('developer').notNull().default(false)
	},
	(table) => ({
		usernameIndex: uniqueIndex('usernameIndex').on(table.username),
		emailIndex: uniqueIndex('emailIndex').on(table.email)
	})
);


export type UserModel = typeof UserTable;
