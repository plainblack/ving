import { useKind } from '#ving/record/utils.mjs';
import { describeParams, obtainSession, getBody } from '#ving/utils/rest.mjs';
import {defineEventHandler, getRouterParams} from 'h3';
export default defineEventHandler(async (event) => {
    const cronjobs = await useKind('CronJob');
    const { id } = getRouterParams(event);
    const cronjob = await cronjobs.findOrDie(id);
    const session = obtainSession(event);
    await cronjob.canEdit(session);
    await cronjob.updateAndVerify(await getBody(event), session);
    return cronjob.describe(describeParams(event, session));
});