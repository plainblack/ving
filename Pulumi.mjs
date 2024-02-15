import { createUploads } from './pulumi/uploads.mjs';
import { createThumbnails } from './pulumi/thumbnails.mjs';
import { createLambdaProcessUploads } from './pulumi/lambda-process-uploads.mjs';
import { updateEnv } from './pulumi/env.mjs';

const { uploadsBucket, uploadsAccessKey } = createUploads();
const thumbnailsBucket = createThumbnails();
const processUploadsFunctionUrl = createLambdaProcessUploads(thumbnailsBucket);
updateEnv({
    uploadsBucket,
    uploadsAccessKey,
    thumbnailsBucket,
    processUploadsFunctionUrl,
});