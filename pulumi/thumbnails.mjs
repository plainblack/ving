import * as aws from "@pulumi/aws";
import { prefix } from './utils.mjs';
import * as pulumi from "@pulumi/pulumi";

export const createThumbnails = async () => {

    const thumbnailsBucket = new aws.s3.BucketV2(prefix('thumbnails'), {});

    const blockPublicAccessToThumbnails = new aws.s3.BucketPublicAccessBlock(prefix('blockPublicAccessToThumbnails'), {
        bucket: thumbnailsBucket.id,
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
                thumbnailsBucket.arn.apply(arn => `${arn}/*`), // Policy applies to all objects
            ]
        }]
    };

    const thumbnailsPublicReadPolicy = new aws.s3.BucketPolicy(prefix('thumbnailsPublicReadPolicy'), {
        bucket: thumbnailsBucket.id,
        policy: pulumi.output(publicReadPolicy).apply(JSON.stringify),
    });

    return thumbnailsBucket;
}
