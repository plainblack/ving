import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";
import { local } from "@pulumi/command";
//import * as archive from "@pulumi/archive";


export const createLambdaProcessUploads = (thumbnailsBucket) => {
    const projectName = pulumi.getProject();

    const createNodeModsZip = new local.Command('createNodeModsZip', {
        create: './create.nodemods.layer.sh',
        dir: './aws/lambda/layer/nodemods',
        assetPaths: ['./aws/lambda/layer/nodemods/nodemods.zip'],
    });

    const nodeModsLayer = new aws.lambda.LayerVersion("nodeModsLayer", {
        layerName: `${projectName}-nodemods`,
        compatibleRuntimes: ["nodejs20.x"],
        code: new pulumi.asset.AssetArchive({
            "nodejs": new pulumi.asset.FileArchive("./aws/lambda/layer/nodemods/nodemods.zip"),
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
    const iamForLambda = new aws.iam.Role(`${projectName}-iamForLambda`, {
        assumeRolePolicy: assumeRole.then(assumeRole => assumeRole.json)
    });

    const lambdaRolePolicyAttachment = new aws.iam.RolePolicyAttachment(`${projectName}-myLambdaRolePolicyAttachment`, {
        role: iamForLambda.name,
        policyArn: "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole",
    });

    const processUploadsFunction = new aws.lambda.Function(`${projectName}-processUploadsFunction`, {
        runtime: "nodejs20.x",
        handler: "index.handler",
        code: new pulumi.asset.AssetArchive({
            "index.mjs": new pulumi.asset.FileAsset('./aws/lambda/func/processUpload/index.mjs'),
        }),
        timeout: 60,
        memorySize: 512,
        environment: {
            variables: {
                AWS_THUMBNAILS_BUCKET: thumbnailsBucket.id.apply(id => `"${id}"`),
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

    /*
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
*/

}


/*

const aws = require("@pulumi/aws");

// Define the Lambda Layer that contains node modules
const nodeModulesLayer = new aws.lambda.LayerVersion("nodeModulesLayer", {
  layerName: "nodeModules",
  compatibleRuntimes: ["nodejs20.x"],
  code: new pulumi.asset.AssetArchive({
    "nodejs": new pulumi.asset.FileArchive("./layer"), // path to the folder with your node modules
  }),
});

// Define the Lambda function
const sqrtFunction = new aws.lambda.Function("sqrtFunction", {
  runtime: "nodejs20.x",
  handler: "index.handler", // Assumes your handler function is called `handler` in `index.js`
  code: new pulumi.asset.AssetArchive({
    "index.js": new pulumi.asset.StringAsset(
      // JavaScript code for the function: calculates the square root of a number
      'exports.handler = async (event) => {' +
      '  const number = event.queryStringParameters.number;' +
      '  return {' +
      '    statusCode: 200,' +
      '    body: JSON.stringify({ result: Math.sqrt(number) }),' +
      '  };' +
      '};'
    ),
  }),
  // Configure your Lambda to use the Node modules layer
  layers: [nodeModulesLayer.arn],
  // Lambda function role with AWSLambdaBasicExecutionRole policy
  role: lambdaExecutionRole.arn,
});

// Create a Lambda Function URL to expose the function to the web
const functionUrl = new aws.lambda.FunctionUrl("sqrtFunctionUrl", {
  functionName: sqrtFunction.name,
  authorizationType: "NONE", // Public access
});

// Export the URL to access the Lambda Function
exports.url = functionUrl.functionUrl;

*/