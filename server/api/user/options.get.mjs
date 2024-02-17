import { useUsers } from '../../vingrecord/records/User.mjs';
const Users = useUsers();
import { describeParams } from '#ving/utils/rest.mjs';
import { defineEventHandler } from 'h3';

export default defineEventHandler(async (event) => {
    return Users.mint().propOptions(describeParams(event), true);
})
