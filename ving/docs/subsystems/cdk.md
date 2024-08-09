---
outline: deep
---
# CDK
[CDK also known as Cloud Development Kit](https://aws.amazon.com/cdk/) is a framework for defining cloud infrastructure in code. We use it to make configuring AWS faster, rather than giving you a bunch of instructions to perform and hope you get them all right, we've programmed CDK to do it for you.

## Setup

### Install CDK
Follow the [CDK install instructions](https://docs.aws.amazon.com/cdk/v2/guide/getting_started.html#getting_started_install).

### Setup AWS Credentials
If you have not already set up an [AWS credentials](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-files.html) file in `~/.aws/credentials` then you'll want to do that now as pulumi will use that to log in to AWS.

### Edit CDK Constants
In the `cdk/lib/constants.mjs` file you'll need to make the following changes:

- Change the `shortName` field from `ving` to a short version of project name with no spaces or special characters. This name will be used to prefix all the generated services in AWS so you know what we made.
- In the `stages` field, change the `region` and `account` fields to the region and account number of your AWS account.
- In the `stages.prod` field, change the `uploadsBucketNameOverride` and `thumbnailsBucketNameOverride` fields to the name of the buckets you want to use for uploads and thumbnails in production. These should be on your domain, but needs to be unique in all of S3 as well.

## Using CDK

*Note:* To use CDK you need to be in the `ckd` folder.

```bash
cd cdk
```

### Bootstrapping CDK
As mentioned above, you should follow the [installation and setup instructions for CDK](https://docs.aws.amazon.com/cdk/v2/guide/getting_started.html#getting_started_install). Once you have that set up, you can bootstrap CDK by running the following command:

```bash
cdk bootstrap --context stage=dev  --profile jt
```

*Note:* the `--profile` flag is optional. Only use it if you have more than one AWS profile and you don't want to use the default one.

### Synthesizing CDK
Synthesizing allows you to see the CloudFormation configuration that CDK will generate. You can synthesize CDK by running the following command:

```bash
cdk synth --context stage=dev  --profile jt
```

### Deploying CDK
Deploying means you want to actually create the infrastructure on your AWS account. You can deploy CDK by running the following command:

```bash
cdk deploy --context stage=dev  --profile jt
```

### Updating Your .env File After CDK Deploy
After deploying CDK, you'll need to update your `.env` file with the values that CDK generated. You can do this by running the following command:

```bash
./bin/update_env_file.mjs dev 
```

*Note:* If you do this for any stage other than `dev` it will update the `.env.{stage}` file instead. So for `prod` it would update `.env.prod`.

### Destroying CDK
Destroying means you want to delete the infrastructure on your AWS account. You can destroy CDK by running the following command:

```bash
cdk destroy --context stage=dev  --profile jt
```

## Stages
Above we always used the `dev` stage. This is what you want to use on your local machine. But you can also use the `prod` stage and you can even create your own stages by adding them to the `stages` field in `cdk/lib/constants.mjs`. These are the differences between `dev` and any other stage.

- `dev` always generates resources with a suffix that is generated from a hash of your user account on your local machine. This way multiple devs can each have their own dev environment without stepping on each other. All other stages leave out this suffix.
- `dev` only generates the `uploads` stack. All other stages generate all the stacks.


## Stacks
Stacks are divisions of AWS resources in CDK. We divide them into areas of responsibility. For example, we have a `uploads` stack that generates the S3 buckets for uploads and thumbnails. There is also a `network` stack for creating the virtual private cloud that all the hardware will be connected to. We have a `database` stack that generates the Aurora Serverless database and Redis cluster. And in the future we will have a `server` stack that generates the EC2/lambda instances that run the Ving web and jobs servers.

You can create your own stacks as well by following the instructions in the [CDK documentation](https://docs.aws.amazon.com/cdk/v2/guide/stacks.html#stacks).

### Special Needs of the Databsae Stack
First, by default it will create a database with the root user of `root` and no password. You'll need to set the password in the AWS console. You can do this by going to the RDS console, clicking on the cluster, and then clicking on the "Modify" button. Then you can change the password.

Second, you may also want to change the minimum and maximum capacity units of the Aurora cluster. You can do this in the `cdk/lib/constants.mjs` file.

Third, the stack does not create or deploy your ving database schema. It simply creates the cluster that the database will run on. Follow the [Drizzle](drizzle) documentation to create and deploy your schema.

*Note:* If you ever want to delete your database, you should change `RETAIN_ON_UPDATE_OR_DELETE` to `DESTROY` in the `DatabaseStack` class first. Then deploy it. And then destroy it.