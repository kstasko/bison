import { Construct } from 'constructs'
import { Stack, StackProps } from 'aws-cdk-lib'
import { AmazonLinuxGeneration, 
  AmazonLinuxImage,
  AmazonLinuxCpuType,
  Instance,
  InstanceClass,
  InstanceSize,
  InstanceType,
  Peer,
  Port,
  SubnetType,
  SecurityGroup,
  Vpc } from 'aws-cdk-lib/aws-ec2'
import { Role, ServicePrincipal } from 'aws-cdk-lib/aws-iam'
// import { Asset } from 'aws-cdk-lib/aws-s3-assets'
import { Bucket } from 'aws-cdk-lib/aws-s3'
import { BucketDeployment, Source } from 'aws-cdk-lib/aws-s3-deployment'
interface BysonProps extends StackProps {}


export class BysonStack extends Stack {
  constructor (scope: Construct, id: string, props?: BysonProps) {
    super(scope, id, props)

    const s3bucket = new Bucket(this, 'BysonBucket', {
      bucketName: `byson-${this.account}-${this.region}`
    })
    
    new BucketDeployment(this, 'BysonBucketDeployment', {
      sources: [Source.asset('./appcode')],
      destinationBucket: s3bucket
    })

    const vpc = new Vpc(this, 'BysonVpc', {
      cidr: '10.0.0.0/16',
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: 'Public',
          subnetType: SubnetType.PUBLIC
        }
      ]
    })

    const ec2Role = new Role(this, 'BysonEc2Role', {
      assumedBy: new ServicePrincipal('ec2.amazonaws.com'),
      description: 'Byson Ec2 Role',
    });

    const securityGroup = new SecurityGroup(this, 'BysonSecurityGroup', {
      vpc,
      description: 'allow ssh access to ec2 instances',
      allowAllOutbound: true
    })

    securityGroup.addIngressRule(
      Peer.anyIpv4(),
      Port.tcp(22),
      'allow ssh access from the world'
    )

    const ami = new AmazonLinuxImage({
      generation: AmazonLinuxGeneration.AMAZON_LINUX_2,
      cpuType: AmazonLinuxCpuType.ARM_64
    })

    const instance = new Instance(this, 'BysonEc2Instance', {
      instanceType: InstanceType.of(InstanceClass.T4G, InstanceSize.MICRO),
      machineImage: ami,
      role: ec2Role,
      vpc: vpc,
      vpcSubnets: {
        subnetType: SubnetType.PUBLIC
      },
      securityGroup: securityGroup
    })

    s3bucket.grantRead(instance.role)

    // const bysonAsset = new Asset(this, 'BysonAssetAppcode', {
    //   path: './appcode/'
    // })

    // instance.userData.addExecuteFileCommand({
    //   filePath: './appcode/configure.sh'
    // })
  }
}





