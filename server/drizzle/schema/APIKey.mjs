import { boolean, mysqlEnum, mysqlTable, timestamp, uniqueIndex, varchar, text } from '../orm.mjs';
import { UserTable } from './User.mjs';


export const APIKeyTable = mysqlTable('apikeys',
	{
		id: varchar('id', { length: 36 }).notNull().default('uuid-will-be-generated').primaryKey(),
		createdAt: timestamp('createdAt').defaultNow().notNull(),
		updatedAt: timestamp('updatedAt').defaultNow().notNull().onUpdateNow(),
		name: varchar('name', { length: 60 }).notNull().default(''),
		url: text('url').notNull(),
		reason: text('reason').notNull(),
		privateKey: varchar('privateKey', { length: 39 }).notNull().default(''),
		userId: varchar('userId', { length: 36 }).notNull().references(() => UserTable.id)
	},
	(table) => ({

	})
);