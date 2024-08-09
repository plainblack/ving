#!/usr/bin/env node

import cdk from 'aws-cdk-lib';
import { UploadStack } from '../lib/upload-stack.mjs';
import { generatePrefix, generateSuffix } from '../lib/utils.mjs';
import constants from '../lib/constants.mjs';

const app = new cdk.App();
const stage = app.node.getContext('stage');

if (!stage) {
  throw new Error('Stage is not defined');
}

if (!constants.stages[stage]) {
  throw new Error(`Stage ${stage} is not a valid stage`);
}

const prefix = generatePrefix(stage);
const suffix = generateSuffix(stage);

new UploadStack(app, `${prefix}-UploadStack${suffix}`, {
  stage,
  constants,
  stageConfig: constants.stages[stage],
  formatName: (name) => `${prefix}-${name}${suffix}`,
  env: { account: constants.stages[stage].account, region: constants.stages[stage].region },
});

