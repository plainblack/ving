import * as aws from "@pulumi/aws";

export const createTempspace = () => {

    // Create tempspace
    const tempspaceBucket = new aws.s3.Bucket("ving-tempspace", {
        acl: "private", // Access control list set to private – only owner can access
    });


    const tempspaceBucketCorsConfig = new aws.s3.BucketCorsConfigurationV2("ving-tempspace-cors", {
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
    const tempspaceDeleteAfter1DayPolicy = new aws.s3.BucketLifecycleConfigurationV2("delete-tempspace-after-1-day", {
        bucket: tempspaceBucket.id,
        rules: [{
            id: "expireObjects",
            status: "Enabled",
            expiration: {
                days: 1,
            },
        }],
    });

    const tempspaceUploaderUser = new aws.iam.User("tempspaceUploaderUser", {});
    const tempspaceUploaderAccessKey = new aws.iam.AccessKey("tempspaceUploaderAccessKey", { user: tempspaceUploaderUser.name });

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


    const tempspaceUploadUserPolicy = new aws.iam.UserPolicy("tempspaceUploadUserPolicy", {
        user: tempspaceUploaderUser.name,
        policy: tempspaceIAMuploadPolicyDocument,
    });

    return { tempspaceBucket, tempspaceUploaderAccessKey };
}