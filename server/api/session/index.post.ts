import { User } from '../../../typeorm/entity/User';
import { testRequired, ouch, vingBody, vingDescribe } from '../../helpers';
import { Session } from '../../../app/session';
export default defineEventHandler(async (event) => {
    const body = await vingBody(event)
    testRequired(['login', 'password'], body);
    let user;
    try {
        user = await User.findOneOrFail({ where: { email: body.login } });
    }
    catch {
        try {
            user = await User.findOneOrFail({ where: { username: body.login } });
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
