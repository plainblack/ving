import { Users } from '~/utils/db';
import { testRequired, ouch, vingBody, vingDescribe } from '~~/utils/helpers';
import { Session } from '~/utils/session';
export default defineEventHandler(async (event) => {
    const body = await vingBody(event)
    testRequired(['login', 'password'], body);
    let user;
    try {
        user = await Users.findUnique({ where: { email: body.login } });
    }
    catch {
        try {
            user = await Users.findUnique({ where: { username: body.login } });
        }
        catch {
            throw ouch(404, 'User not found.')
        }
    }
    await user.testPassword(body.password);
    const session = await Session.start(user);
    setCookie(event, 'vingSessionId', session.id, { maxAge: 60 * 24 * 365 * 5, httpOnly: true });
    return await session.describe(vingDescribe(event));
})
