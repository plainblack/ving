import { useUsers } from '../../vingrecord/records/User.mjs';
const Users = useUsers();
import { getBody, describeParams } from '../../utils/rest.mjs';
import { Session } from '../../session.mjs';
import { eq } from 'drizzle-orm/mysql-core/expressions.js';
import { ouch } from './../../utils/ouch.mjs';
import { testRequired } from '../../utils/rest.mjs';
import { defineEventHandler } from 'h3';


export default defineEventHandler(async (event) => {
    const body = await getBody(event)
    testRequired(['login', 'password'], body);
    let user = await Users.findOne(eq(Users.table.email, body.login));
    if (!user) {
        user = await Users.findOne(eq(Users.table.username, body.login));
        if (!user)
            throw ouch(404, 'User not found.')
    }
    await user.testPassword(body.password);
    const session = await Session.start(user);
    setCookie(event, 'vingSessionId', session.id, { maxAge: 60 * 24 * 365 * 5, httpOnly: true });
    return await session.describe(describeParams(event));
})
