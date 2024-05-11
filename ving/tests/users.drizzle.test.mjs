import { describe, test, expect, beforeAll } from "vitest";
import { useDB } from '#ving/drizzle/db.mjs';
import { like, eq, asc, desc, and, sql } from '#ving/drizzle/orm.mjs';
import { UserTable } from '#ving/drizzle/schema/User.mjs';

describe('UserTable', async () => {
    const db = useDB()
    await db.delete(UserTable).where(like(UserTable.email, '%@shawshank.prison'));

    test("can insert", async () => {
        const result = await db.insert(UserTable).values({ username: 'warden', email: 'warden@shawshank.prison', realName: 'Warden' });
        expect(result[0].affectedRows).toBe(1);
    });

    test("can select", async () => {
        const result = await db.select().from(UserTable).where(eq(UserTable.username, 'warden'));
        expect(result[0].realName).toBe('Warden');
    });

    test("can count", async () => {
        const result = await db.select({ count: sql`count(*)` }).from(UserTable).where(eq(UserTable.username, 'warden'));
        expect(result[0].count).toBe(1);
    });

    test("can count with column", async () => {
        const countWithColumn = (column) => {
            return sql`count(${column})`
        }
        const result = await db.select({ count: countWithColumn(UserTable.username) }).from(UserTable).where(eq(UserTable.username, 'warden'));
        expect(result[0].count).toBe(1);
    });

    test("can pass where clause", async () => {
        const passWhere = async (where) => await db.select().from(UserTable).where(where);
        const result = await passWhere(eq(UserTable.username, 'warden'));
        expect(result[0].realName).toBe('Warden');
    });

    test("can pass where clause as sql", async () => {
        const passWhere = async (where) => await db.select().from(UserTable).where(where);
        const result = await passWhere(sql`username = 'warden'`);
        expect(result[0].realName).toBe('Warden');
    });

    test("use a where callback to extend a query", async () => {
        const startIt = (whereCallback) => {
            return db.select().from(UserTable).where(whereCallback(like(UserTable.email, '%@shawshank.prison')));
        }
        const result = await startIt((c) => and(c, eq(UserTable.admin, true)));
        expect(result.length).toBe(0);
    });

    test("use a where callback to extend a query but with nothing to pass in", async () => {
        const startIt = (whereCallback = (a) => a) => {
            return db.select().from(UserTable).where(whereCallback(
                like(UserTable.email, '%@shawshank.prison')
            ));
        }
        const result = await startIt();
        expect(result.length).toBe(1);
    });


    test("can pass order by with 2", async () => {
        const passOrderBy = async (orderBy) => await db.select().from(UserTable).where(like(UserTable.email, '%@shawshank.prison')).orderBy(...orderBy);
        const result = await passOrderBy([asc(UserTable.username), desc(UserTable.realName)]);
        expect(result[0].realName).toBe('Warden');
    });


    test("can pass order by", async () => {
        const passOrderBy = async (orderBy) => await db.select().from(UserTable).where(like(UserTable.email, '%@shawshank.prison')).orderBy(orderBy);
        const result = await passOrderBy(asc(UserTable.username));
        expect(result[0].realName).toBe('Warden');
    });


    test("can pass group by", async () => {
        const passGroupBy = async (groupBy) => await db.select().from(UserTable).where(like(UserTable.email, '%@shawshank.prison')).groupBy(groupBy);
        const result = await passGroupBy(UserTable.username);
        expect(result[0].realName).toBe('Warden');
    });

    test("can pass select query", async () => {
        const passSelect = async (qb) => await qb.limit(1);
        const result = await passSelect(db.select().from(UserTable).where(eq(UserTable.username, 'warden')));
        expect(result[0].realName).toBe('Warden');
    });

    test("can update", async () => {
        const result1 = await db.update(UserTable).set({ realName: 'Samuel Norton' }).where(eq(UserTable.username, 'warden'));
        expect(result1[0].affectedRows).toBe(1);
        const result2 = await db.select().from(UserTable).where(eq(UserTable.username, 'warden'));
        expect(result2[0].realName).toBe('Samuel Norton');
    });

    test("can delete", async () => {
        const result = await db.delete(UserTable).where(eq(UserTable.username, 'warden'));
        expect(result[0].affectedRows).toBe(1);
    });

});