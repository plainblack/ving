import { Users } from '../../vingrecord/records/User';
import { vingSession, vingDescribe } from '../../helpers';
export default defineEventHandler(async (event) => {
    const { id } = getRouterParams(event);
    const user = await Users.findOrDie(id);
    user.canEdit(vingSession(event));
    await user.delete();
    return user.describe(vingDescribe(event));
});