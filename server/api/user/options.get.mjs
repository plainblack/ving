import { useUsers } from '#ving/record/records/User.mjs';
import { describeParams } from '#ving/utils/rest.mjs';
import { defineEventHandler } from 'h3';

export default defineEventHandler(async (event) => {
    const Users = useUsers();
    return Users.mint().propOptions(describeParams(event), true);
})
