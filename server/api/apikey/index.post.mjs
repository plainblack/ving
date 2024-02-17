import { useAPIKeys } from '#ving/record/records/APIKey.mjs';
import { describeParams, getBody, obtainSessionIfRole } from '#ving/utils/rest.mjs';
import { defineEventHandler } from 'h3';

export default defineEventHandler(async (event) => {
    const session = obtainSessionIfRole(event, 'verifiedEmail');
    const APIKeys = useAPIKeys();
    const apikey = await APIKeys.createAndVerify(await getBody(event), session);
    return apikey.describe(describeParams(event, session));
});