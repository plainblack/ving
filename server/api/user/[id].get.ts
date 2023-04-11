import { useUsers } from '../../vingrecord/records/User';
const Users = useUsers();
import { describeParams } from '../../utils/rest';
export default defineEventHandler(async (event) => {
    const { id } = getRouterParams(event);
    const user = await Users.findOrDie(id);
    return user.describe(describeParams(event));
});