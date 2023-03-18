import { Users, UserRecord } from '../server/vingrecord/records/Users';
import { describe, test, expect } from "vitest";
import { ModelSelect } from "../types";
import { like, eq, asc, desc, and, inArray } from 'drizzle-orm/expressions';



await Users.delete.where(inArray(Users.table.username, ['warden', 'captain', 'guard']));
const warden = await Users.create({ username: 'warden', email: 'warden@shawshank.jail', realName: 'Samuel Norton' });
const captain = Users.mint({ username: 'captain', email: 'captain@shawshank.jail', realName: 'Byron Hadley' });
describe('Users', async () => {
    test("make user kind", () => {
        expect(Users).toHaveProperty('db');
        expect(Users).toHaveProperty('table');
    })
    test("can create ving record", async () => {
        expect(true).toBe(true);
        expect(warden).toHaveProperty('db');
        expect(warden.get('email')).toBe('warden@shawshank.jail');
    });
    test("is owner by id", async () => {
        expect(warden.isOwner(warden)).toBe(true);
    });
    test("is not admin role", async () => {
        expect(warden.isRole('admin')).toBe(false);
    });
    test("is not owner by id or role", async () => {
        await captain.insert();
        expect(captain.isOwner(warden)).toBe(false);
        expect(warden.isOwner(captain)).toBe(false);
    });
    test("can update ving record", async () => {
        warden.set('admin', true);
        expect(warden.get('admin')).toBe(true);
        await warden.update();
    });
    test("can refetch ving record", async () => {
        await warden.refresh();
        expect(warden.get('admin')).toBe(true);
    });
    test("is owner by role", async () => {
        expect(captain.isOwner(warden)).toBe(true);
    });
    test("described by owner", async () => {
        const description = await captain.describe({ currentUser: captain, include: { links: true, options: true, meta: true } });
        expect(description.meta?.displayName).toBe('captain');
        expect(description.props.username).toBe('captain');
        if (description.links !== undefined) {
            expect(description.links.base).toBe('/api/user');
        }
        if (description.options !== undefined) {
            expect(description.options.useAsDisplayName).toBeTypeOf('object');
            expect(Object.keys(description.options).length).toBe(3);
        }
    });
    test("propOptions by owner", async () => {
        const options = await captain.propOptions({ currentUser: captain });
        expect(options?.useAsDisplayName).toBeTypeOf('object');
        expect(Object.keys(options || {}).length).toBe(3);
    });
    test("described by admin", async () => {
        const description = await captain.describe({ currentUser: warden, include: { links: true, options: true, meta: true } });
        expect(description.meta?.displayName).toBe('captain');
        expect(description.props.username).toBe('captain');
        expect(description.props.admin).toBe(false);
        if (description.links !== undefined) {
            expect(description.links.base).toBe('/api/user');
        }
        if (description.options !== undefined) {
            expect(description.options.useAsDisplayName).toBeTypeOf('object');
            expect(Object.keys(description.options).length).toBe(3);
        }
    });
    test("described by visitor", async () => {
        const description = await warden.describe({ include: { links: true, options: true, meta: true } });
        expect(description.meta?.displayName).toBe('warden');
        expect(description.props.username).toBe(undefined);
        expect(description.props.admin).toBe(undefined);
        if (description.links !== undefined) {
            expect(description.links.base).toBe('/api/user');
        }
        expect(description.options).toEqual({});
        if (description.options !== undefined) {
            expect(Object.keys(description.options).length).toBe(0);
        }
    });
    test('set password', async () => {
        warden.setPassword('foo');
        expect(await warden.testPassword('foo')).toBe(true);
    });
    test('set password via posted params', async () => {
        warden.setPostedProps({ password: 'food' }, warden);
        expect(await warden.testPassword('food')).toBe(true);
    });
    test('set useAsDisplayName via posted params', () => {
        warden.setPostedProps({ useAsDisplayName: 'email' }, warden);
        expect(warden.get('useAsDisplayName')).toBe('email');
    });
    const guard = Users.copy(captain.getAll());
    test("clone a record", () => {
        guard.setAll({
            username: 'guard',
            email: 'guard@shawshank.jail',
            realName: 'Dekins',
        });
        guard.insert();
        expect(guard.get('realName')).toBe('Dekins');
        expect(guard.get('id')).not.toBe(captain.get('id'));
        expect(guard).toHaveProperty('isRole');
    });

    //  let key = captain.apiKeys.mint({ name: 'foo' } as any);
    // await key.insert();
    // console.log(JSON.stringify(await captain.describe({ currentUser: captain, include: { related: ['apiKeys'], extra: ['foo'] } }), undefined, 2));

    test("can delete ving record", async () => {
        await warden.delete()
        expect(warden.get('username')).toBe('warden');
        expect(await Users.count((c) => and(c, eq(Users.table.email, 'warden@shawshank.jail')))).toBe(0);
        await captain.delete()
        await guard.delete()
    });

    const rita = Users.mint({});
    let params: Partial<ModelSelect<'User'>> = { realName: 'Rita Hayworth', email: 'rita@hollywood.com' };
    test('can verify creation params', () => {
        expect(() => rita.testCreationProps(params)).toThrowError();
        params.username = 'rita';
        expect(rita.testCreationProps(params)).toBe(true);
    });

    test('can verify empty creation params', () => {
        params.username = '';
        expect(() => rita.testCreationProps(params)).toThrowError();
    });

    test('can verify posted params', async () => {
        params.username = 'rita';
        params.email = 'rita@rita.com';
        expect(await rita.setPostedProps(params)).toBe(true);
        expect(rita.get('username')).toBe('rita');
    });

})
