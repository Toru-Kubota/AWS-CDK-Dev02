#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { VpcStack } from '../lib/vpc-stack';
import { EcsStack } from '../lib/ecs-stack';
import { RdsStack } from '../lib/rds-stack';


const app = new cdk.App();
const vpcStack = new VpcStack(app, 'VpcStack', {
    env: {
        account: 'AWS_ACCOUNT',
        region: 'ap-northeast-1',
    },
});

new EcsStack(app, 'EcsStack', {

    //変数を渡す
    vpc: vpcStack.vpc,
    env: {
        account: 'AWS_ACCOUNT',
        region: 'ap-northeast-1',
    },
});

new RdsStack(app, 'RdsStack', {

    //変数を渡す
    vpc: vpcStack.vpc,
    env: {
        account: 'AWS_ACCOUNT',
        region: 'ap-northeast-1',
    },
});