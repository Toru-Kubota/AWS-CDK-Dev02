import { Stack, StackProps } from 'aws-cdk-lib';
import { Vpc } from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ecsp from 'aws-cdk-lib/aws-ecs-patterns';
import * as route53 from 'aws-cdk-lib/aws-route53';

//VpcStackの変数を扱えるようにする
interface SubStackProps extends StackProps {
  vpc: Vpc;
};

export class EcsStack extends Stack {

  //SubStackPropsを使用する
  constructor(scope: Construct, id: string, props: SubStackProps) {
    super(scope, id, props);
    
    //変数設定
    const ecs_vpc = props.vpc;
    const domain_name = 'DOMAIN_NAME'

    //Domain名設定
    const domainZone = route53.HostedZone.fromLookup(this, 'Zone', {
      domainName: 'DOMAIN_ZONE'
    });

    //Cluster設定
    const cluster = new ecs.Cluster(this, 'Cluster', {
      clusterName: 'WebApp01-Cluster',
      vpc: ecs_vpc,
    })

    //ELB+Fargate設定
    new ecsp.ApplicationLoadBalancedFargateService(this, 'WebApp01', {
      cluster,
      domainName: domain_name,
      domainZone,
      memoryLimitMiB: 512,
      desiredCount: 2,
      cpu: 256,
      assignPublicIp: true,
      loadBalancerName: 'WebApp01-lb01',
      publicLoadBalancer: true,
      taskImageOptions: {
        image: ecs.ContainerImage.fromRegistry('nginx'),
      },
    });
  }
};