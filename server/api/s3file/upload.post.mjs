import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { getBody } from '../../utils/rest.mjs';
import { defineEventHandler } from 'h3';
import * as dotenv from 'dotenv';
import { v4 } from 'uuid';
import sanitize from 'sanitize-filename';
dotenv.config();

export default defineEventHandler(async (event) => {
    const body = await getBody(event);

    const client = new S3Client({
        credentials: {
            accessKeyId: process.env.AWS_TEMP_UPLOAD_KEY,
            secretAccessKey: process.env.AWS_TEMP_UPLOAD_SECRET,
        },
        region: process.env.AWS_REGION,
    });
    const key = v4().replace(/-/g, '/').replace(/^(.{4})(.+)$/, '$1/$2') + '/' + sanitize(body.filename);
    const putObjectParams = {
        "Bucket": process.env.AWS_TEMP_BUCKET,
        "Key": key,
        "ContentType": body.contentType,
    };
    console.log(putObjectParams);
    const command = new PutObjectCommand(putObjectParams);
    const url = await getSignedUrl(client, command, { expiresIn: 60 * 60 });
    return url
});

