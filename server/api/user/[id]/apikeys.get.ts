import { useUsers } from '../../../vingrecord/records/User';
import { vingDescribeList } from '../../../helpers';
export default defineEventHandler(async (event) => {
    const Users = useUsers();
    const { id } = getRouterParams(event);
    const user = await Users.findOrDie(id);
    return await user.apikeys.describeList(vingDescribeList(event));
});