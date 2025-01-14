import { ofetch } from "ofetch";
import { useKind } from '#ving/record/utils.mjs';
import { describe, test, expect, afterAll } from "vitest";
import { like, eq, asc, desc, and } from '#ving/drizzle/orm.mjs';
import { getConfig } from '#ving/config.mjs';

const Users = await useKind('User');
const vingConfig = await getConfig();
const base = `http://localhost:3000/api/${vingConfig.rest.version}/`;

describe('User API', async () => {
    await Users.delete.where(eq(Users.table.username, 'brooks'));
    const user = (await ofetch(
        base + 'users?includeMeta=true',
        {
            method: "POST",
            body: {
                "username": "brooks",
                "realName": "Brooks Hatlen",
                "email": "brooks@shawshank.jail",
                "password": "Rock Hammer"
            }
        }
    ));

    test('create user', () => {
        expect(user.meta.displayName).toBe('brooks');
    });

    const session = (await ofetch(
        base + 'session',
        { method: 'post', body: { login: 'brooks', password: 'Rock Hammer', sessionType: 'native' } }
    ));

    test('login', () => {
        expect(session.props.userId).toBe(user.props.id);
    });

    test('get user', async () => {
        const result = (await ofetch(
            `${base}users/${user.props.id}?includeLinks=true&includeMeta=true&includeOptions=true`,
            { headers: { Cookie: `vingSessionId=${session.props.id}` } }
        ));
        expect(result.props.username).toBe('brooks');
        expect(result.links.base.href).toBe(`/api/${vingConfig.rest.version}/user`);
        expect(result.meta.displayName).toBe('brooks');
    });

    test('get options', async () => {
        const result = (await ofetch(
            `${base}users/options`,
            { headers: { Cookie: `vingSessionId=${session.props.id}` } }
        ));
        expect(result.useAsDisplayName.length).toBe(3);
    });

    test('put user', async () => {
        const result = (await ofetch(
            `${base}users/${user.props.id}?includeMeta=true`,
            {
                method: 'put',
                body: { useAsDisplayName: 'email' },
                headers: { Cookie: `vingSessionId=${session.props.id}` }
            }
        ));
        expect(result.meta.displayName).toBe('brooks@shawshank.jail');
    });

    test('delete user', async () => {
        const result = (await ofetch(
            `${base}users/${user.props.id}?includeMeta=true`,
            { method: 'delete', headers: { Cookie: `vingSessionId=${session.props.id}` } }
        ));
        expect(result.meta.deleted).toBe(true);
    });

    afterAll(async () => {
        await Users.delete.where(eq(Users.table.username, 'brooks'));
    })
});
