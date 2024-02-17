import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";
import { local } from "@pulumi/command";


export const createLambdaProcessUploads = (thumbnailsBucket) => {
    const projectName = pulumi.getProject();

    const createNodeModsZip = new local.Command('createNodeModsZip', {
        create: './create.nodemods.layer.sh',
        dir: './pulumi/aws/lambda/layer/nodemods',
        assetPaths: ['./pulumi/aws/lambda/layer/nodemods/nodemods.zip'],
    });

    const nodeModsLayer = new aws.lambda.LayerVersion("nodeModsLayer", {
        layerName: `${projectName}-nodemods`,
        compatibleRuntimes: ["nodejs20.x"],
        code: new pulumi.asset.AssetArchive({
            "nodejs": new pulumi.asset.FileArchive("./pulumi/aws/lambda/layer/nodemods/nodemods.zip"),
        }),
    });

    const assumeRole = aws.iam.getPolicyDocument({
        statements: [{
            effect: "Allow",
            principals: [{
                type: "Service",
                identifiers: ["lambda.amazonaws.com"],
            }],
            actions: ["sts:AssumeRole"],
        }],
    });
    const iamForLambda = new aws.iam.Role(`${projectName}-iamLambdaPostProcessor`, {
        assumeRolePolicy: assumeRole.then(assumeRole => assumeRole.json)
    });

    const lambdaRolePolicyAttachment = new aws.iam.RolePolicyAttachment(`${projectName}-lambdaRolePolicyAttachment`, {
        role: iamForLambda.name,
        policyArn: "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole",
    });

    /* const lambdaS3PolicyDoc = {
         Version: "2012-10-17",
         Statement: [{
             Action: "s3:PutObject",
             Resource: thumbnailsBucket.arn.apply(arn => `${arn}/*`),
             Effect: "Allow",
         }],
     };*/

    const lambdaS3PolicyDoc = aws.iam.getPolicyDocument({
        statements: [{
            actions: [
                "s3:PutObject",
            ],
            resources: [
                thumbnailsBucket.arn.apply(arn => `${arn}/*`),
            ],
            effect: "Allow",
        }],
    }).then(document => document.json);

    const lambdaS3Policy = new aws.iam.RolePolicy(`${projectName}-lambdaS3ThumbnailPolicy`, {
        role: iamForLambda.id,
        policy: lambdaS3PolicyDoc,
    });

    const processUploadsFunction = new aws.lambda.Function(`${projectName}-processUploadsFunction`, {
        runtime: "nodejs20.x",
        handler: "index.handler",
        code: new pulumi.asset.AssetArchive({
            "index.mjs": new pulumi.asset.FileAsset('./pulumi/aws/lambda/func/processUpload/index.mjs'),
        }),
        timeout: 60,
        memorySize: 512,
        environment: {
            variables: {
                AWS_THUMBNAILS_BUCKET: thumbnailsBucket.id.apply(id => id),
            }
        },
        layers: [nodeModsLayer.arn],
        role: iamForLambda.arn,
    });

    const processUploadsFunctionUrl = new aws.lambda.FunctionUrl(`${projectName}-processUploadsFunctionUrl`, {
        functionName: processUploadsFunction.name,
        authorizationType: "NONE", // Public access
    });

    return processUploadsFunctionUrl;
}