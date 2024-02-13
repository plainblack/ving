import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { useS3Files, sanitizeFilename, makeS3FolderName } from '../../vingrecord/records/S3File.mjs';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { getBody, obtainSessionIfRole, describeParams } from '../../utils/rest.mjs';
import { defineEventHandler } from 'h3';
import * as dotenv from 'dotenv';
dotenv.config();

export default defineEventHandler(async (event) => {
    const body = await getBody(event);
    const session = obtainSessionIfRole(event, 'verifiedEmail');
    const client = new S3Client({
        credentials: {
            accessKeyId: process.env.AWS_UPLOADS_KEY,
            secretAccessKey: process.env.AWS_UPLOADS_SECRET,
        },
        region: process.env.AWS_REGION,
    });
    const props = {
        userId: session.get('id'),
        filename: sanitizeFilename(body.filename),
        s3folder: makeS3FolderName(),
        contentType: body.contentType,
        sizeInBytes: body.sizeInBytes,
    };
    const s3files = useS3Files();
    const s3file = await s3files.create(props);
    // would be nice to add an event here that would check in on this file after 60 minutes and see if it has been assigned to anything, otherwise we'll have to do it with polling
    const putObjectParams = {
        Bucket: process.env.AWS_UPLOADS_BUCKET,
        Key: props.s3folder + '/' + props.filename,
        ContentType: props.contentType,
    };
    const command = new PutObjectCommand(putObjectParams);
    const out = await s3file.describe(describeParams(event, session));
    if (!out.meta)
        out.meta = {};
    out.meta.presignedUrl = await getSignedUrl(client, command, { expiresIn: 60 * 60 });
    return out;
});

