import { useAPIKeys } from '../../vingrecord/records/APIKey.mjs';
import { describeParams } from '../../utils/rest.mjs';
export default defineEventHandler(async (event) => {
    const APIKeys = useAPIKeys();
    const { id } = getRouterParams(event);
    const apikey = await APIKeys.findOrDie(id);
    return apikey.describe(describeParams(event));
});