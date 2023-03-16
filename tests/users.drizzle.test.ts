import { describe, test, expect } from "vitest";
import { db } from '../drizzle/db';
import { like, eq, asc, desc, and } from 'drizzle-orm/expressions';
import { sql } from 'drizzle-orm';
import { ValueOrArray } from 'drizzle-orm/utils';
import { AnyMySqlColumn } from 'drizzle-orm/mysql-core';
import { MySqlSelectBuilder, MySqlSelect } from 'drizzle-orm/mysql-core/query-builders'
import { users, User } from '../drizzle/schema/users';
import type { SQL } from 'drizzle-orm/sql';
import type { JoinNullability, SelectMode } from 'drizzle-orm/mysql-core/query-builders/select.types';


describe('users', async () => {

    await db.delete(users).where(like(users.email, '%@shawshank.prison'));

    test("can insert user", async () => {
        const result = await db.insert(users).values({ id: 'a', username: 'warden', email: 'warden@shawshank.prison', realName: 'Warden' });
        expect(result[0].affectedRows).toBe(1);
    });

    test("can select user", async () => {
        const result = await db.select().from(users).where(eq(users.id, 'a'));
        expect(result[0].realName).toBe('Warden');
    });

    test("can pass where clause", async () => {
        const passWhere = async (where: SQL) => await db.select().from(users).where(where);
        const result = await passWhere(eq(users.id, 'a'));
        expect(result[0].realName).toBe('Warden');
    });

    test("can pass where clause as sql", async () => {
        const passWhere = async (where: SQL) => await db.select().from(users).where(where);
        const result = await passWhere(sql`username = 'warden'`);
        expect(result[0].realName).toBe('Warden');
    });

    test("use a where callback to extend a query", async () => {
        const startIt = (whereCallback: (condition: SQL) => SQL | undefined = (c) => c) => {
            return db.select().from(users).where(whereCallback(eq(users.developer, true)));
        }
        const result = await startIt((c) => and(c, eq(users.admin, true)));
        expect(result.length).toBe(0);
    });

    test("use a where callback to extend a query but with nothing to pass in", async () => {
        const startIt = (whereCallback: (condition: SQL) => SQL | undefined = (c) => c) => {
            return db.select().from(users).where(whereCallback(eq(users.developer, true)));
        }
        const result = await startIt();
        expect(result.length).toBe(0);
    });


    // can't figure out the types on this
    /*
    test("can pass order by", async () => {
        const passOrderBy = async (orderBy: (SQL | AnyMySqlColumn)[]) => await db.select().from(users).orderBy(orderBy);
        const result = await passOrderBy([asc(users.username), desc(users.realName)]);
        expect(result[0].realName).toBe('Warden');
    });
    */

    test("can pass order by with 2", async () => {
        const passOrderBy = async (orderBy: SQL | AnyMySqlColumn) => await db.select().from(users).orderBy(orderBy);
        const result = await passOrderBy(asc(users.username));
        expect(result[0].realName).toBe('Warden');
    });


    test("can pass group by", async () => {
        const passGroupBy = async (groupBy: SQL | AnyMySqlColumn) => await db.select().from(users).groupBy(groupBy);
        const result = await passGroupBy(users.username);
        expect(result[0].realName).toBe('Warden');
    });

    test("can pass select query", async () => {
        const passSelect = async <
            TTableName extends string,
            TSelection,
            TSelectMode extends SelectMode,
            TExcludedMethods extends string,
            TNullabilityMap extends Record<string, JoinNullability>,
        >(qb: MySqlSelect<TTableName, TSelection, TSelectMode, TExcludedMethods, TNullabilityMap>) => await qb.limit(1);
        const result = await passSelect(db.select().from(users).where(eq(users.id, 'a')));
        expect(result[0].realName).toBe('Warden');
    });

    test("can update user", async () => {
        const result1 = await db.update(users).set({ realName: 'Samuel Norton' }).where(eq(users.id, 'a'));
        expect(result1[0].affectedRows).toBe(1);
        const result2 = await db.select().from(users).where(eq(users.id, 'a'));
        expect(result2[0].realName).toBe('Samuel Norton');
    });

    test("can delete user", async () => {
        const result = await db.delete(users).where(eq(users.id, 'a'));
        expect(result[0].affectedRows).toBe(1);
    });

});