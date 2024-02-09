import { useS3Files } from '../../vingrecord/records/S3File.mjs';
import { describeParams } from '../../utils/rest.mjs';
import {defineEventHandler} from 'h3';
export default defineEventHandler(async (event) => {
    const S3Files = useS3Files();
    return S3Files.mint().propOptions(describeParams(event), true);
});