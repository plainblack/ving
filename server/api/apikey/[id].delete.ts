import { useAPIKeys } from '../../vingrecord/records/APIKey';
import { vingSession, vingDescribe } from '../../helpers';
export default defineEventHandler(async (event) => {
    const APIKeys = useAPIKeys();
    const { id } = getRouterParams(event);
    const apikey = await APIKeys.findOrDie(id);
    apikey.canEdit(vingSession(event));
    await apikey.delete();
    return apikey.describe(vingDescribe(event));
});