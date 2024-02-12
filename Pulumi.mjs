import { createTempspace } from './pulumi/tempspace.mjs';
import { createFileStorage } from './pulumi/file-storage.mjs';
import { createLambdaProcessUploads } from './pulumi/lambda-process-uploads.mjs';
import { updateEnv } from './pulumi/env.mjs';

const { tempspaceBucket, tempspaceUploaderAccessKey } = createTempspace();
const filesBucket = createFileStorage();
const processUploadsFunctionUrl = createLambdaProcessUploads();
updateEnv({
    tempspaceBucket,
    tempspaceUploaderAccessKey,
    filesBucket,
    processUploadsFunctionUrl,
});