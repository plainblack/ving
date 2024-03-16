import { useKind } from '#ving/record/utils.mjs';
import { getBody, describeParams, testRequired } from '#ving/utils/rest.mjs';
import { Session } from '#ving/session.mjs';
import { eq } from '#ving/drizzle/orm.mjs';
import { ouch } from '#ving/utils/ouch.mjs';
import { defineEventHandler, setCookie } from 'h3';


export default defineEventHandler(async (event) => {
    const body = await getBody(event);
    if (body.sessionType == 'native') {
        testRequired(['login', 'password'], body);
        const users = await useKind('User');
        let user = await users.findOne(eq(users.table.email, body.login));
        if (!user) {
            user = await users.findOne(eq(users.table.username, body.login));
            if (!user)
                throw ouch(404, 'User not found.')
        }
        await user.testPassword(body.password);
        const session = await Session.start(user, 'native');
        setCookie(event, 'vingSessionId', session.id, { maxAge: 60 * 60 * 24 * 365 * 5, httpOnly: true });
        return await session.describe(describeParams(event, session));
    }
    testRequired(['apiKey', 'apiSecret'], body);
    const apiKeys = await useKind('APIKey');
    let apiKey = await apiKeys.findOrDie(body.apiKey);
    await apiKey.testSecret(body.apiSecret);
    const session = await Session.start(await apiKey.parent('user'), 'apiKey', apiKey);
    setCookie(event, 'vingSessionId', session.id, { maxAge: 60 * 60 * 24 * 365 * 5, httpOnly: true });
    return await session.describe(describeParams(event, session));
})
