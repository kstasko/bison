import { Construct } from 'constructs';
import {Stack, StackProps } from 'aws-cdk-lib';
import { AmazonLinuxGeneration, AmazonLinuxImage, AmazonLinuxCpuType, Instance, InstanceClass, InstanceSize, InstanceType, MachineImage, Peer, Port, SubnetType, SecurityGroup, UserData, Vpc }  from 'aws-cdk-lib/aws-ec2';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { BucketDeployment, Source } from 'aws-cdk-lib/aws-s3-deployment'
import { Asset } from 'aws-cdk-lib/aws-s3-assets'


interface DysonProps extends StackProps {}

export class DysonStack extends Stack {
  constructor(scope: Construct, id: string, props?: DysonProps) {
    super(scope, id, props);

    // STORAGE //////////////////////
    ////////////////////////////////
    const bucket = new Bucket(this, 'dyson-bucket');

    new BucketDeployment(this, 'dyson-deploy', {
      sources: [Source.asset('./appcode')],
      destinationBucket: bucket,
    })

    // EC2 Instance /////////////////
    ////////////////////////////////
    const vpc = new Vpc(this, 'dyson-vpc', {
      cidr: '10.0.0.0/16',
      natGateways: 0,
      subnetConfiguration: [
        {name: 'public', cidrMask: 24, subnetType: SubnetType.PUBLIC}
      ],
    });

    const securityGroup = new SecurityGroup(this, 'SecurityGroup', {
      vpc,
      description: 'Allow ssh access to ec2 instances',
      allowAllOutbound: true,
      disableInlineRules: true
    });

    //This adds the rule as an external cloud formation construct
    securityGroup.addIngressRule(
      Peer.anyIpv4(),
      Port.tcp(22), 
      'allow ssh access from the world'
      );

    const ami = new AmazonLinuxImage({
      generation: AmazonLinuxGeneration.AMAZON_LINUX_2,
      cpuType: AmazonLinuxCpuType.ARM_64
    });

    const instance = new Instance(this, 'dyson-ec2-instance', {
      instanceType: InstanceType.of(InstanceClass.T4G, InstanceSize.MICRO),
      machineImage: ami,
      vpc: vpc,
      securityGroup: securityGroup
    });

    // EC2 INSTANCE CONFIGURATION ///
    ////////////////////////////////

    bucket.grantRead(instance.role)

    const dysonAsset = new Asset(this, 'dyson-appcode-asset', {
      path:'./appcode/'
    })

    instance.userData.addS3DownloadCommand({
      bucket: bucket,
      bucketKey: dysonAsset.s3ObjectKey
    })

    instance.userData.addCommands('cd ./ec2/; bash configure.sh')

  }
}