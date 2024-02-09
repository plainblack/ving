import * as aws from "@pulumi/aws";

export const createFileStorage = () => {
    const filesBucket = new aws.s3.Bucket("ving-files");
    return filesBucket;
}
