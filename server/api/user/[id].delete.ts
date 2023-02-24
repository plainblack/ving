import { Users } from '~/utils/db';
import { vingSession, vingDescribe } from '~~/utils/helpers';
export default defineEventHandler(async (event) => {
    const { id } = getRouterParams(event);
    const user = await Users.find(id);
    user.canEdit(vingSession(event));
    await user.delete();
    return user.describe(vingDescribe(event));
});