import { useAPIKeys } from '../../vingrecord/records/APIKey.mjs';
import { obtainSession, describeParams } from '../../utils/rest.mjs';
import { defineEventHandler } from 'h3';

export default defineEventHandler(async (event) => {
    const APIKeys = useAPIKeys();
    const { id } = getRouterParams(event);
    const apikey = await APIKeys.findOrDie(id);
    apikey.canEdit(obtainSession(event));
    await apikey.delete();
    return apikey.describe(describeParams(event));
});