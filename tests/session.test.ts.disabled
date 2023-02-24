import { describe, test, expect } from "vitest";
import { Users, Describe } from '../utils/db';
import { setup, $fetch } from '@nuxt/test-utils'

import axios from 'axios';

const base = 'http://localhost:3000/api/';

describe('Session API', async () => {
    /*  await setup({
          // test context options
      })*/
    await Users.deleteMany({ where: { username: { in: ['brooks'] } } });

    test('foo', () => {
        expect(true).toBe(true)
    })
    const user = (await axios.post(
        base + 'user',
        { username: 'brooks', realName: 'Brooks Hatlen', email: 'brooks@shawshank.jail', password: 'rockhammer' }
    )).data;

    test('create user', () => {
        expect(user.props.displayName).toBe('brooks');
    });


    const session = (await axios.post(
        base + 'session',
        { login: 'brooks', password: 'rockhammer' }
    )).data;

    test('login', () => {
        expect(session.props.userId).toBe(user.props.id);
    });


});
