import { useUsers } from '../../../vingrecord/records/User';
import { describeListParams } from '../../../utils/rest';
export default defineEventHandler(async (event) => {
    const Users = useUsers();
    const { id } = getRouterParams(event);
    const user = await Users.findOrDie(id);
    return await user.apikeys.describeList(describeListParams(event));
});