import { boolean, mysqlEnum, mysqlTable, timestamp, datetime, uniqueIndex, unique, char, varchar, text, int, bigint, json, mediumText, foreignKey } from '#ving/drizzle/orm.mjs';



export const CronJobTable = mysqlTable('cronjobs',
    {
        id: bigint('id', {mode:'number', unsigned: true}).notNull().autoincrement().primaryKey(),
		createdAt: timestamp('createdAt').defaultNow().notNull(),
		updatedAt: timestamp('updatedAt').defaultNow().notNull().onUpdateNow(),
		schedule: varchar('schedule', { length: 60 }).notNull().default('* * * * *'),
		handler: varchar('handler', { length: 60 }).notNull().default('Test'),
		params: json('params').notNull().default({}),
		enabled: boolean('enabled').notNull().default(true),
		note: text('note').notNull()
    }, 
    (table) => ({
        
    })
);

