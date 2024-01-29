import { useUsers } from '../../vingrecord/records/User.mjs';
import { describeParams, getBody } from '../../utils/rest.mjs';
import { defineEventHandler } from 'h3';

export default defineEventHandler(async (event) => {
    const Users = useUsers();
    const user = await Users.createAndVerify(await getBody(event));
    return user.describe(describeParams(event));
});