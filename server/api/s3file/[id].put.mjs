import { useKind } from '#ving/record/utils.mjs';
import { describeParams, obtainSession, getBody } from '#ving/utils/rest.mjs';
import { defineEventHandler, getRouterParams } from 'h3';
export default defineEventHandler(async (event) => {
    const S3Files = await useKind('S3File');
    const { id } = getRouterParams(event);
    const s3file = await S3Files.findOrDie(id);
    const session = obtainSession(event);
    s3file.canEdit(session);
    await s3file.updateAndVerify(await getBody(event), session);
    return s3file.describe(describeParams(event));
});