import { Construct } from 'constructs';
import {Stack, StackProps } from 'aws-cdk-lib';
import { AmazonLinuxImage, Instance, InstanceClass, InstanceSize, InstanceType, Vpc }  from 'aws-cdk-lib/aws-ec2';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { BucketDeployment, Source } from 'aws-cdk-lib/aws-s3-deployment'

interface DysonProps extends StackProps {
  encryptBucket?: boolean;
}

export class DysonStack extends Stack {
  constructor(scope: Construct, id: string, props?: DysonProps) {
    super(scope, id, props);

    const bucket = new Bucket(this, 'dyson-bucket');

    new BucketDeployment(this, 'DeployWebsite', {
      sources: [Source.asset('./appcode')],
      destinationBucket: bucket,
    })

    const vpc = new Vpc(this, 'dyson-vpc');

    const instance = new Instance(this, 'dyson-ec2-instance', {
      instanceType: InstanceType.of(InstanceClass.T4G, InstanceSize.MICRO),
      machineImage: new AmazonLinuxImage(),
      vpc: vpc
    });

    bucket.grantRead(instance)

  }
}