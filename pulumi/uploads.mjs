import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";

export const createUploads = () => {
    const projectName = pulumi.getProject();

    const uploadsBucket = new aws.s3.BucketV2(`${projectName}-uploads`, {});

    const blockPublicAccessToUploads = new aws.s3.BucketPublicAccessBlock(`${projectName}-blockPublicAccessToUploads`, {
        bucket: uploadsBucket.id,
        blockPublicAcls: false,
        blockPublicPolicy: false,
        ignorePublicAcls: false,
        restrictPublicBuckets: false,
    });

    const publicReadPolicy = {
        Version: "2012-10-17",
        Statement: [{
            Sid: "PublicReadGetObject",
            Effect: "Allow",
            Principal: "*",
            Action: [
                "s3:GetObject",
            ],
            Resource: [
                uploadsBucket.arn.apply(arn => `${arn}/*`), // Policy applies to all objects
            ]
        }]
    };

    const uploadsPublicReadPolicy = new aws.s3.BucketPolicy(`${projectName}-uploadsPublicReadPolicy`, {
        bucket: uploadsBucket.id,
        policy: pulumi.output(publicReadPolicy).apply(JSON.stringify),
    });

    const uploadsBucketCorsConfig = new aws.s3.BucketCorsConfigurationV2(`${projectName}-uploads-cors`, {
        bucket: uploadsBucket.id,
        corsRules: [
            {
                "AllowedHeaders": [
                    "*"
                ],
                "AllowedMethods": [
                    "PUT",
                    "GET",
                ],
                "AllowedOrigins": [
                    "*"
                ],
                "ExposeHeaders": []
            }
        ],
    });

    const uploadsUser = new aws.iam.User(`${projectName}-uploadsUser`, {});
    const uploadsAccessKey = new aws.iam.AccessKey(`${projectName}-uploadsAccessKey`, { user: uploadsUser.name });

    const uploadsIAMPolicyDocument = aws.iam.getPolicyDocument({
        statements: [{
            actions: [
                "s3:GetObject",
                "s3:PutObject",
            ],
            resources: [
                uploadsBucket.arn.apply(arn => `${arn}/*`),
            ],
            effect: "Allow",
        }],
    }).then(document => document.json);


    const uploadsUserPolicy = new aws.iam.UserPolicy(`${projectName}-uploadsUserPolicy`, {
        user: uploadsUser.name,
        policy: uploadsIAMPolicyDocument,
    });

    return { uploadsBucket, uploadsAccessKey };
}