import { useUsers } from '../../vingrecord/records/User.mjs';
import { describeParams, getBody } from '../../utils/rest.mjs';
import { defineEventHandler } from 'h3';

export default defineEventHandler(async (event) => {
    const Users = useUsers();
    const body = await getBody(event);
    const user = await Users.createAndVerify(body);
    return user.describe(describeParams(event));
});