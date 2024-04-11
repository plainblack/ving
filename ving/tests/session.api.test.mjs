import axios from 'axios';
import { useKind } from '#ving/record/utils.mjs';
import { describe, test, expect, afterAll } from "vitest";
import { like, eq, asc, desc, and } from '#ving/drizzle/orm.mjs';
import { getConfig } from '#ving/config.mjs';

const Users = await useKind('User');
const vingConfig = await getConfig();
const base = `http://localhost:3000/api/${vingConfig.rest.version}/`;

describe('Session API', async () => {
    await Users.delete.where(eq(Users.table.username, 'rita'));
    const user = (await axios.post(
        base + 'user?includeMeta=true',
        { username: 'rita', realName: 'Rita Hayworth', email: 'rita@shawshank.jail', password: 'poster' },
    )).data;

    test('create user', () => {
        expect(user.meta.displayName).toBe('rita');
    });

    const session = (await axios.post(
        base + 'session',
        { login: 'rita', password: 'poster', sessionType: 'native' }
    )).data;

    test('login', () => {
        expect(session.props.userId).toBe(user.props.id);
    });

    test('get session', async () => {
        const result = (await axios.get(
            `${base}session/${session.props.id}?includeRelated=user`,
            { headers: { Cookie: `vingSessionId=${session.props.id}` } }
        )).data;
        expect(result.related.user.props.username).toBe('rita');

    });

    test('logout', async () => {
        const result = (await axios.delete(
            `${base}session`,
            { headers: { Cookie: `vingSessionId=${session.props.id}` } }
        )).data;
        expect(result.props.id).toBe(session.props.id);
    });

    afterAll(async () => {
        await Users.delete.where(eq(Users.table.username, 'rita'));
    })
});
