import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";

export const createThumbnails = () => {
    const projectName = pulumi.getProject();
    const thumbnailsBucket = new aws.s3.Bucket(`${projectName}-thumbnails`);
    return thumbnailsBucket;
}
