import { createUploads } from './pulumi/uploads.mjs';
import { createVpc } from './pulumi/vpc.mjs';
import { createThumbnails } from './pulumi/thumbnails.mjs';
import { createLambdaProcessUploads } from './pulumi/lambda-process-uploads.mjs';
import { updateEnv } from './pulumi/env.mjs';
import * as pulumi from "@pulumi/pulumi";

const stack = pulumi.getStack();
const { uploadsBucket, uploadsAccessKey } = createUploads();
const thumbnailsBucket = createThumbnails();
const processUploadsFunctionUrl = createLambdaProcessUploads(thumbnailsBucket);
if (stack != 'dev') {
    const vpc = createVpc();
}
updateEnv({
    stack,
    uploadsBucket,
    uploadsAccessKey,
    thumbnailsBucket,
    processUploadsFunctionUrl,
});