import { MFAAssociateResponse } from '@/models/user-settings.models';
import {
  CognitoIdentityProviderClient,
  AssociateSoftwareTokenCommand,
  SetUserMFAPreferenceCommand,
  VerifySoftwareTokenCommand,
  GetUserCommand,
} from '@aws-sdk/client-cognito-identity-provider';

export const associateSoftwareToken = async (
  accessToken?: string,
  session?: string,
): Promise<MFAAssociateResponse> => {
  const client = new CognitoIdentityProviderClient({ region: process.env.NEXT_PUBLIC_REGION });

  const command = new AssociateSoftwareTokenCommand({
    AccessToken: accessToken,
    Session: session,
  });

  try {
    const response = await client.send(command);
    return response;
  } catch (error) {
    console.error('Error associating software token:', error);
    return {}; //SecretCode: "", Session: ""
  }
};

export const setEnableMFA = async (accessToken: string) => {
  const client = new CognitoIdentityProviderClient({ region: process.env.NEXT_PUBLIC_REGION });

  const command = new SetUserMFAPreferenceCommand({
    AccessToken: accessToken,
    SMSMfaSettings: {
      Enabled: true,
      PreferredMfa: false,
    },
    SoftwareTokenMfaSettings: {
      Enabled: true,
      PreferredMfa: true,
    },
  });

  try {
    const response = await client.send(command);
    console.log('User MFA preference set successfully:', response);
  } catch (error) {
    console.error('Error setting user MFA preference:', error);
  }
};

export const verifySoftwareToken = async (code: string, accessToken?: string, session?: string) => {
  try {
    if (!code || code.length !== 6) throw new Error('Invalid code: code must be 6 digits');
    console.log('code', code);
    const client = new CognitoIdentityProviderClient({ region: process.env.NEXT_PUBLIC_REGION });

    const command = new VerifySoftwareTokenCommand({
      AccessToken: accessToken,
      Session: session,
      UserCode: code,
    });

    const response = await client.send(command);
    if (response.Status !== 'SUCCESS') {
      throw new Error('Error verifying software token');
    }
    return true;
  } catch (error) {
    console.error('Error verifying software token:', error);
    return false;
  }
};

export const isMFARegistered = async (accessToken: string) => {
  const client = new CognitoIdentityProviderClient({ region: process.env.NEXT_PUBLIC_REGION });

  const command = new GetUserCommand({
    AccessToken: accessToken,
  });

  try {
    const response = await client.send(command);
    const isRegistered = response.UserMFASettingList?.some((mfa) => mfa === 'SOFTWARE_TOKEN_MFA');
    return isRegistered || false;
  } catch (error) {
    console.error('Error getting user MFA configuration:', error);
    return false;
  }
};
