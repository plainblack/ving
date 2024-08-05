import * as aws from "@pulumi/aws";
import { prefix } from './utils.mjs';

export const createRedis = async (vpc, subnets) => {

    // Create a security group
    const securityGroup = new aws.ec2.SecurityGroup(prefix("redisSecurityGroup"), {
        vpcId: vpc.id,
        description: "Allow traffic for Redis",
        ingress: [
            { protocol: "tcp", fromPort: 6379, toPort: 6379, cidrBlocks: ["0.0.0.0/0"] },
        ],
        egress: [
            { protocol: "-1", fromPort: 0, toPort: 0, cidrBlocks: ["0.0.0.0/0"] },
        ],
    });

    // Create an Elasticache subnet group
    const subnetGroup = new aws.elasticache.SubnetGroup(prefix("redisSubnetGroup"), {
        subnetIds: [subnets[0].id, subnets[1].id],
    });

    // Create the Elasticache instance with Redis
    const redisCluster = new aws.elasticache.Cluster(prefix("redisCluster"), {
        engine: "redis",
        nodeType: "cache.t2.micro",
        numCacheNodes: 1,
        parameterGroupName: "default.redis7",
        subnetGroupName: subnetGroup.name,
        securityGroupIds: [securityGroup.id],
    });


    return { redisCluster };
}