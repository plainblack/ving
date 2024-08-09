import { Stack, Duration } from 'aws-cdk-lib';
import s3 from 'aws-cdk-lib/aws-s3';
import iam from 'aws-cdk-lib/aws-iam';
import cdk from 'aws-cdk-lib';
import { execSync } from 'child_process';
import lambda from 'aws-cdk-lib/aws-lambda';

export class UploadStack extends Stack {
  /**
   *
   * @param {Construct} scope
   * @param {string} id
   * @param {StackProps=} props
   */
  constructor(scope, id, props) {
    super(scope, id, props);

    /*
    *   upload area
    */

    // create the bucket
    const uploadsName = props.formatName(props.constants.uploadsBucketName);
    const uploadsBucket = new s3.Bucket(this, uploadsName, {
      bucketName: props.stageConfig.uploadsBucketNameOverride || uploadsName,
      removalPolicy: cdk.RemovalPolicy.RETAIN_ON_UPDATE_OR_DELETE,
      cors: [
        {
          allowedHeaders: ['*'],
          allowedMethods: [s3.HttpMethods.PUT, s3.HttpMethods.GET],
          allowedOrigins: ['*'],
          exposedHeaders: [],
        }
      ],
      blockPublicAccess: {
        blockPublicAcls: false,
        blockPublicPolicy: false,
        ignorePublicAcls: false,
        restrictPublicBuckets: false,
      },
      // autoDeleteObjects: false
    });

    new cdk.CfnOutput(this, 'uploadsBucketName', {
      value: uploadsBucket.bucketName
    });

    // add a policy statement to allow public read access
    const result = uploadsBucket.addToResourcePolicy(new iam.PolicyStatement({
      name: uploadsName + '-read-policy',
      actions: ['s3:GetObject'],
      resources: [uploadsBucket.arnForObjects('*')],
      effect: cdk.aws_iam.Effect.ALLOW,
      principals: [new iam.AnyPrincipal()],
      sid: 'AllowPublicRead',
    }));
    if (!result.statementAdded) {
      throw new Error('No uploads policy statement added.');
    }

    // add iam user
    const uploadsUser = new iam.User(this, uploadsName + '-user');
    const uploadsAccessKey = new iam.AccessKey(this, uploadsName + '-accesskey', { user: uploadsUser });
    new cdk.CfnOutput(this, 'uploadsAccessKey', {
      value: uploadsAccessKey.accessKeyId
    });
    new cdk.CfnOutput(this, 'uploadsSecretKey', {
      value: uploadsAccessKey.secretAccessKey.unsafeUnwrap()
    });
    uploadsUser.addToPolicy(new iam.PolicyStatement({
      name: uploadsName + '-policy',
      actions: ['s3:GetObject', 's3:PutObject'],
      resources: [uploadsBucket.arnForObjects('*')],
      effect: iam.Effect.ALLOW,
    }));


    /*
      *  thumbnails area
      */

    // create the bucket
    const thumbnailsName = props.formatName(props.constants.thumbnailsBucketName);
    const thumbnailsBucket = new s3.Bucket(this, thumbnailsName, {
      bucketName: props.stageConfig.thumbnailsBucketNameOverride || thumbnailsName,
      removalPolicy: cdk.RemovalPolicy.RETAIN_ON_UPDATE_OR_DELETE,
      cors: [
        {
          allowedHeaders: ['*'],
          allowedMethods: [s3.HttpMethods.PUT, s3.HttpMethods.GET],
          allowedOrigins: ['*'],
          exposedHeaders: [],
        }
      ],
      blockPublicAccess: {
        blockPublicAcls: false,
        blockPublicPolicy: false,
        ignorePublicAcls: false,
        restrictPublicBuckets: false,
      },
      // autoDeleteObjects: false
    });

    new cdk.CfnOutput(this, 'thumbnailsBucketName', {
      value: thumbnailsBucket.bucketName
    });

    // add a policy statement to allow public read access
    const thumbnailsResult = thumbnailsBucket.addToResourcePolicy(new iam.PolicyStatement({
      name: thumbnailsName + '-read-policy',
      actions: ['s3:GetObject'],
      resources: [thumbnailsBucket.arnForObjects('*')],
      effect: cdk.aws_iam.Effect.ALLOW,
      principals: [new iam.AnyPrincipal()],
      sid: 'AllowPublicRead',
    }));
    if (!thumbnailsResult.statementAdded) {
      throw new Error('No thumbnails policy statement added.');
    }

    /*
     *  lambda function
     */

    execSync('./create.nodemods.layer.sh', { cwd: './lib/lambda/layer/nodemods' });

    const nodemodsLayer = new lambda.LayerVersion(this, props.formatName('nodemodslayer'), {
      code: lambda.Code.fromAsset('./lib/lambda/layer/nodemods/nodemods.zip'),
      compatibleRuntimes: [lambda.Runtime.NODEJS_20_X],
      description: 'Contains the node modules for the uploader lambda function',
    });

    const iamForLambda = new iam.Role(this, props.formatName('lambdaRole'), {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole'),
      ],
    });

    iamForLambda.addToPolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: ["s3:PutObject"],
      resources: [thumbnailsBucket.arnForObjects('*')],
    }));

    const uploadFunction = new lambda.Function(this, props.formatName('UploadFunction'), {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('./lib/lambda/func/processUpload'),
      layers: [nodemodsLayer],
      role: iamForLambda,
      timeout: Duration.seconds(props.stageConfig.uploadsLambdaSettings.timeout || 60),
      memorySize: props.stageConfig.uploadsLambdaSettings.memorySize || 128,
      environment: {
        VING_AWS_THUMBNAILS_BUCKET: thumbnailsBucket.bucketName,
      },
    });

    const uploadsFunctionUrl = uploadFunction.addFunctionUrl({
      authType: lambda.FunctionUrlAuthType.NONE,
    });

    new cdk.CfnOutput(this, 'uploadsFunctionUrl', {
      value: uploadsFunctionUrl.url
    });

  }
}