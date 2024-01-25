import { useUsers } from '../../vingrecord/records/User.mjs';
import { describeParams, getBody } from '../../utils/rest';
export default defineEventHandler(async (event) => {
    const Users = useUsers();
    const user = await Users.createAndVerify(await getBody(event));
    return user.describe(describeParams(event));
});