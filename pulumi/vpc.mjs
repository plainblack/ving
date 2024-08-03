import * as aws from "@pulumi/aws";
import { prefix } from './utils.mjs';

export const createVpc = async () => {

    const vpc = new aws.ec2.Vpc(prefix('vpc'), {
        cidrBlock: "10.0.0.0/16",
        enableDnsSupport: true,
        enableDnsHostnames: true,
        tags: {
            Name: prefix('vpc'),
        },
    });

    const region = await aws.getRegion({});

    const subnet1 = new aws.ec2.Subnet(prefix('subnet1'), {
        vpcId: vpc.id,
        cidrBlock: "10.0.1.0/24",
        availabilityZone: region.id + "a",
    });

    const subnet2 = new aws.ec2.Subnet(prefix('subnet2'), {
        vpcId: vpc.id,
        cidrBlock: "10.0.2.0/24",
        availabilityZone: region.id + "b",
    });

    return { vpc, subnets: [subnet1, subnet2] };
}