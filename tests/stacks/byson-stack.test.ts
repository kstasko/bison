import { mocked } from 'ts-jest/utils'
import { BysonStack } from '../../lib/byson-stack'
import { Bucket } from 'aws-cdk-lib/aws-s3'
import { App } from 'aws-cdk-lib'

jest.mock('aws-cdk-lib/aws-s3')

const BucketMock = mocked(Bucket, true)

let bysonStack : BysonStack

beforeEach(() => {
    bysonStack = new BysonStack(new App(), 'BysonStack')
})
afterEach(() => {
    jest.clearAllMocks()
})

describe( 'should create an S3Bucket', () => {
    test('with id "BysonStack"', () => {
        const actual = BucketMock.mock.calls[0][1]
        expect(actual).toEqual('BysonBucket')
    })
})