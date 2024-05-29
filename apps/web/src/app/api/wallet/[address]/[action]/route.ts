import { NextApiRequest, NextApiResponse } from 'next';
import createLogger from '@/shared/utils/logger';
import { AUTH_OPTIONS } from '@/shared/utils/auth';
import { getServerSession } from 'next-auth';
import personalSign from '../../services/personal-sign';
import ethSendTransaction from '../../services/eth-send-tx';
import ethSignTransaction from '../../services/eth-sign-tx';
import { verifySoftwareToken, isTOTPRegistered } from '@/shared/utils/mfa-actions';
import { getAccessToken } from '@/shared/utils/general';
import signTypedData from '../../services/eth-sign-typed';
import { TypedData } from '@/models/interfaces';

const logger = createLogger('wallet-endpoint');

type WalletAction =
  | 'personal-sign'
  | 'eth-send-transaction'
  | 'eth-sign-transaction'
  | 'sign-typed-data';

export async function POST(
  request: NextApiRequest,
  response: NextApiResponse,
  { params }: { params: { address: string; action: WalletAction } },
) {
  try {
    const session = await getServerSession(AUTH_OPTIONS);
    if (!session || !session?.user?.email)
      return response.status(401).json({ message: 'Not authorized' });

    const { address, action } = params || {};
    const body: {
      transaction: string;
      chainId: string;
      message: string;
      mfaCode: string;
      typedData: TypedData;
    } = await request.body;
    const { transaction, chainId, message, typedData, mfaCode } = body || {};

    const token = getAccessToken(session);
    if (await isTOTPRegistered(token)) {
      if (!mfaCode) {
        return response.status(401).json({ message: 'MFA code required' });
      }
      if (!(await verifySoftwareToken(mfaCode, token))) {
        return response.status(401).json({ message: 'Invalid MFA code' });
      }
    }

    switch (action) {
      case 'personal-sign':
        return response.json(await personalSign(session?.user?.email, address, message));
      case 'eth-send-transaction':
        return response.json(
          await ethSendTransaction(session?.user?.email, address, transaction, chainId),
        );
      case 'eth-sign-transaction':
        return response.json(
          await ethSignTransaction(session?.user?.email, address, transaction, chainId),
        );
      case 'sign-typed-data':
        return response.json(await signTypedData(session?.user?.email, address, typedData));
      default:
        console.log('default action:', action);
        throw new Error('Invalid Wallet action for POST HTTP method');
    }
  } catch (error) {
    logger.error(error);
    return response.status(500).json({ error: 'Internal Server Error' });
  }
}

/**
 * endpoints
 * /wallet/list
 * /wallet/create
 * /wallet/[addr]/update
 * /wallet/[addr]/get
 * /wallet/[addr]/delete
 * /wallet/[addr]/personalSign
 * /wallet/[addr]/ethSendTransaction
 * /wallet/[addr]/ethSignTransaction
 * @param
 * @returns
 */
