import { useKind } from '#ving/record/VingRecord.mjs';
import { describeParams } from '#ving/utils/rest.mjs';
import { defineEventHandler, getRouterParams } from 'h3';
export default defineEventHandler(async (event) => {
    const S3Files = await useKind('S3File');
    const { id } = getRouterParams(event);
    const s3file = await S3Files.findOrDie(id);
    const user = await s3file.parent('user');
    return await user.describe(describeParams(event));
});