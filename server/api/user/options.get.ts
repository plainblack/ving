import { useUsers } from '../../vingrecord/records/User';
const Users = useUsers();
import { vingDescribe } from '../../helpers';
export default defineEventHandler(async (event) => {
    return Users.mint().propOptions(vingDescribe(event), true);
})
