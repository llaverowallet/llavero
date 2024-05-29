import { MFAAssociateResponse } from '@/models/user-settings.models';
import {
  CognitoIdentityProviderClient,
  AssociateSoftwareTokenCommand,
  SetUserMFAPreferenceCommand,
  VerifySoftwareTokenCommand,
  GetUserCommand,
  UpdateUserAttributesCommand,
  GetUserAttributeVerificationCodeCommand,
  VerifyUserAttributeCommand,
  AdminUpdateUserAttributesCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import {
  SNSClient,
  CreateSMSSandboxPhoneNumberCommand,
  VerifySMSSandboxPhoneNumberCommand,
  ListSMSSandboxPhoneNumbersCommand,
  SMSSandboxPhoneNumberVerificationStatus,
  SMSSandboxPhoneNumber,
} from '@aws-sdk/client-sns';

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
    return {};
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

export const setEnableSMS = async (accessToken: string) => {
  const client = new CognitoIdentityProviderClient({ region: process.env.NEXT_PUBLIC_REGION });

  const command = new SetUserMFAPreferenceCommand({
    AccessToken: accessToken,
    SMSMfaSettings: {
      Enabled: true,
      PreferredMfa: true,
    },
    SoftwareTokenMfaSettings: {
      Enabled: true,
      PreferredMfa: false,
    },
  });

  try {
    const response = await client.send(command);
    console.log('User MFA preference set successfully:', response);
  } catch (error) {
    console.error('Error setting user MFA preference:', error);
  }
};

/**
 * Verify software token for MFA TOTP
 * @param code - 6 digits code
 * @param accessToken - Cognito access token
 * @param session - Cognito session
 * @returns true if success, false if error
 */
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

/**
 * Check if user has registered MFA TOTP
 * @param accessToken - Cognito access token
 * @returns true if registered, false if not
 */
export const isTOTPRegistered = async (accessToken: string) => {
  if (!accessToken) return false;
  const client = new CognitoIdentityProviderClient({ region: process.env.NEXT_PUBLIC_REGION });
  const command = new GetUserCommand({
    AccessToken: accessToken,
  });

  try {
    const response = await client.send(command);
    console.log('User MFA configuration:', response);
    const isRegistered = response.UserMFASettingList?.some((mfa) => mfa === 'SOFTWARE_TOKEN_MFA');
    return isRegistered || false;
  } catch (error) {
    console.error('Error getting user MFA configuration:', error);
    return false;
  }
};

/**
 * Add SMS to Cognito user
 * @param accessToken - Cognito access token
 * @param phoneNumber - phone number to add
 */
export const addSMSToUser = async (accessToken: string, phoneNumber: string) => {
  const client = new CognitoIdentityProviderClient({ region: process.env.NEXT_PUBLIC_REGION });

  const command = new UpdateUserAttributesCommand({
    AccessToken: accessToken,
    UserAttributes: [
      {
        Name: 'phone_number',
        Value: phoneNumber,
      },
    ],
  });

  const sendCode = new GetUserAttributeVerificationCodeCommand({
    AccessToken: accessToken,
    AttributeName: 'phone_number',
  });
  try {
    const response = await client.send(command);
    console.log(`SMS added to user:`, response);
    const codeResponse = await client.send(sendCode);
    console.log(`SMS verification code sent:`, codeResponse);
  } catch (error) {
    console.error(`Error adding SMS to user:`, error);
  }
};

export const getUserAttributes = async (accessToken: string) => {
  const client = new CognitoIdentityProviderClient({ region: process.env.NEXT_PUBLIC_REGION });

  const command = new GetUserCommand({
    AccessToken: accessToken,
  });

  try {
    const response = await client.send(command);
    return response.UserAttributes || [];
  } catch (error) {
    console.error(`Error getting user attributes:`, error);
    return [];
  }
};

/**
 * Get MFA options for user
 * @param accessToken - Cognito access token
 * crap enums I have to put eslint disable here
 */
export enum MfaOption {
  SMSOnly = 1,
  AuthenticatorAppOnly = 2,
  SMSIfAvailable = 3,
  AuthenticatorAppIfAvailable = 4,
  ChoosePreferredDeliveryMethod = 5,
}

export const getMFaOptions = async (accessToken: string): Promise<MfaOption | undefined> => {
  const client = new CognitoIdentityProviderClient({ region: process.env.NEXT_PUBLIC_REGION });

  const command = new GetUserCommand({
    AccessToken: accessToken,
  });
  try {
    const response = await client.send(command);
    const sms = response.UserMFASettingList?.some((mfa) => mfa === 'SMS_MFA');
    const totp = response.UserMFASettingList?.some((mfa) => mfa === 'SOFTWARE_TOKEN_MFA');
    if (sms && totp && !response.PreferredMfaSetting)
      return MfaOption.ChoosePreferredDeliveryMethod;
    if (sms && (!response.PreferredMfaSetting || response.UserMFASettingList?.length === 1))
      return MfaOption.SMSOnly;
    if (totp && (!response.PreferredMfaSetting || response.UserMFASettingList?.length === 1))
      return MfaOption.AuthenticatorAppOnly;
    if (sms && response.PreferredMfaSetting === 'SMS_MFA') return MfaOption.SMSIfAvailable;
    if (totp && response.PreferredMfaSetting === 'SOFTWARE_TOKEN_MFA')
      return MfaOption.AuthenticatorAppIfAvailable;

    return undefined;
  } catch (error) {
    console.error(`Error getting user attributes:`, error);
    throw error;
  }
};

export const setMFaOption = async (accessToken: string, option: MfaOption) => {
  const client = new CognitoIdentityProviderClient({ region: process.env.NEXT_PUBLIC_REGION });

  const command = new SetUserMFAPreferenceCommand({
    AccessToken: accessToken,
    SMSMfaSettings: {
      Enabled:
        option === MfaOption.SMSIfAvailable ||
        option === MfaOption.SMSOnly ||
        option === MfaOption.AuthenticatorAppIfAvailable,
      PreferredMfa: option === MfaOption.SMSOnly || option === MfaOption.SMSIfAvailable,
    },
    SoftwareTokenMfaSettings: {
      Enabled:
        option === MfaOption.AuthenticatorAppOnly ||
        option === MfaOption.AuthenticatorAppIfAvailable ||
        option === MfaOption.SMSIfAvailable,
      PreferredMfa:
        option === MfaOption.AuthenticatorAppOnly ||
        option === MfaOption.AuthenticatorAppIfAvailable,
    },
  });

  if (option === MfaOption.ChoosePreferredDeliveryMethod) {
    command.input.SMSMfaSettings = {
      Enabled: true,
      PreferredMfa: false,
    };
    command.input.SoftwareTokenMfaSettings = {
      Enabled: true,
      PreferredMfa: false,
    };
  }
  try {
    const response = await client.send(command);
    console.log('User MFA preference set successfully:', response);
  } catch (error) {
    console.error('Error setting user MFA preference:', error);
  }
};

//server-side
/**
 * Add phone number to SNS sandbox
 * @param phoneNumber - phone number to add
 * @returns true if success
 * @throws error if phone number is not valid
 */
export const createSMSPhone = async (phoneNumber: string) => {
  const snsClient = new SNSClient({ region: process.env.NEXT_PUBLIC_REGION });
  const command = new CreateSMSSandboxPhoneNumberCommand({
    PhoneNumber: phoneNumber,
  });

  try {
    await snsClient.send(command);
    return true;
  } catch (error) {
    console.error(`Error adding phone number ${phoneNumber} to SNS sandbox:`, error);
    throw error;
  }
};

///server-side
/**
 * List phone numbers in SNS sandbox
 * @returns list of phone numbers
 */
export const listSandboxSMSPhoneNumbers = async () => {
  const snsClient = new SNSClient({ region: process.env.NEXT_PUBLIC_REGION });
  const command = new ListSMSSandboxPhoneNumbersCommand({});

  try {
    const response = await snsClient.send(command);
    console.log(`Phone numbers in SNS sandbox:`, response);
    return response.PhoneNumbers || [];
  } catch (error) {
    console.error(`Error listing phone numbers in SNS sandbox:`, error);
    return [];
  }
};

///server-side
/**
 * Verify phone number in SNS sandbox
 * @param phoneNumber - phone number to verify
 * @param code - verification code
 */
export const verifySMSSandbox = async (phoneNumber: string, code: string) => {
  const snsClient = new SNSClient({ region: process.env.NEXT_PUBLIC_REGION });

  const command = new VerifySMSSandboxPhoneNumberCommand({
    PhoneNumber: phoneNumber,
    OneTimePassword: code,
  });

  try {
    await snsClient.send(command);
    return true;
  } catch (error) {
    console.error(`Error adding phone number ${phoneNumber} to SNS sandbox:`, error);
    throw error;
  }
};

/**
 * Cognito send code to verify phone number
 * @param accessToken
 * @returns
 */
export const sendCognitoConfirmationCode = async (accessToken: string) => {
  const client = new CognitoIdentityProviderClient({ region: process.env.NEXT_PUBLIC_REGION });

  // Send verification code
  const getCodeCommand = new GetUserAttributeVerificationCodeCommand({
    AccessToken: accessToken,
    AttributeName: 'phone_number',
  });

  try {
    await client.send(getCodeCommand);
    return true;
  } catch (error) {
    console.error(`Error sending verification code to user:`, error);
    throw error;
  }
};

/**
 * Cognito SMS verification code
 * @param accessToken
 * @param verificationCode
 */
export const verifyPhoneNumber = async (accessToken: string, verificationCode: string) => {
  const client = new CognitoIdentityProviderClient({ region: process.env.NEXT_PUBLIC_REGION });

  // Verify phone number
  const verifyCommand = new VerifyUserAttributeCommand({
    AccessToken: accessToken,
    AttributeName: 'phone_number',
    Code: verificationCode,
  });

  try {
    const verifyResponse = await client.send(verifyCommand);
    console.log(`Phone number verified for user Cognito:`, verifyResponse);
    return true;
  } catch (error) {
    console.error(`Error verifying phone number for user:`, error);
  }
  return false;
};

/**
 * Marks the phone_number attribute as verified in Cognito
 * @param accessToken - Cognito access token
 * @returns true if successful
 */
export const markPhoneNumberVerified = async (accessToken: string): Promise<boolean> => {
  const client = new CognitoIdentityProviderClient({ region: process.env.NEXT_PUBLIC_REGION });

  const updateUserAttributesCommand = new AdminUpdateUserAttributesCommand({
    UserPoolId: process.env.NEXT_PUBLIC_USER_POOL_ID,
    Username: accessToken,
    UserAttributes: [
      {
        Name: 'phone_number_verified',
        Value: 'true',
      },
    ],
  });

  try {
    await client.send(updateUserAttributesCommand);
    return true;
  } catch (error) {
    console.error(`Error marking phone number as verified:`, error);
    throw error;
  }
};

//server-side
/**
 * Check if phone number is verified
 * @param accessToken - Cognito access token
 * @returns { phoneNumber: string; verificationPhase: number}
 * verificationPhase: 0 - not verified, 1 - verified in SNS sandbox, 2 - verified in Cognito
 */
export const isPhoneNumberVerified = async (
  accessToken: string,
): Promise<{ phoneNumber: string; verificationPhase: number }> => {
  const attributes = await getUserAttributes(accessToken);
  const phone = attributes.reverse().find((attr) => attr.Name === 'phone_number');
  if (!phone || !phone.Value) throw new Error('Phone number not found');

  const listSmsSandbox = await listSandboxSMSPhoneNumbers();
  const isVerified = listSmsSandbox.some(
    (item: SMSSandboxPhoneNumber) =>
      item.PhoneNumber === phone?.Value &&
      item.Status === SMSSandboxPhoneNumberVerificationStatus.Verified,
  );

  if (!isVerified) return { phoneNumber: phone.Value, verificationPhase: 0 };

  const isVerifiedCognito = attributes
    .reverse()
    .find((attr: { Name: string | undefined }) => attr.Name === 'phone_number_verified');
  console.log('isVerifiedCognito', isVerifiedCognito);
  console.log('attributes', attributes);
  return isVerifiedCognito?.Value === 'true'
    ? { phoneNumber: phone.Value, verificationPhase: 2 }
    : { phoneNumber: phone.Value, verificationPhase: 1 };
};
