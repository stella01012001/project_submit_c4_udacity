import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { SignupRequest } from '../../requests/SignupRequest'
import * as AWS from 'aws-sdk'

const cognito = new AWS.CognitoIdentityServiceProvider()
const USER_POOL_ID = process.env.USER_POOL_ID

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        const bodyItem: SignupRequest  = typeof event.body === "string" ? JSON.parse(event.body) : event.body;
        const isValid = validateInput(bodyItem)
        if (!isValid)
            return {
                statusCode: 400,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Credentials': true
                },
                body: JSON.stringify({
                    message: 'Invalid input'
                })
            }

        const { email, password } = JSON.parse(event.body) //bodyItem
        const params = {
            UserPoolId: USER_POOL_ID,
            Username: email,
            UserAttributes: [
                {
                    Name: 'email',
                    Value: email
                },
                {
                    Name: 'email_verified',
                    Value: 'true'
                }],
            MessageAction: 'SUPPRESS'
        }
        const response = await cognito.adminCreateUser(params).promise();
        if (response.User) {
            const paramsForSetPass = {
                Password: password,
                UserPoolId: USER_POOL_ID,
                Username: email,
                Permanent: true
            };
            await cognito.adminSetUserPassword(paramsForSetPass).promise()
        }
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': true
            },
            body: JSON.stringify({
                message: 'User registration successful'
            })
        }
    }
    catch (error) {
        const message = error.message ? error.message : 'Internal server error'
        return {
            statusCode: 500,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': true
            },
            body: JSON.stringify({
                message: message
            })
        }
    }
}

const validateInput = (data: SignupRequest) => {
    const { email, password } = data
    if (!email || !password || password.length < 6)
        return false
    return true
}