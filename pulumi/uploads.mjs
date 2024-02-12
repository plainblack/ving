import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";

export const createUploads = () => {
    const projectName = pulumi.getProject();

    // Create tempspace
    const uploadsBucket = new aws.s3.Bucket(`${projectName}-uploads`, {
        acl: "private",
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