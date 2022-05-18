// TODO: Once your application is deployed, copy an API id here so that the frontend could interact with it
const apiId = 'pfv2nnvm21'
export const apiEndpoint = `https://${apiId}.execute-api.ap-southeast-1.amazonaws.com/dev`

export const authConfig = {
  // TODO: Create an Auth0 application and copy values from it into this map. For example:
  // domain: 'dev-nd9990-p4.us.auth0.com',
  domain: 'dev-utberqls.us.auth0.com',            // Auth0 domain
  clientId: 'cVmL2hUeADm3y7HzH62g8dJzpVhdDEh4',          // Auth0 client id
  callbackUrl: 'http://localhost:3000/callback'
}
