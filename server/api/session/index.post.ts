import { Users } from '~/utils/db';
import { testRequired, ouch } from '~/utils/utils';
import { Session } from '~/utils/session';
export default defineEventHandler(async (event) => {
    const query = getQuery(event);
    const body = await readBody(event);
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
    return await session.describe({ currentUser: user, include: event.context.ving.include })
})