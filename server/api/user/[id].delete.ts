import { useUsers } from '../../vingrecord/records/User.mjs';
import { obtainSession, describeParams } from '../../utils/rest';
export default defineEventHandler(async (event) => {
    const Users = useUsers();
    const { id } = getRouterParams(event);
    const user = await Users.findOrDie(id);
    user.canEdit(obtainSession(event));
    await user.delete();
    return user.describe(describeParams(event));
});