import jwt from 'jsonwebtoken';
import { Users } from '~/utils/db';
import { testRequired } from '~/utils/utils';
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
            throw new Ouch(440, 'User not found.')
        }
    }
    await user.testPassword(body.password);
    const runtimeConfig = useRuntimeConfig()
    //return runtimeConfig;
    return jwt.sign({ id: user.props.id, username: user.props.username }, runtimeConfig.accessTokenSecret);
})
