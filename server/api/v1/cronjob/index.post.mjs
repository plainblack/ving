import { useKind } from '#ving/record/utils.mjs';
import { describeParams, getBody, obtainSessionIfRole } from '#ving/utils/rest.mjs';
import {defineEventHandler} from 'h3';
export default defineEventHandler(async (event) => {
    const cronjobs = await useKind('CronJob');
    const session = obtainSessionIfRole(event, 'verifiedEmail');
    const cronjob = await cronjobs.createAndVerify(await getBody(event), session);
    return cronjob.describe(describeParams(event, session));
});