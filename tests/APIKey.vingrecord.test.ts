import { APIKeys } from '../server/vingrecord/records/APIKey';
import { Users } from '../server/vingrecord/records/User';
import { describe, test, expect } from "vitest";
import { like, eq, asc, desc, and, inArray } from 'drizzle-orm/expressions';

await APIKeys.delete.where(eq(APIKeys.table.name, 'Test'));
await Users.delete.where(eq(Users.table.username, 'guardMert'));

describe('APIKey', async () => {

    const user = await Users.create({ username: 'guardMert', email: 'Mert@shawshank.jail', realName: 'Mert' });

    const apikey = APIKeys.mint({ name: 'Test', userId: user.get('id') });

    test('can set relation', async () => {
        expect(apikey.get('userId')).toEqual(user.get('id'));
    })

    test('privateKey generated', async () => {
        expect(apikey.get('privateKey')).toMatch(/^pk_/);
    })

    test('can save key', async () => {
        await apikey.insert();
        expect(apikey.isInserted).toBe(true);
    })


    test('user can reference their keys', async () => {
        //  const userKey = user.apikeys;
        //console.log(userKey);
        // expect(userKey?.get('id')).toBe(apikey.get('id'));
    })
    /*
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
    */
})
