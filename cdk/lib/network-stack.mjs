import { Stack, Duration } from 'aws-cdk-lib';
import iam from 'aws-cdk-lib/aws-iam';
import cdk from 'aws-cdk-lib';
import rds from 'aws-cdk-lib/aws-rds';
import ec2 from 'aws-cdk-lib/aws-ec2';

export class NetworkStack extends Stack {
    /**
     *
     * @param {Construct} scope
     * @param {string} id
     * @param {StackProps=} props
     */
    constructor(scope, id, props) {
        super(scope, id, props);

        this.vpc = new ec2.Vpc(this, props.formatName('vpc'), {
            maxAzs: 2,
            ipAddresses: ec2.IpAddresses.cidr('10.0.0.0/16'),
        });

    }
}