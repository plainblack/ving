import { useKind } from '#ving/record/utils.mjs';
import { describeParams } from '#ving/utils/rest.mjs';
import { defineEventHandler } from 'h3';
export default defineEventHandler(async (event) => {
    const S3Files = await useKind('S3File');
    return S3Files.mint().propOptions(describeParams(event), true);
});