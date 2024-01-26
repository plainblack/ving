import { boolean, mysqlEnum, mysqlTable, timestamp, uniqueIndex, varchar, text } from '../orm.mjs';
import {UserTable} from './User.mjs';


export const TestTable = mysqlTable('tests',
    {
        id: varchar('id', { length: 36 }).notNull().default('uuid-will-be-generated').primaryKey(),
		createdAt: timestamp('createdAt').defaultNow().notNull(),
		updatedAt: timestamp('updatedAt').defaultNow().notNull().onUpdateNow(),
		email: varchar('email', { length: 256 }).notNull().default(''),
		url: text('url').notNull(),
		someShortText: varchar('someShortText', { length: 60 }).notNull().default(''),
		someLongText: text('someLongText').notNull(),
		size: mysqlEnum('size', ['small','medium','large']).notNull().default('medium'),
		isCool: boolean('isCool').notNull().default(false),
		userId: varchar('userId', { length: 36 }).notNull().references(() => UserTable.id),
		startedAt: timestamp('startedAt').defaultNow().notNull()
    }, 
    (table) => ({
        emailIndex: uniqueIndex('emailIndex').on(table.email)
    })
);


