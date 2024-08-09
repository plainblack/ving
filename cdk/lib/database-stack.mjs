import { Stack, Duration } from 'aws-cdk-lib';
import elasticache from 'aws-cdk-lib/aws-elasticache';
import cdk from 'aws-cdk-lib';
import rds from 'aws-cdk-lib/aws-rds';
import ec2 from 'aws-cdk-lib/aws-ec2';

export class DatabaseStack extends Stack {
    /**
     *
     * @param {Construct} scope
     * @param {string} id
     * @param {StackProps=} props
     */
    constructor(scope, id, props) {
        super(scope, id, props);

        const vpc = props.vpc;

        const securityGroup = new ec2.SecurityGroup(this, props.formatName('database-sg'), {
            description: 'Allow traffic to Aurora and Redis',
            vpc,
            allowAllOutbound: true,
        });

        // will need to close thse down once we have servers connecting to the database and can use better rules
        securityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(3306));
        securityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(6379));


        /*
         *  Redis
        */

        const redisSubnetGroup = new elasticache.CfnSubnetGroup(this, props.formatName('redis-sg'), {
            description: 'Redis subnet group',
            subnetIds: vpc.privateSubnets.map((subnet) => subnet.subnetId),
        });

        const redisCluster = new elasticache.CfnReplicationGroup(this, props.formatName('redis'), {
            replicationGroupDescription: 'Redis cluster',
            cacheNodeType: 'cache.t3.micro',
            engine: 'redis',
            engineVersion: '7.0',
            numCacheClusters: 1,
            automaticFailoverEnabled: false,
            cacheSubnetGroupName: redisSubnetGroup.ref,
            securityGroupIds: [securityGroup.securityGroupId],
        });


        /*
         *  Aurora
        */


        const clusterParameterGroup = new rds.ParameterGroup(this, props.formatName('mysql8params'), {
            engine: rds.DatabaseClusterEngine.auroraMysql({ version: rds.AuroraMysqlEngineVersion.VER_3_07_0 }),
            description: 'Custom parameter group for MySLQ 8 on ving',
            parameters: {
                'character_set_server': 'utf8',
                'collation_server': 'utf8_unicode_ci',
                'innodb_ft_min_token_size': 2,
                'sql_mode': 'NO_ENGINE_SUBSTITUTION',
            },
        });

        // Create a new Aurora Serverless MySQL cluster
        const auroraName = props.formatName('aurora')
        const auroraCluster = new rds.DatabaseCluster(this, auroraName, {
            engine: rds.DatabaseClusterEngine.auroraMysql({ version: rds.AuroraMysqlEngineVersion.VER_3_07_0 }),
            vpc,
            credentials: {
                username: props.stageConfig.auroraSettings.adminUser || 'root',
            },
            clusterIdentifier: auroraName,
            serverlessV2MinCapacity: props.stageConfig.auroraSettings.minCapacity || 1,
            serverlessV2MaxCapacity: props.stageConfig.auroraSettings.maxCapacity || 2,
            backupRetention: Duration.days(props.stageConfig.auroraSettings.backupRetention || 7),
            securityGroups: [securityGroup],
            parameterGroup: clusterParameterGroup,
            deletionProtection: true,
            removalPolicy: cdk.RemovalPolicy.RETAIN_ON_UPDATE_OR_DELETE,
            writer: rds.ClusterInstance.serverlessV2(auroraName + '-writer'),
            readers: [
                // will be put in promotion tier 1 and will scale with the writer
                rds.ClusterInstance.serverlessV2(auroraName + '-reader1', { scaleWithWriter: true }),
            ],

        });

    }
}