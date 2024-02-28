---
outline: deep
---
# Pulumi
[Pulumi](https://www.pulumi.com) is an open source Infrastructure as Code (IaC) system. It allows you to automate setting up servers and services. Ving uses it to make configuring AWS faster, rather than giving you a bunch of instructions to perform and hope you get them all right, we've programmed Pulumi to do it for you.

## Setup
Follow the [Pulumi install instructions](https://www.pulumi.com/docs/install/).

If you have not already set up an [AWS credentials](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-files.html) file in `~/.aws/credentials` then you'll want to do that now as pulumi will use that to log in to AWS.

Then edit the `Pulumi.yaml` file and change the `name` field from `ving` to your project name. This name will be used to prefix all the generated services in AWS so you know what we made.

Then type `pulumi up` at your command line. When it asks you about what stack you want, say `dev` unless you already know how to use pulumi and want to use your own stack name. And once it shows you its plan for deployment, use your arrow key to move up to `yes` to deploy it.

## Using Pulumi For Your Own Needs
By editing `Pulumi.mjs` you can add your own infrastructure automations. And then use `pulumi up` to roll them out to the server. Just make sure you don't remove or change any of the pulumi code that we have there unless you understand the implications.