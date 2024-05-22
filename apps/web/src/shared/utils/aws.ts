import { SSMClient, GetParameterCommand } from '@aws-sdk/client-ssm';
import {
  CognitoIdentityProviderClient,
  DescribeUserPoolCommand,
  UpdateUserPoolClientCommand,
  UpdateUserPoolCommand,
  UpdateUserPoolCommandInput,
} from '@aws-sdk/client-cognito-identity-provider';

export async function getParameterValue(name: string): Promise<string> {
  const ssmClient = new SSMClient({ region: 'us-east-1' });
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

export async function updateUserPoolClientCallbackUrl(
  clientId: string,
  userPoolId: string,
  callbackUrl: string,
  logoutURL: string,
): Promise<void> {
  const cognitoClient = new CognitoIdentityProviderClient({ region: 'us-east-1' });

  const command = new UpdateUserPoolClientCommand({
    ClientId: clientId,
    UserPoolId: userPoolId,
    CallbackURLs: [callbackUrl],
    LogoutURLs: [logoutURL],
    AllowedOAuthScopes: ['email', 'openid', 'profile', 'aws.cognito.signin.user.admin'],
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

export async function updateInviteMessageTemplate(url: string, userPoolId: string) {
  const client = new CognitoIdentityProviderClient({ region: 'us-east-1' });
  // const usrPoolData = await getUserPoolData(userPoolId);
  // if(!usrPoolData || !usrPoolData.SmsConfiguration) throw new Error("User Pool not found");

  const params: UpdateUserPoolCommandInput = {
    UserPoolId: userPoolId,
    AccountRecoverySetting: {
      RecoveryMechanisms: [
        { Name: 'verified_email', Priority: 1 },
        { Name: 'verified_phone_number', Priority: 2 },
      ],
    },
    AdminCreateUserConfig: {
      InviteMessageTemplate: {
        EmailMessage: `Llavero has been created at: ${url} Your username is {username} and temporary password is {####}`,
        EmailSubject: 'Llavero: Your temporary password',
        SMSMessage: `Your username is {username} and temporary password is {####} - Llavero: ${url}`,
      },
      AllowAdminCreateUserOnly: true,
    },
    EmailVerificationMessage: `Your verification code is {####} - Llavero url: ${url}`,
    EmailVerificationSubject: 'Your verification code',
    VerificationMessageTemplate: {
      //DefaultEmailOption: "CONFIRM_WITH_LINK",
      EmailMessage: `Your verification code is {####} - Llavero url: ${url}`,
      EmailSubject: 'Llavero: Your verification code',
      SmsMessage: `Your verification code is {####} - Llavero url: ${url}`,
    },
    SmsVerificationMessage: `Your verification code is {####} - Llavero url: ${url}`,
    SmsAuthenticationMessage: `Your authentication code is {####} - Llavero url: ${url}`,
    AutoVerifiedAttributes: ['email'],
  };

  const command = new UpdateUserPoolCommand(params);

  await client
    .send(command)
    .then(() => {
      console.log('User Pool updated successfully');
    })
    .catch((error) => {
      console.error('An error occurred while updating the User Pool', error);
      throw error;
    });
}

export async function getUserPoolData(userPoolId: string) {
  // eslint-disable-next-line no-useless-catch
  try {
    const client = new CognitoIdentityProviderClient({ region: 'us-east-1' });

    const params = {
      UserPoolId: userPoolId,
    };

    const command = new DescribeUserPoolCommand(params);

    const result = await client.send(command);
    if (result.UserPool) {
      return result.UserPool;
    }
    return undefined;
  } catch (error) {
    throw error;
  }
}
