import { useKind } from '#ving/record/VingRecord.mjs';
import { describeParams } from '#ving/utils/rest.mjs';
import { defineEventHandler, getRouterParams } from 'h3';
export default defineEventHandler(async (event) => {
    const users = await useKind('User');
    const { id } = getRouterParams(event);
    const user = await users.findOrDie(id);
    const avatar = await user.avatar();
    return await avatar.describe(describeParams(event));
});