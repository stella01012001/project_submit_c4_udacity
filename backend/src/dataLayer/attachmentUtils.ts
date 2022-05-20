import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { CreateSignedURLRequest } from '../requests/CreateSignedURLRequest';

const XAWS = AWSXRay.captureAWS(AWS)

// TODO: Implement the fileStogare logic

export class TodosStorage {
    constructor(
        private readonly s3 = new XAWS.S3({ signatureVersion: 'v4'})
    ) {}


    getPresignedUploadURL(createSignedUrlRequest: CreateSignedURLRequest) {
        return this.s3.getSignedUrl('putObject', createSignedUrlRequest);
    }
}