import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { LoginRequest } from '../../requests/LoginRequest'
import * as AWS from 'aws-sdk'

const cognito = new AWS.CognitoIdentityServiceProvider()

const USER_POOL_ID = process.env.USER_POOL_ID
const CLIENT_ID = process.env.CLIENT_ID

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        const bodyItem: LoginRequest  = typeof event.body === "string" ? JSON.parse(event.body) : event.body;
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
            AuthFlow: "ADMIN_NO_SRP_AUTH",
            UserPoolId: USER_POOL_ID,
            ClientId: CLIENT_ID,
            AuthParameters: {
                USERNAME: email,
                PASSWORD: password
            }
        }
        const response = await cognito.adminInitiateAuth(params).promise()
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': true
            },
            body: JSON.stringify({
                message: 'Success',
                token: response.AuthenticationResult.IdToken
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

const validateInput = (data: LoginRequest) => {
    const { email, password } = data
    if (!email || !password || password.length < 6)
        return false
    return true
}
