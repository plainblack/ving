import {
    int,
    mysqlEnum,
    mysqlTable,
    serial,
    uniqueIndex,
    text,
    varchar,
} from 'drizzle-orm/mysql-core';

export const users = mysqlTable('users', {
    id: serial('id').primaryKey(),
    fullName: text('full_name'),
    phone: varchar('phone', { length: 256 }),
});
