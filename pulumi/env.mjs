import Env from '@marknotton/env';
import * as aws from "@pulumi/aws";

// this has to be its own file rather than each function updating itself, because of the paralleization of pulumi causing a race condition for the .env file

export const updateEnv = (obj) => {
    const env = new Env('.env');
    aws.getRegion({}).then(region => env.set('AWS_REGION', region.id));
    obj.tempspaceUploaderAccessKey.id.apply(id => env.set("AWS_TEMP_UPLOAD_KEY", id));
    obj.tempspaceUploaderAccessKey.secret.apply(secret => env.set("AWS_TEMP_UPLOAD_SECRET", secret));
    obj.tempspaceBucket.id.apply(id => env.set("AWS_TEMP_BUCKET", id));
    obj.filesBucket.id.apply(id => env.set("AWS_FILES_BUCKET", id));
    obj.processUploadsFunctionUrl.functionUrl.apply(functionUrl => env.set("LAMBDA_PROCESS_UPLOADS_URL", functionUrl))
}
