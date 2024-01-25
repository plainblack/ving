import axios from 'axios';
import { useUsers } from '../server/vingrecord/records/User';
import { describe, test, expect, afterAll } from "vitest";
import { like, eq, asc, desc, and } from '../server/drizzle/orm.mjs';

const Users = useUsers();
const base = 'http://localhost:3000/api/';

describe('User API', async () => {
    await Users.delete.where(eq(Users.table.username, 'brooks'));
    const user = (await axios.post(
        base + 'user?includeMeta=true',
        {
            "username": "brooks",
            "realName": "Brooks Hatlen",
            "email": "brooks@shawshank.jail",
            "password": "Rock Hammer"
        }
    )).data;

    test('create user', () => {
        expect(user.meta.displayName).toBe('brooks');
    });

    const session = (await axios.post(
        base + 'session',
        { login: 'brooks', password: 'Rock Hammer' }
    )).data;

    test('login', () => {
        expect(session.props.userId).toBe(user.props.id);
    });

    test('get user', async () => {
        const result = (await axios.get(
            `${base}user/${user.props.id}?includeLinks=true&includeMeta=true&includeOptions=true`,
            { headers: { Cookie: `vingSessionId=${session.props.id}` } }
        )).data;
        expect(result.props.username).toBe('brooks');
        expect(result.links.base).toBe('/api/user');
        expect(result.meta.displayName).toBe('brooks');
    });

    test('get options', async () => {
        const result = (await axios.get(
            `${base}user/options`,
            { headers: { Cookie: `vingSessionId=${session.props.id}` } }
        )).data;
        expect(result.useAsDisplayName.length).toBe(3);
    });

    test('put user', async () => {
        const result = (await axios.put(
            `${base}user/${user.props.id}?includeMeta=true`,
            { useAsDisplayName: 'email' },
            { headers: { Cookie: `vingSessionId=${session.props.id}` } }
        )).data;
        expect(result.meta.displayName).toBe('brooks@shawshank.jail');
    });

    test('delete user', async () => {
        const result = (await axios.delete(
            `${base}user/${user.props.id}?includeMeta=true`,
            { headers: { Cookie: `vingSessionId=${session.props.id}` } }
        )).data;
        expect(result.meta.deleted).toBe(true);
    });

    afterAll(async () => {
        await Users.delete.where(eq(Users.table.username, 'brooks'));
    })
});
