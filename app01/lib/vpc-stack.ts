import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { Vpc } from 'aws-cdk-lib/aws-ec2';

export class VpcStack extends Stack {

  //別スタックから参照できるようにする
  public readonly vpc: Vpc;
  
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const vpc_name = 'cdk-vpc';
    const cidr = '10.1.0.0/16';

    this.vpc = new ec2.Vpc(this, 'VPC', {

      vpcName: vpc_name,
      cidr: cidr,
      maxAzs: 2,
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: `${vpc_name}-public`,
          subnetType: ec2.SubnetType.PUBLIC,
        },
        {
          cidrMask: 24,
          name: `${vpc_name}-private`,
          subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
        },
      ]
    })
  }
};