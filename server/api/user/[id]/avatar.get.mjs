import { useUsers } from '../../../vingrecord/records/User.mjs';
import { describeParams } from '../../../utils/rest.mjs';
import {defineEventHandler, getRouterParams} from 'h3';
export default defineEventHandler(async (event) => {
    const Users = useUsers();
    const { id } = getRouterParams(event);
    const user = await Users.findOrDie(id);
    const avatar = await user.avatar;
    return await avatar.describe(describeParams(event));
});