import * as aws from "@pulumi/aws";
import { prefix, safeName } from './utils.mjs';

export const createAurora = async (vpc, subnets) => {

    const clusterSecurityGroup = new aws.ec2.SecurityGroup(prefix("aurora-sg"), {
        vpcId: vpc.id,
        description: "Allow traffic to Aurora",
        ingress: [
            { protocol: "tcp", fromPort: 3306, toPort: 3306, cidrBlocks: ["0.0.0.0/0"] },
        ],
        egress: [
            { protocol: "-1", fromPort: 0, toPort: 0, cidrBlocks: ["0.0.0.0/0"] },
        ],
    });

    const clusterParameterGroup = new aws.rds.ClusterParameterGroup(prefix("aurora-mysql80-param-group"), {
        family: "aurora-mysql8.0",
        parameters: [
            {
                name: "character_set_server",
                value: "utf8",
            },
            {
                name: "collation_server",
                value: "utf8_unicode_ci",
            },
            {
                name: "innodb_ft_min_token_size",
                value: 2,
                applyMethod: "pending-reboot", // Apply this change during next reboot
            },
            {
                name: "sql_mode",
                value: "NO_ENGINE_SUBSTITUTION"
            },
        ],
    });

    const clusterSubnetGroup = new aws.rds.SubnetGroup(prefix("aurora-subnet-group"), {
        subnetIds: [subnets[0].id, subnets[1].id],
    });

    const databaseName = safeName();
    const username = "root";
    const password = "changeMeAfterTheFact";


    const auroraCluster = new aws.rds.Cluster(prefix('aurora-cluster'), {
        clusterIdentifier: prefix('aurora-cluster'),
        engine: "aurora-mysql",
        engineMode: "provisioned",
        databaseName: databaseName,
        masterUsername: username,
        masterPassword: password,
        serverlessv2ScalingConfiguration: {
            maxCapacity: 1,
            minCapacity: 0.5,
        },
        storageEncrypted: true,
        finalSnapshotIdentifier: prefix("final-snap-shot"),
        backupRetentionPeriod: 7,
        vpcSecurityGroupIds: [clusterSecurityGroup.id],
        dbClusterParameterGroupName: clusterParameterGroup,
        dbSubnetGroupName: clusterSubnetGroup.name,
    });

    const region = await aws.getRegion({});

    // Create a read instance
    const readInstance = new aws.rds.ClusterInstance(prefix("aurora-read"), {
        clusterIdentifier: auroraCluster.id,
        identifierPrefix: prefix("aurora-read"),
        instanceClass: "db.serverless",
        engine: auroraCluster.engine,
        engineVersion: auroraCluster.engineVersion,
        availabilityZone: region.id + "b", // Distributing instances across AZs
    });

    // Create a write instance
    const writeInstance = new aws.rds.ClusterInstance(prefix("aurora-write"), {
        clusterIdentifier: auroraCluster.id,
        identifierPrefix: prefix("aurora-write"),
        instanceClass: "db.serverless",
        engine: auroraCluster.engine,
        engineVersion: auroraCluster.engineVersion,
        preferredMaintenanceWindow: "sun:23:45-mon:00:15",
        availabilityZone: region.id + "a", // Distributing instances across AZs
    });


    return { auroraCluster, clusterParameterGroup, clusterSecurityGroup };
}