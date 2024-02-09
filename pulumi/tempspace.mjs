import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";

export const createTempspace = () => {
    const projectName = pulumi.getProject();

    // Create tempspace
    const tempspaceBucket = new aws.s3.Bucket(`${projectName}-tempspace`, {
        acl: "private", // Access control list set to private – only owner can access
    });


    const tempspaceBucketCorsConfig = new aws.s3.BucketCorsConfigurationV2(`${projectName}-tempspace-cors`, {
        bucket: tempspaceBucket.id,
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
    const tempspaceDeleteAfter1DayPolicy = new aws.s3.BucketLifecycleConfigurationV2(`${projectName}-delete-tempspace-after-1-day`, {
        bucket: tempspaceBucket.id,
        rules: [{
            id: "expireObjects",
            status: "Enabled",
            expiration: {
                days: 1,
            },
        }],
    });

    const tempspaceUploaderUser = new aws.iam.User(`${projectName}-tempspaceUploaderUser`, {});
    const tempspaceUploaderAccessKey = new aws.iam.AccessKey(`${projectName}-tempspaceUploaderAccessKey`, { user: tempspaceUploaderUser.name });

    const tempspaceIAMuploadPolicyDocument = aws.iam.getPolicyDocument({
        statements: [{
            actions: [
                "s3:GetObject",
                "s3:PutObject",
            ],
            resources: [
                tempspaceBucket.arn.apply(arn => `${arn}/*`),
            ],
            effect: "Allow",
        }],
    }).then(document => document.json);


    const tempspaceUploadUserPolicy = new aws.iam.UserPolicy(`${projectName}-tempspaceUploadUserPolicy`, {
        user: tempspaceUploaderUser.name,
        policy: tempspaceIAMuploadPolicyDocument,
    });

    return { tempspaceBucket, tempspaceUploaderAccessKey };
}