import { useUsers } from '../../vingrecord/records/User';
const Users = useUsers();
import { vingDescribe, vingSession, vingBody } from '../../helpers';
export default defineEventHandler(async (event) => {
    const { id } = getRouterParams(event);
    const user = await Users.findOrDie(id);
    user.canEdit(vingSession(event));
    await user.updateAndVerify(await vingBody(event), vingSession(event));
    return user.describe(vingDescribe(event));
});