import { describe, test, expect } from "vitest";
import { db } from '../drizzle/db';
import { like, eq } from 'drizzle-orm/expressions';
import { sql } from 'drizzle-orm';
import { users } from '../drizzle/schema/users';
import type { SQL } from 'drizzle-orm/sql';


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

    test("can pass order by", async () => {
        const passWhere = async (where: SQL) => await db.select().from(users).where(where);
        const result = await passWhere(sql`username = 'warden'`);
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