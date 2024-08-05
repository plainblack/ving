import { createUploads } from './pulumi/uploads.mjs';
import { createVpc } from './pulumi/vpc.mjs';
import { createAurora } from './pulumi/aurora.mjs';
import { createRedis } from './pulumi/redis.mjs';
import { createThumbnails } from './pulumi/thumbnails.mjs';
import { createLambdaProcessUploads } from './pulumi/lambda-process-uploads.mjs';
import { updateEnv } from './pulumi/env.mjs';
import * as pulumi from "@pulumi/pulumi";

const stack = pulumi.getStack();
const { uploadsBucket, uploadsAccessKey } = await createUploads();
const thumbnailsBucket = await createThumbnails();
const processUploadsFunctionUrl = await createLambdaProcessUploads(thumbnailsBucket);
if (stack != 'dev') {
    const { vpc, subnets } = await createVpc();
    const { auroraCluster } = await createAurora(vpc, subnets);
    const { redis } = await createRedis(vpc, subnets);
}
await updateEnv({
    stack,
    uploadsBucket,
    uploadsAccessKey,
    thumbnailsBucket,
    processUploadsFunctionUrl,
});