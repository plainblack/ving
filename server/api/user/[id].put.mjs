import { useUsers } from '../../vingrecord/records/User.mjs';
const Users = useUsers();
import { describeParams, obtainSession, getBody } from '../../utils/rest.mjs';
import { defineEventHandler } from 'h3';

export default defineEventHandler(async (event) => {
    const { id } = getRouterParams(event);
    const user = await Users.findOrDie(id);
    const session = obtainSession(event);
    user.canEdit(session);
    await user.updateAndVerify(await getBody(event), session);
    return user.describe(describeParams(event));
});