import { useAPIKeys } from '../../vingrecord/records/APIKey.mjs';
import { describeParams, getBody, obtainSession } from '../../utils/rest.mjs';
export default defineEventHandler(async (event) => {
    const APIKeys = useAPIKeys();
    const apikey = await APIKeys.createAndVerify(await getBody(event), obtainSession(event));
    return apikey.describe(describeParams(event));
});