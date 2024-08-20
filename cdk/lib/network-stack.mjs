import { Stack, Duration } from 'aws-cdk-lib';
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
            enableDnsHostnames: true,
            enableDnsSupport: true,
            natGateways: 0,
            subnetConfiguration: [
                {
                    cidrMask: 22,
                    name: props.formatName('public'),
                    subnetType: ec2.SubnetType.PUBLIC, // for web access 
                },
                {
                    cidrMask: 22,
                    name: props.formatName('private'),
                    subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS, // for database access
                },
            ],
        });

    }
}