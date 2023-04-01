import { useAPIKeys } from '../../vingrecord/records/APIKey';
import { vingDescribe, vingSession, vingBody } from '../../helpers';
export default defineEventHandler(async (event) => {
    const APIKeys = useAPIKeys();
    const { id } = getRouterParams(event);
    const apikey = await APIKeys.findOrDie(id);
    apikey.canEdit(vingSession(event));
    await apikey.updateAndVerify(await vingBody(event), vingSession(event));
    return apikey.describe(vingDescribe(event));
});