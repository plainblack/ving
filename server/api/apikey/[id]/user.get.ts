import { useAPIKeys } from '../../../vingrecord/records/APIKey.mjs';
import { describeParams } from '../../../utils/rest';
export default defineEventHandler(async (event) => {
    const APIKeys = useAPIKeys();
    const { id } = getRouterParams(event);
    const apikey = await APIKeys.findOrDie(id);
    const user = await apikey.user;
    return await user.describe(describeParams(event));
});