import { NextApiRequest, NextApiResponse } from 'next';
import createLogger from '@/shared/utils/logger';
import { AUTH_OPTIONS } from '@/shared/utils/auth';
import { getServerSession } from 'next-auth';
import {
  addSMSToUser,
  createSMSPhone,
  isPhoneNumberVerified,
  sendCognitoConfirmationCode,
  verifyPhoneNumber,
  verifySMSSandbox,
} from '@/shared/utils/mfa-actions';
import { getAccessToken } from '@/shared/utils/general';

const logger = createLogger('settings-endpoint');

type SettingsAction = 'create-sms' | 'verify-sms' | 'is-sms-setup' | 'verify-sms-2' | 'send-code2';

export async function POST(
  request: NextApiRequest,
  response: NextApiResponse,
  { params }: { params: { action: SettingsAction } },
) {
  try {
    const session = await getServerSession(AUTH_OPTIONS);
    if (!session || !session?.user?.email)
      return response.status(401).json({ message: 'Not authorized' });

    const { action } = params || {};
    const body: { smsSettings?: { phoneNumber: string; code: string } } = await request.body;
    const { smsSettings } = body || {};

    const token = getAccessToken(session);

    switch (action) {
      case 'create-sms':
        if (!smsSettings?.phoneNumber)
          return response.status(400).json({ message: 'Missing phone number' });
        console.log('creating sms phone number:', smsSettings.phoneNumber);
        await createSMSPhone(smsSettings?.phoneNumber);
        console.log('adding sms phone number to Cognito:', smsSettings.phoneNumber);
        await addSMSToUser(token, smsSettings.phoneNumber);
        return response.json({ message: 'SMS code sent' });
      case 'verify-sms':
        if (!smsSettings?.phoneNumber)
          return response.status(400).json({ message: 'Missing phone number' });
        if (!smsSettings?.code) return response.status(400).json({ message: 'Missing MFA code' });
        console.log('verifying sms phone number:', smsSettings.phoneNumber);
        await verifySMSSandbox(smsSettings.phoneNumber, smsSettings.code);
        return response.json({ message: 'MFA code verified' });
      case 'is-sms-setup':
        // eslint-disable-next-line no-case-declarations
        const phone = await isPhoneNumberVerified(token);
        return response.json(phone);
      case 'send-code2':
        await sendCognitoConfirmationCode(token);
        return response.json({ message: 'SMS code sent' });
      case 'verify-sms-2':
        if (!smsSettings?.phoneNumber)
          return response.status(400).json({ message: 'Missing phone number' });
        if (!smsSettings?.code) return response.status(400).json({ message: 'Missing MFA code' });
        console.log('verifying sms phone number cognito:', smsSettings.phoneNumber);
        await verifyPhoneNumber(token, smsSettings.code);
        return response.json({ message: 'MFA code verified' });
      default:
        console.log('default action:', action);
        throw new Error('Invalid Settings action for POST HTTP method');
    }
  } catch (error) {
    logger.error(error);
    return response.status(500).json({ error: 'Internal Server Error' });
  }
}
