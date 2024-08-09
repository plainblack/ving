#!/usr/bin/env -S node

import { CloudFormationClient, DescribeStacksCommand } from "@aws-sdk/client-cloudformation";
import constants from '../lib/constants.mjs';
import { generatePrefix, generateSuffix } from '../lib/utils.mjs';
import Env from '@marknotton/env';

const stage = process.argv[2];
if (!stage) {
    throw new Error('Stage is not defined');
}

if (!constants.stages[stage]) {
    throw new Error(`Stage ${stage} is not a valid stage`);
}

const client = new CloudFormationClient({ region: constants.stages[stage].region });

const prefix = generatePrefix(stage);
const suffix = generateSuffix(stage);

const uploadStack = await client.send(new DescribeStacksCommand({ StackName: `${prefix}-UploadStack${suffix}` }));

const index = {};
uploadStack.Stacks[0].Outputs.forEach((value) => index[value.OutputKey] = value.OutputValue);

console.log(index);

const filename = stage == 'dev' ? '../.env' : '../.env.' + stage;
const envFile = new Env(filename);
envFile.set('AWS_REGION', constants.stages[stage].region);
envFile.set('VING_AWS_UPLOADS_BUCKET', index.uploadsBucketName);
envFile.set('VING_AWS_UPLOADS_KEY', index.uploadsAccessKey);
envFile.set('VING_AWS_UPLOADS_SECRET', index.uploadsSecretKey);
envFile.set('VING_AWS_THUMBNAILS_BUCKET', index.thumbnailsBucketName);
envFile.set('VING_LAMBDA_PROCESS_UPLOADS_URL', index.uploadsFunctionUrl);

console.log(`Updated ${filename}`);