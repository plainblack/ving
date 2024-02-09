import { useS3Files } from '../../vingrecord/records/S3File.mjs';
import { describeParams } from '../../utils/rest.mjs';
import {defineEventHandler, getRouterParams} from 'h3';
export default defineEventHandler(async (event) => {
    const S3Files = useS3Files();
    const { id } = getRouterParams(event);
    const s3file = await S3Files.findOrDie(id);
    return s3file.describe(describeParams(event));
});