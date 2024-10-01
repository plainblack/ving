import { useKind } from '#ving/record/utils.mjs';
import { describeListParams, obtainSessionIfRole, describeListWhere } from '#ving/utils/rest.mjs';
import { defineEventHandler } from 'h3';

export default defineEventHandler(async (event) => {
    // comment the line below out if you want to allow mere users to access the user list
    const session = obtainSessionIfRole(event, 'admin');
    const users = await useKind('User');
    return await users.describeList(describeListParams(event, session), describeListWhere(event, users.describeListFilter()));
})
