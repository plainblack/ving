import { useKind } from '#ving/record/utils.mjs';
import { describeParams, obtainSession, getBody } from '#ving/utils/rest.mjs';
import { defineEventHandler, getRouterParams } from 'h3';

export default defineEventHandler(async (event) => {
    const APIKeys = await useKind('APIKey');
    const { id } = getRouterParams(event);
    const apikey = await APIKeys.findOrDie(id);
    const session = obtainSession(event);
    apikey.canEdit(session);
    await apikey.updateAndVerify(await getBody(event), session);
    return apikey.describe(describeParams(event));
});