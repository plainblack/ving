import Users from './Users';
import { describe, test, expect } from "vitest";
import { TProps } from "./Base";



await Users.deleteMany({ where: { username: { in: ['warden', 'captain', 'guard'] } } });
const warden = await Users.create({ username: 'warden', email: 'warden@shawshank.jail', realName: 'Samuel Norton' });
const captain = Users.mint({ username: 'captain', email: 'captain@shawshank.jail', realName: 'Byron Hadley' });
describe('Users', async () => {
    test("make user kind", () => {
        expect(Users).toHaveProperty('prisma');
        expect(Users).toHaveProperty('recordClass');
    })
    test("can create ving record", async () => {
        expect(warden).toHaveProperty('kind');
        expect(warden).toHaveProperty('props');
        expect(warden.props.email).toBe('warden@shawshank.jail');
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
        warden.props.admin = true;
        expect(warden.props.admin).toBe(true);
        await warden.update();
    });
    test("can refetch ving record", async () => {
        await warden.refetch();
        expect(warden.props.admin).toBe(true);
    });
    test("is owner by role", async () => {
        expect(captain.isOwner(warden)).toBe(true);
    });
    test("described by owner", async () => {
        const description = await warden.describe({ currentUser: warden, include: { links: true, options: true } });
        expect(description.props.displayName).toBe('warden');
        expect(description.props.username).toBe('warden');
        expect(description.props.admin).toBe(true);
        if (description.links !== undefined) {
            expect(description.links.base).toBe('/api/user');
        }
        if (description.options !== undefined) {
            expect(description.options.useAsDisplayName).toBeTypeOf('object');
        }
    });
    test("described by visitor", async () => {
        const description = await warden.describe({ include: { links: true, options: true } });
        expect(description.props.displayName).toBe('warden');
        expect(description.props.username).toBe(undefined);
        expect(description.props.admin).toBe(undefined);
        if (description.links !== undefined) {
            expect(description.links.base).toBe('/api/user');
        }
        expect(description.options).toEqual({});
    });
    test('set password', async () => {
        warden.setPassword('foo');
        expect(await warden.validatePassword('foo')).toBe(true);
    });
    test('set password via posted params', async () => {
        warden.verifyPostedParams({ password: 'food' });
        expect(await warden.validatePassword('food')).toBe(true);
    });
    const guard = captain.copy();
    test("clone a record", () => {
        guard.props.username = 'guard';
        guard.props.email = 'guard@shawshank.jail';
        guard.props.realName = 'Dekins';
        guard.insert();
        expect(guard.props.realName).toBe('Dekins');
        expect(guard.props.id).not.toBe(captain.props.id);
        expect(guard).toHaveProperty('isRole');
    });

    //  let key = captain.apiKeys.mint({ name: 'foo' } as any);
    // await key.insert();
    // console.log(JSON.stringify(await captain.describe({ currentUser: captain, include: { related: ['apiKeys'], extra: ['foo'] } }), undefined, 2));

    test("can delete ving record", async () => {
        await warden.delete()
        expect(warden.props.username).toBe('warden');
        expect(await Users.count({ where: { email: 'warden@shawshank.jail' } })).toBe(0);
        await captain.delete()
        await guard.delete()
    });

    const rita = Users.mint({});
    let params: TProps<'User'> = { realName: 'Rita Hayworth', email: 'rita@hollywood.com' };
    test('can verify creation params', () => {
        expect(() => rita.verifyCreationParams(params)).toThrowError();
        params.username = 'rita';
        expect(rita.verifyCreationParams(params)).toBe(true);
    });
    test('can verify posted params', () => {
        params.username = '';
        expect(() => rita.verifyCreationParams(params)).toThrowError();
        params.username = 'rita';
        expect(rita.verifyPostedParams(params)).toBe(true);
        expect(rita.props.username).toBe('rita');
    });
})
