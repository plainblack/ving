import { createTempspace } from './pulumi/tempspace.mjs';
import { createFileStorage } from './pulumi/file-storage.mjs';
import { updateEnv } from './pulumi/env.mjs';

const { tempspaceBucket, tempspaceUploaderAccessKey } = createTempspace();
const filesBucket = createFileStorage();

updateEnv({
    tempspaceBucket,
    tempspaceUploaderAccessKey,
    filesBucket,
});