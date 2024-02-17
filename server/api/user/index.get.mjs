import { useUsers } from '../../vingrecord/records/User.mjs';
import { describeListParams, obtainSessionIfRole, describeListWhere } from '#ving/utils/rest.mjs';
import { defineEventHandler } from 'h3';

export default defineEventHandler(async (event) => {
    // comment the line below out if you want to allow mere users to access the user list
    obtainSessionIfRole(event, 'admin');
    const Users = useUsers();
    return await Users.describeList(describeListParams(event), describeListWhere(event, Users.describeListFilter()));
})
