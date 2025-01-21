import { boolean, mysqlEnum, mysqlTable, timestamp, datetime, uniqueIndex, unique, char, varchar, text, int, bigint, json, mediumText, foreignKey } from '#ving/drizzle/orm.mjs';
import {UserTable} from '#ving/drizzle/schema/User.mjs';


export const APIKeyTable = mysqlTable('apikeys',
    {
        id: bigint('id', {mode:'number', unsigned: true}).notNull().autoincrement().primaryKey(),
		createdAt: timestamp('createdAt').defaultNow().notNull(),
		updatedAt: timestamp('updatedAt').defaultNow().notNull().onUpdateNow(),
		name: varchar('name', { length: 60 }).notNull().default(''),
		url: text('url').notNull(),
		reason: text('reason').notNull(),
		privateKey: varchar('privateKey', { length: 39 }).notNull().default(''),
		userId: bigint('userId', {mode:'number', unsigned: true}).notNull()
    }, 
    (table) => ([
        foreignKey({ name: "apikeys_user_90ada4_fk", columns: [table.userId], foreignColumns: [UserTable.id]}).onDelete("cascade").onUpdate("cascade")
    ])
);

