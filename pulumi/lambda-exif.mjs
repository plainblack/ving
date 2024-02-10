import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";
import * as archive from "@pulumi/archive";

export const createLambdaExif = () => {


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
    const iamForLambda = new aws.iam.Role("iamForLambda", { assumeRolePolicy: assumeRole.then(assumeRole => assumeRole.json) });

    const lambda = archive.getFile({
        type: "zip",
        sourceFile: "lambda.js",
        outputPath: "lambda_function_payload.zip",
    });

    const exampleLayerVersion = new aws.lambda.LayerVersion("exampleLayerVersion", {});


    const myLambda = new aws.lambda.Function(`${projectName}-lambda-exif`, {
        code: new pulumi.asset.FileArchive("lambda_function_payload.zip"),
        role: iamForLambda.arn,

        // (Required) The s3 bucket location containing the function's deployment package
        // This is a placeholder value and should be replaced with actual bucket name and object key.
        //  s3Bucket: "my-bucket",
        // s3Key: "my-lambda.zip",

        // (Required) IAM role attached to the Lambda Function
        // This is a placeholder ARN and should be replaced with the actual role ARN.
        // role: "arn:aws:iam::123456789012:role/lambda_exec_role",

        // (Optional) The function execution time at which Lambda should terminate the function.
        // Defaults to 3 seconds.

        timeout: 10,

        // (Optional) Memory allocation for the function.
        // Defaults to 128 MB.
        memorySize: 256,

        runtime: aws.lambda.NodeJS12dXRuntime,

        // Specify the ARN for the Lambda Layer you want to attach
        layers: [
            "arn:aws:lambda:us-east-1:445285296882:layer:perl-5-38-runtime-al2023-x86_64:4",
            exampleLayerVersion.arn,
        ],

        // (Required) The function Lambda calls to begin execution.
        handler: "index.handler"
    });

}
