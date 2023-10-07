import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs_patterns from 'aws-cdk-lib/aws-ecs-patterns';
import * as cloudFront from 'aws-cdk-lib/aws-cloudfront';	
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';


export class CdkCloudvaultStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const vpc = new ec2.Vpc(this, 'cloud-wallet-vpc', { maxAzs: 2 });
    const cluster = new ecs.Cluster(this, 'fargate-cluster-autoscaling', { vpc });
    cluster.addCapacity('fargate-autoscaling-capacity', { 
      instanceType: new ec2.InstanceType('t3.micro'),
      minCapacity: 1,
      maxCapacity: 2,
      spotInstanceDraining: true,
    });
    const repository = ecs.RepositoryImage.fromRegistry("public.ecr.aws/elranu/elranu-ecr");
    
    const app = new ecs_patterns.ApplicationLoadBalancedFargateService(this, "FargateService", {
      cluster,
      memoryLimitMiB: 512,
      cpu: 256,
      publicLoadBalancer: false,
      circuitBreaker: { rollback: true },
      taskImageOptions: {
        image: repository,
        containerPort: 3000,
        enableLogging: true,
      },
    });

    const prefix = ec2.Peer.prefixList("pl-3b927c52");
    app.targetGroup.configureHealthCheck({ path: "/api/health" });
    app.loadBalancer.connections.allowTo(prefix, ec2.Port.allTcp(), "Allow CloudFront to access the ALB");
  	const front = new cloudFront.Distribution(this, "cloudVaultDistribution", {

      defaultBehavior: {
        origin: new origins.LoadBalancerV2Origin(app.loadBalancer, {protocolPolicy: cloudFront.OriginProtocolPolicy.HTTP_ONLY }),
        compress: true,
        cachePolicy: cloudFront.CachePolicy.CACHING_OPTIMIZED,
        allowedMethods: cloudFront.AllowedMethods.ALLOW_ALL,
        viewerProtocolPolicy: cloudFront.ViewerProtocolPolicy.ALLOW_ALL,
        originRequestPolicy: new cloudFront.OriginRequestPolicy(this, "cloudVaultOriginRequestPolicy", 
        { queryStringBehavior: cloudFront.OriginRequestQueryStringBehavior.all(), 
          headerBehavior: cloudFront.OriginRequestHeaderBehavior.all(), 
          cookieBehavior: cloudFront.OriginRequestCookieBehavior.all(),
        }),
      },
    });


    new cdk.CfnOutput(this, "cloudVaultDistributionDomainName", { value: front.distributionDomainName });    
  }
}
