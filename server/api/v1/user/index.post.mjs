import { useKind } from '#ving/record/utils.mjs';
import { describeParams, getBody } from '#ving/utils/rest.mjs';
import { defineEventHandler } from 'h3';

export default defineEventHandler(async (event) => {
    const users = await useKind('User');
    const body = await getBody(event);
    const user = await users.createAndVerify(body);
    return user.describe(describeParams(event));
});