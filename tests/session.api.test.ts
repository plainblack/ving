import axios from 'axios';
import { useUsers } from '../server/vingrecord/records/User';
import { describe, test, expect, afterAll } from "vitest";
import { like, eq, asc, desc, and } from 'drizzle-orm/expressions.js';

const Users = useUsers();
const base = 'http://localhost:3000/api/';

describe('Session API', async () => {
    await Users.delete.where(eq(Users.table.username, 'brooks'));
    const user = (await axios.post(
        base + 'user?includeMeta=true',
        { username: 'brooks', realName: 'Brooks Hatlen', email: 'brooks@shawshank.jail', password: 'rockhammer' },
    )).data;

    test('create user', () => {
        expect(user.meta.displayName).toBe('brooks');
    });

    const session = (await axios.post(
        base + 'session',
        { login: 'brooks', password: 'rockhammer' }
    )).data;

    test('login', () => {
        expect(session.props.userId).toBe(user.props.id);
    });

    test('get session', async () => {
        const result = (await axios.get(
            `${base}session/${session.props.id}?includeRelated=user`,
            { headers: { Cookie: `vingSessionId=${session.props.id}` } }
        )).data;
        expect(result.related.user.props.username).toBe('brooks');

    });

    test('logout', async () => {
        const result = (await axios.delete(
            `${base}session`,
            { headers: { Cookie: `vingSessionId=${session.props.id}` } }
        )).data;
        expect(result.props.id).toBe(session.props.id);
    });

    afterAll(async () => {
        await Users.delete.where(eq(Users.table.username, 'brooks'));
    })
});
