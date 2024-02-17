import { useS3Files } from '#ving/record/records/S3File.mjs';
import { describeParams, obtainSession, getBody } from '#ving/utils/rest.mjs';
import { defineEventHandler, getRouterParams } from 'h3';
export default defineEventHandler(async (event) => {
    const S3Files = useS3Files();
    const { id } = getRouterParams(event);
    const s3file = await S3Files.findOrDie(id);
    const session = obtainSession(event);
    s3file.canEdit(session);
    await s3file.updateAndVerify(await getBody(event), session);
    return s3file.describe(describeParams(event));
});