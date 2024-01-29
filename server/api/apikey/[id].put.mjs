import { useAPIKeys } from '../../vingrecord/records/APIKey.mjs';
import { describeParams, obtainSession, getBody } from '../../utils/rest.mjs';
export default defineEventHandler(async (event) => {
    const APIKeys = useAPIKeys();
    const { id } = getRouterParams(event);
    const apikey = await APIKeys.findOrDie(id);
    const session = obtainSession(event);
    apikey.canEdit(session);
    await apikey.updateAndVerify(await getBody(event), session);
    return apikey.describe(describeParams(event));
});