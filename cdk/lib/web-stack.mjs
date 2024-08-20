import { Stack, Duration } from 'aws-cdk-lib';
import ec2 from 'aws-cdk-lib/aws-ec2';
import elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import fs from 'fs'
import secrets from 'aws-cdk-lib/aws-secretsmanager';
import autoscaling from 'aws-cdk-lib/aws-autoscaling'
import iam from 'aws-cdk-lib/aws-iam'

export class WebStack extends Stack {
    /**
     *
     * @param {Construct} scope
     * @param {string} id
     * @param {StackProps=} props
     */
    constructor(scope, id, props) {
        super(scope, id, props);

        /** 
         * load balancer 
         */
        const albName = props.formatName(alb)
        const alb = new elbv2.ApplicationLoadBalancer(
            scope,
            albName,
            {
                loadBalancerName: albName,
                vpc: props.vpc,
                internetFacing: true,
            }
        );

        // we need to expose the dns name of the load balancer
        this.loadBalancerDnsName = alb.loadBalancerDnsName

        // we will  need the listener to add our autoscaling group later
        this.listener = alb.addListener(props.formatName('alb-listener'), {
            port: 80,
            open: true,
        });

        // print out the dns name of the alb
        new cdk.CfnOutput(scope, props.formatName('alb-dns-name'), {
            value: alb.loadBalancerDnsName,
        });

        /**
         * autoscaling group
         */

        const role = new iam.Role(scope, props.formatName('instance-role'), {
            assumedBy: new iam.CompositePrincipal(
                new iam.ServicePrincipal('ec2.amazonaws.com'),
                new iam.ServicePrincipal('ssm.amazonaws.com')
            ),
            managedPolicies: [
                // allows us to access instance via SSH using IAM and SSM
                iam.ManagedPolicy.fromAwsManagedPolicyName(
                    'AmazonSSMManagedInstanceCore'
                ),
                // allows ec2 instance to access secrets maanger and retrieve secrets
                iam.ManagedPolicy.fromAwsManagedPolicyName('SecretsManagerReadWrite'),
            ],
        });

        // lets create a security group for the wordpress instance
        const securityGroup = new ec2.SecurityGroup(
            scope,
            props.formatName('webinstances-sg'),
            {
                vpc: props.vpc,
                allowAllOutbound: true,
                securityGroupName: props.formatName('webinstances-sg'),
            }
        );

        // the web instance will not be exposed to the public Internet this time
        // the Internet can access it through the ALB only
        // the admin can access it (the console) via SSM
        securityGroup.addIngressRule(
            ec2.Peer.ipv4(customVPC.vpcCidrBlock),
            ec2.Port.tcp(80),
            'Allows HTTP access from resources inside our VPC (like the ALB)'
        );

        /**
         * ec2 instances
         */

    }
}