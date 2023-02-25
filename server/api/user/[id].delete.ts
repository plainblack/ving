import { Users } from '~~/app/db';
import { vingSession, vingDescribe } from '~~/app/helpers';
export default defineEventHandler(async (event) => {
    const { id } = getRouterParams(event);
    const user = await Users.find(id);
    user.canEdit(vingSession(event));
    await user.delete();
    return user.describe(vingDescribe(event));
});