import { boolean, mysqlEnum, mysqlTable, timestamp, datetime, uniqueIndex, varchar, text, int, json, mediumText, foreignKey } from '#ving/drizzle/orm.mjs';
import {UserTable} from '#ving/drizzle/schema/User.mjs';


export const APIKeyTable = mysqlTable('apikeys',
    {
        id: varchar('id', { length: 36 }).notNull().default('uuid-will-be-generated').primaryKey(),
		createdAt: timestamp('createdAt').defaultNow().notNull(),
		updatedAt: timestamp('updatedAt').defaultNow().notNull().onUpdateNow(),
		name: varchar('name', { length: 60 }).notNull().default(''),
		url: text('url').notNull(),
		reason: text('reason').notNull(),
		privateKey: varchar('privateKey', { length: 39 }).notNull().default(''),
		userId: varchar('userId', { length: 36 }).notNull()
    }, 
    (table) => ({
        apikeys_user_90ada4_fk: foreignKey({ name: "apikeys_user_90ada4_fk", columns: [table.userId], foreignColumns: [UserTable.id]}).onDelete("cascade").onUpdate("cascade")
    })
);

