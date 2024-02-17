import { useAPIKeys } from '#ving/record/records/APIKey.mjs';
import { describeParams } from '#ving/utils/rest.mjs';
import { defineEventHandler, getRouterParams } from 'h3';

export default defineEventHandler(async (event) => {
    const APIKeys = useAPIKeys();
    const { id } = getRouterParams(event);
    const apikey = await APIKeys.findOrDie(id);
    const user = await apikey.user;
    return await user.describe(describeParams(event));
});