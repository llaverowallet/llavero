import { SSMClient, GetParameterCommand } from '@aws-sdk/client-ssm';
import { CognitoIdentityProviderClient, UpdateUserPoolClientCommand } from '@aws-sdk/client-cognito-identity-provider';

export async function getParameterValue(name: string): Promise<string> {
    const ssmClient = new SSMClient({ region: 'us-east-1' }); // Replace REGION with your AWS region
    const command = new GetParameterCommand({
        Name: name,
        WithDecryption: true, // Set this to false if you're storing a non-sensitive value
    });

    try {
        const response = await ssmClient.send(command);
        return response.Parameter?.Value ?? '';
    } catch (error) {
        console.error(`Error getting parameter ${name}: ${error}`);
        throw error;
    }
}


export async function updateUserPoolClientCallbackUrl(clientId: string, userPoolId: string,callbackUrl: string): Promise<void> {
    const cognitoClient = new CognitoIdentityProviderClient({ region: 'us-east-1' }); // Replace REGION with your AWS region

    const command = new UpdateUserPoolClientCommand({
        ClientId: clientId,
        UserPoolId: userPoolId,
        CallbackURLs: [callbackUrl],
        AllowedOAuthScopes: ['email', 'openid'],
        AllowedOAuthFlows: ['code'],
        SupportedIdentityProviders: ['COGNITO'],
        AllowedOAuthFlowsUserPoolClient: true,
    });

    try {
        await cognitoClient.send(command);
    } catch (error) {
        console.error(`Error updating user pool client ${clientId} callback URL: ${error}`);
        throw error;
    }
}

