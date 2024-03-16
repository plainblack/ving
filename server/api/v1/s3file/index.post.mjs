import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import ving from '#ving/index.mjs';
import { sanitizeFilename, makeS3FolderName, getExtension } from '#ving/record/records/S3File.mjs';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { getBody, obtainSessionIfRole, describeParams } from '#ving/utils/rest.mjs';
import { defineEventHandler } from 'h3';

export default defineEventHandler(async (event) => {
    const body = await getBody(event);
    const session = obtainSessionIfRole(event, 'verifiedEmail');
    const client = new S3Client({
        credentials: {
            accessKeyId: process.env.VING_AWS_UPLOADS_KEY,
            secretAccessKey: process.env.VING_AWS_UPLOADS_SECRET,
        },
        region: process.env.AWS_REGION,
    });
    const props = {
        userId: session.get('id'),
        filename: sanitizeFilename(body.filename),
        s3folder: makeS3FolderName(),
        extension: getExtension(body.filename),
        contentType: body.contentType,
        sizeInBytes: body.sizeInBytes,
    };
    const s3files = await ving.useKind('S3File');
    const s3file = await s3files.create(props);
    await ving.addJob('DeleteUnusedS3File', { id: s3file.get('id') }, { delay: 1000 * 60 * 60 });
    const putObjectParams = {
        Bucket: process.env.VING_AWS_UPLOADS_BUCKET,
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

