import { useKind } from '#ving/record/utils.mjs';
import { obtainSession, describeParams } from '#ving/utils/rest.mjs';
import { defineEventHandler, getRouterParams } from 'h3';

export default defineEventHandler(async (event) => {
    const APIKeys = await useKind('APIKey');
    const { id } = getRouterParams(event);
    const apikey = await APIKeys.findOrDie(id);
    apikey.canEdit(obtainSession(event));
    await apikey.delete();
    return apikey.describe(describeParams(event));
});