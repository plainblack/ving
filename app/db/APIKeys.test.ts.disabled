import { APIKeys } from './APIKeys';
import { Users } from './Users';
import { describe, test, expect } from "vitest";



await APIKeys.deleteMany({ where: { name: 'Test' } });
await Users.deleteMany({ where: { username: 'guardMert' } });

describe('APIKeys', async () => {

    test('foo', () => {
        expect('bar').toBe('bar')
    })
    const user = await Users.create({ username: 'guardMert', email: 'Mert@shawshank.jail', realName: 'Mert' });

    const apikey = APIKeys.mint({ name: 'Test', userId: user.id });

    test('privateKey generated', async () => {
        await apikey.insert();
        expect(apikey.get('privateKey')).toMatch(/^pk_/);
    })

    test('user can reference their keys', async () => {
        const userKey = await user.apiKeys.findFirst();
        expect(userKey.id).toBe(apikey.id);
    })

    test('records can mint without referenceing the relationship key', () => {
        const userKey2 = user.apiKeys.mint({ name: 'Test' } as any);
        expect(userKey2.get('userId')).toBe(user.id);
    })

    const keyUser = await apikey.user;
    test('key can reference its user', () => {
        expect(keyUser.id).toBe(user.id);
    })

    //console.log(JSON.stringify(await apikey.describe({ currentUser: user, include: { related: ['user'] } }), undefined, 2));
    test('key describe itself to owner', async () => {
        let description = await apikey.describe({ currentUser: user, include: { related: ['user'], links: true, options: true } });
        expect(description.props.privateKey).toBeDefined();
        expect(description.links).toBeDefined();
        if (description.links) {
            expect(description.links.user).toBeDefined();
        }
        expect(description.options).toBeDefined();
        expect(description.related).toBeDefined();
        if (description.related) {
            expect(description.related.user.props.username).toBe('guardMert');
        }
    });

    test('cascade: deleting user deletes keys', async () => {
        await user.delete();
        expect(await APIKeys.count({ where: { name: 'Test' } })).toBe(0);
    })

})
