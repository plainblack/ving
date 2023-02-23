import { Users } from '~/utils/db';
import { testRequired, ouch } from '~/utils/utils';
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
    return await user.testPassword(body.password);
})
