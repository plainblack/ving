import { useUsers } from '../../vingrecord/records/User';
const Users = useUsers();
import { vingDescribe } from '../../helpers';
export default defineEventHandler(async (event) => {
    const { id } = getRouterParams(event);
    const user = await Users.findOrDie(id);
    return user.describe(vingDescribe(event));
});