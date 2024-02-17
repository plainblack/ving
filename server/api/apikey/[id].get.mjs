import { useAPIKeys } from '../../vingrecord/records/APIKey.mjs';
import { describeParams } from '#ving/utils/rest.mjs';
import { defineEventHandler, getRouterParams } from 'h3';

export default defineEventHandler(async (event) => {
    const APIKeys = useAPIKeys();
    const { id } = getRouterParams(event);
    const apikey = await APIKeys.findOrDie(id);
    return apikey.describe(describeParams(event));
});