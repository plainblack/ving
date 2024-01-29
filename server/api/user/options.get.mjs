import { useUsers } from '../../vingrecord/records/User.mjs';
const Users = useUsers();
import { describeParams } from '../../utils/rest.mjs';
export default defineEventHandler(async (event) => {
    return Users.mint().propOptions(describeParams(event), true);
})
