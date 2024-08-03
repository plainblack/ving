import Env from '@marknotton/env';
import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";

// this has to be its own file rather than each function updating itself, because of the paralleization of pulumi causing a race condition for the .env file

export const updateEnv = async (obj) => {
    const env = new Env(obj.stack == 'dev' ? '.env' : '.env.' + obj.stack);
    aws.getRegion({}).then(region => env.set('AWS_REGION', region.id));
    obj.uploadsAccessKey.id.apply(id => env.set("VING_AWS_UPLOADS_KEY", id));
    obj.uploadsAccessKey.secret.apply(secret => env.set("VING_AWS_UPLOADS_SECRET", secret));
    obj.uploadsBucket.id.apply(id => env.set("VING_AWS_UPLOADS_BUCKET", id));
    obj.thumbnailsBucket.id.apply(id => env.set("VING_AWS_THUMBNAILS_BUCKET", id));
    obj.processUploadsFunctionUrl.functionUrl.apply(functionUrl => env.set("VING_LAMBDA_PROCESS_UPLOADS_URL", functionUrl))
}
