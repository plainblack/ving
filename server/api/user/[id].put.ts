import { Users } from '~/utils/db';
import { vingDescribe, vingSession } from '~~/utils/helpers';
export default defineEventHandler(async (event) => {
    const { id } = getRouterParams(event);
    const body = await readBody(event);
    const user = await Users.find(id);
    await user.updateAndVerify(body, vingSession(event));
    return user.describe(vingDescribe(event));
});