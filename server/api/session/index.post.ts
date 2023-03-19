import { Users } from '../../vingrecord/records/User';
import { testRequired, ouch, vingBody, vingDescribe } from '../../helpers';
import { Session } from '../../session';
import { eq } from 'drizzle-orm/mysql-core/expressions';

export default defineEventHandler(async (event) => {
    const body = await vingBody(event)
    testRequired(['login', 'password'], body);
    let user = await Users.findOne(() => eq(Users.table.email, body.login));
    if (!user) {
        user = await Users.findOne(() => eq(Users.table.username, body.login));
        if (!user)
            throw ouch(404, 'User not found.')
    }
    console.log(user)
    await user.testPassword(body.password);
    const session = await Session.start(user);
    setCookie(event, 'vingSessionId', session.id, { maxAge: 60 * 24 * 365 * 5, httpOnly: true });
    return await session.describe(vingDescribe(event));
})
