import { ofetch } from "ofetch";
import { useKind } from '#ving/record/utils.mjs';
import { describe, test, expect, afterAll } from "vitest";
import { like, eq, asc, desc, and } from '#ving/drizzle/orm.mjs';
import { getConfig } from '#ving/config.mjs';

const Users = await useKind('User');
const vingConfig = await getConfig();
const base = `http://localhost:3000/api/${vingConfig.rest.version}/`;

describe('Session API', async () => {
    await Users.delete.where(eq(Users.table.username, 'rita'));
    const user = (await ofetch(
        base + 'user?includeMeta=true',
        {
            method: "POST",
            body: { username: 'rita', realName: 'Rita Hayworth', email: 'rita@shawshank.jail', password: 'poster' },
        }
    ));

    test('create user', () => {
        expect(user.meta.displayName).toBe('rita');
    });

    const session = (await ofetch(
        base + 'session',
        {
            method: "POST",
            body: { login: 'rita', password: 'poster', sessionType: 'native' },
        }
    ));

    test('login', () => {
        expect(session.props.userId).toBe(user.props.id);
    });

    test('get session', async () => {
        const result = (await ofetch(
            `${base}session/${session.props.id}?includeRelated=user`,
            { headers: { Cookie: `vingSessionId=${session.props.id}` } }
        ));
        expect(result.related.user.props.username).toBe('rita');

    });

    test('logout', async () => {
        const result = (await ofetch(
            `${base}session`,
            { method: 'DELETE', headers: { Cookie: `vingSessionId=${session.props.id}` } }
        ));
        expect(result.props.id).toBe(session.props.id);
    });

    afterAll(async () => {
        await Users.delete.where(eq(Users.table.username, 'rita'));
    })
});
