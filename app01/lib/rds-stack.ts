import { RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Peer, Port, SecurityGroup, Vpc } from 'aws-cdk-lib/aws-ec2';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as ec2 from 'aws-cdk-lib/aws-ec2';

//VpcStackの変数を扱えるようにする
interface SubStackProps extends StackProps {
  vpc: Vpc;
};

export class RdsStack extends Stack {
  constructor(scope: Construct, id: string, props: SubStackProps) {
    super(scope, id, props);

    //VPC取得　
    const vpc = props.vpc;

    //Subnet取得
    const private_subnet = vpc.selectSubnets({
      subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
    }).subnets

    const public_subnet = vpc.selectSubnets({
      subnetType: ec2.SubnetType.PUBLIC,
    }).subnets

    //SubnetGroup作成
    const subnetGroup = new rds.SubnetGroup(this, 'SubnetGroup', {
      description: 'aurora subnet group for WebApp01',
      vpc: vpc,      
      vpcSubnets: {
        subnets: private_subnet,
      }
    });

    //SecurityGroup作成
    const secgroup01 = new SecurityGroup(this, 'SecGroup', {
      vpc: vpc,
    });

    //SecurityGroupにPublic SubnetからのIngressルール追加
    for (const elm of public_subnet) {
      secgroup01.addIngressRule(        
        Peer.ipv4(elm.ipv4CidrBlock),
        Port.tcp(3306),
      )};

    //RDS作成
    const cluster = new rds.DatabaseCluster(this, 'AuroraDB', {
      engine: rds.DatabaseClusterEngine.auroraMysql({
        version: rds.AuroraMysqlEngineVersion.VER_2_10_2
      }),
      credentials: rds.Credentials.fromGeneratedSecret('admin'),
      defaultDatabaseName: 'database1',
  
      instanceProps: {
        vpc,
        publiclyAccessible: false,
        instanceType: ec2.InstanceType.of(
          ec2.InstanceClass.BURSTABLE3,
          ec2.InstanceSize.SMALL),
          securityGroups: [secgroup01],        
        vpcSubnets: {
          subnets: private_subnet,
        },        
      },
      deletionProtection: false,
      iamAuthentication: true,
      instances: 1,
      preferredMaintenanceWindow: 'Sat:16:00-Sat:16:30',
      removalPolicy: RemovalPolicy.DESTROY,
      subnetGroup: subnetGroup,
    });
  }
}