import { useAPIKeys } from '../../vingrecord/records/APIKey';
import { obtainSession, describeParams } from '../../utils/rest';
export default defineEventHandler(async (event) => {
    const APIKeys = useAPIKeys();
    const { id } = getRouterParams(event);
    const apikey = await APIKeys.findOrDie(id);
    apikey.canEdit(obtainSession(event));
    await apikey.delete();
    return apikey.describe(describeParams(event));
});