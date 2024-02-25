import { useKind } from '#ving/record/utils.mjs';
import { describeListParams, describeListWhere } from '#ving/utils/rest.mjs';
import { defineEventHandler } from 'h3';
export default defineEventHandler(async (event) => {
    const S3Files = await useKind('S3File');
    return await S3Files.describeList(describeListParams(event), describeListWhere(event, S3Files.describeListFilter()));
});