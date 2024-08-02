import * as aws from "@pulumi/aws";
import { prefix } from './utils.mjs';

export const createVpc = () => {

    const vpc = new aws.ec2.Vpc(prefix('vpc'), {
        cidrBlock: "10.0.0.0/16",
        enableDnsSupport: true,
        enableDnsHostnames: true,
        tags: {
            Name: prefix('vpc'),
        },
    });

    return vpc;
}