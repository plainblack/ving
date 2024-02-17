import { useS3Files } from '../../vingrecord/records/S3File.mjs';
import { obtainSession, describeParams } from '#ving/utils/rest.mjs';
import { defineEventHandler, getRouterParams } from 'h3';
export default defineEventHandler(async (event) => {
    const S3Files = useS3Files();
    const { id } = getRouterParams(event);
    const s3file = await S3Files.findOrDie(id);
    s3file.canEdit(obtainSession(event));
    await s3file.delete();
    return s3file.describe(describeParams(event));
});