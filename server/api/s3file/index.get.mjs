import { useS3Files } from '#ving/record/records/S3File.mjs';
import { describeListParams, describeListWhere } from '#ving/utils/rest.mjs';
import { defineEventHandler } from 'h3';
export default defineEventHandler(async (event) => {
    const S3Files = useS3Files();
    return await S3Files.describeList(describeListParams(event), describeListWhere(event, S3Files.describeListFilter()));
});