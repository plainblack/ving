import { useKind } from '#ving/record/utils.mjs';
import { describe, test, expect } from "vitest";
import { like, eq, asc, desc, and, inArray, SQL } from '#ving/drizzle/orm.mjs';
import { getConfig } from '#ving/config.mjs';

const Users = await useKind('User');
const vingConfig = await getConfig();

await Users.delete.where(inArray(Users.table.username, ['warden', 'captain', 'guard', 'rita']));
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
        expect(await warden.isOwner(warden)).toBe(true);
    });
    test("is not admin role", async () => {
        expect(await warden.isRole('admin')).toBe(false);
    });
    test("is not owner by id or role", async () => {
        await captain.insert();
        expect(await captain.isOwner(warden)).toBe(false);
        expect(await warden.isOwner(captain)).toBe(false);
    });
    test("can update ving record", async () => {
        warden.admin = true;
        expect(warden.admin).toBe(true);
        await warden.update();
    });
    test("can refetch ving record", async () => {
        await warden.refresh();
        expect(warden.get('admin')).toBe(true);
    });
    test("is owner by role", async () => {
        expect(await captain.isOwner(warden)).toBe(true);
    });
    test("described by owner", async () => {
        const description = await captain.describe({ currentUser: captain, include: { links: true, options: true, meta: true } });
        expect(description.meta?.displayName).toBe('captain');
        expect(description.props.username).toBe('captain');
        if (description?.links) {
            expect(description.links.base.href).toBe(`/api/${vingConfig.rest.version}/user`);
        }
        if (description?.options) {
            expect(description.options.useAsDisplayName).toBeTypeOf('object');
            expect(Object.keys(description.options).length).toBe(5);
        }
    });
    test("propOptions by owner", async () => {
        const options = await captain.propOptions({ currentUser: captain });
        expect(options?.useAsDisplayName).toBeTypeOf('object');
        expect(Object.keys(options || {}).length).toBe(5);
    });
    test("described by admin", async () => {
        const description = await captain.describe({ currentUser: warden, include: { links: true, options: true, meta: true } });
        expect(description.meta?.displayName).toBe('captain');
        expect(description.props.username).toBe('captain');
        expect(description.props.admin).toBe(false);
        if (description?.links) {
            expect(description.links.base.href).toBe(`/api/${vingConfig.rest.version}/user`);
        }
        if (description?.options) {
            expect(description.options.useAsDisplayName).toBeTypeOf('object');
            expect(Object.keys(description.options).length).toBe(5);
        }
    });
    test("described by visitor", async () => {
        const description = await warden.describe({ include: { links: true, options: true, meta: true } });
        expect(description.meta?.displayName).toBe('warden');
        expect(description.props.username).toBe(undefined);
        expect(description.props.admin).toBe(undefined);
        if (description?.links) {
            expect(description.links.base.href).toBe(`/api/${vingConfig.rest.version}/user`);
        }
        expect(description.options).toEqual({});
        if (description?.options) {
            expect(Object.keys(description.options).length).toBe(0);
        }
    });
    test('set password', async () => {
        warden.setPassword('foo');
        expect(await warden.testPassword('foo')).toBe(true);
    });
    test('set password via posted params', async () => {
        await warden.setPostedProps({ password: 'food' }, warden);
        expect(await warden.testPassword('food')).toBe(true);
    });
    test('set useAsDisplayName via posted params', async () => {
        await warden.setPostedProps({ useAsDisplayName: 'email' }, warden);
        expect(warden.get('useAsDisplayName')).toBe('email');
    });
    const guard = await captain.copy();
    test("clone a record", () => {
        expect(guard.get('realName')).toBe('Byron Hadley');
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

    test("can use findAll", async () => {
        const allUsers = await Users.findAll(undefined, { limit: 3 });
        let i = 0;
        for await (const user of allUsers) {
            //console.log(i, user.get('id'));
            i++;
        }
        expect(i).toBe(3);
    });


    test("can delete ving record", async () => {
        await warden.delete()
        expect(warden.get('username')).toBe('warden');
        expect(await Users.count(eq(Users.table.email, 'warden@shawshank.jail'))).toBe(0);
        await captain.delete()
        await guard.delete()
    });

    const rita = Users.mint({});
    let params = { realName: 'Rita Hayworth', email: 'rita@hollywood.com' };
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
