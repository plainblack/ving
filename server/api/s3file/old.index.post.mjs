import { useS3Files } from '../../vingrecord/records/S3File.mjs';
import { describeParams, getBody, obtainSession } from '../../utils/rest.mjs';
import {defineEventHandler} from 'h3';
export default defineEventHandler(async (event) => {
    const S3Files = useS3Files();
    const s3file = await S3Files.createAndVerify(await getBody(event), obtainSession(event));
    return s3file.describe(describeParams(event));
});