import { useUsers } from '../../vingrecord/records/User';
const Users = useUsers();

import { obtainSession, describeParams } from '../../utils/rest';
export default defineEventHandler(async (event) => {
    const { id } = getRouterParams(event);
    const user = await Users.findOrDie(id);
    user.canEdit(obtainSession(event));
    await user.delete();
    return user.describe(describeParams(event));
});