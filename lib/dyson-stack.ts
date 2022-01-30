import { Construct } from 'constructs';
import {Stack, StackProps } from 'aws-cdk-lib';
import { Bucket } from 'aws-cdk-lib/aws-s3'

interface DysonProps extends StackProps {
  encryptBucket?: boolean;
}

export class DysonStack extends Stack {
  constructor(scope: Construct, id: string, props?: DysonProps) {
    super(scope, id, props);

    const bucket = new Bucket(this, 'MyFirstBucket');
  }
}