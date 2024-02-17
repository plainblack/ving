import { useKind } from '#ving/record/VingRecord.mjs';
import { getBody, describeParams, testRequired } from '#ving/utils/rest.mjs';
import { Session } from '#ving/session.mjs';
import { eq } from '#ving/drizzle/orm.mjs';
import { ouch } from '#ving/utils/ouch.mjs';
import { defineEventHandler, setCookie } from 'h3';


export default defineEventHandler(async (event) => {
    const body = await getBody(event)
    testRequired(['login', 'password'], body);
    const users = await useKind('User');
    let user = await users.findOne(eq(users.table.email, body.login));
    if (!user) {
        user = await users.findOne(eq(users.table.username, body.login));
        if (!user)
            throw ouch(404, 'User not found.')
    }
    await user.testPassword(body.password);
    const session = await Session.start(user);
    setCookie(event, 'vingSessionId', session.id, { maxAge: 60 * 24 * 365 * 5, httpOnly: true });
    return await session.describe(describeParams(event, session));
})
