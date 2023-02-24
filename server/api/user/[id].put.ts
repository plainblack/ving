import { Users } from '~/utils/db';
import { vingDescribe, vingSession, vingBody } from '~~/utils/helpers';
export default defineEventHandler(async (event) => {
    const { id } = getRouterParams(event);
    const user = await Users.find(id);
    await user.updateAndVerify(await vingBody(event), vingSession(event));
    return user.describe(vingDescribe(event));
});