import { boolean, mysqlEnum, mysqlTable, timestamp, datetime, uniqueIndex, varchar, text, int, json } from '../orm.mjs';
import {UserTable} from './User.mjs';


export const S3FileTable = mysqlTable('s3files',
    {
        id: varchar('id', { length: 36 }).notNull().default('uuid-will-be-generated').primaryKey(),
		createdAt: timestamp('createdAt').defaultNow().notNull(),
		updatedAt: timestamp('updatedAt').defaultNow().notNull().onUpdateNow(),
		filename: varchar('filename', { length: 256 }).notNull().default(''),
		contentType: varchar('contentType', { length: 256 }).notNull().default(''),
		s3folder: varchar('s3folder', { length: 256 }).notNull().default(''),
		sizeInBytes: int('sizeInBytes').notNull().default(0),
		metadata: json('metadata').notNull().default({}),
		status: mysqlEnum('status', ['pending','ready','postProcessingFailed']).notNull().default('pending'),
		icon: mysqlEnum('icon', ['pending','thumbnail','extension','self']).notNull().default('pending'),
		userId: varchar('userId', { length: 36 }).notNull().references(() => UserTable.id, {onDelete: "cascade", onUpdate: "cascade"})
    }, 
    (table) => ({
        
    })
);

