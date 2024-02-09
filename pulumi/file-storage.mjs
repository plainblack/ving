import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";

export const createFileStorage = () => {
    const projectName = pulumi.getProject();
    const filesBucket = new aws.s3.Bucket(`${projectName}-files`);
    return filesBucket;
}
