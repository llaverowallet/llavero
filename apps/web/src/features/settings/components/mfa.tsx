import { useEffect, useState } from 'react';
import { Input } from '@/shared/components/ui/input';
import { useSession } from 'next-auth/react';
import QRCode from 'react-qr-code';
import {
  associateSoftwareToken,
  setEnableMFA,
  verifySoftwareToken,
} from '@/shared/utils/mfa-actions';
import { Button } from '@/shared/components/ui/button';
import { Copy } from 'lucide-react';
import { CopyToClipboard } from '@/shared/components/ui/copy-to-clipboard';
import { Badge } from '@/shared/components/ui/badge';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { getAccessToken } from '@/shared/utils/general';

const MFA = () => {
  const [secretCode, setSecretCode] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState('');
  const { data } = useSession();
  const [qrUri, setQrUri] = useState('');

  let session: string | undefined = undefined;

  const getTotpCodeURL = (issuer: string, username: string, secret: string): string =>
    encodeURI(`otpauth://totp/${issuer}:${username}?secret=${secret}&issuer=${issuer}`);

  useEffect(() => {
    async function checkMFA() {
      const token = getAccessToken(data);
      const isAssociated = await associateSoftwareToken(token);
      if (isAssociated.SecretCode) {
        setQrUri(getTotpCodeURL('Llavero', data?.user?.email || '', isAssociated.SecretCode || ''));
        setSecretCode(isAssociated.SecretCode);

        session = isAssociated.Session;
      }
    }
    checkMFA();
  }, [data, data?.user?.email]);

  const handleVerifyMFA = async () => {
    const token = getAccessToken(data);
    if (
      verificationCode.length === 6 &&
      (await verifySoftwareToken(verificationCode, token, session))
    ) {
      await setEnableMFA(token);
      setError('');
      setIsVerified(true);
    } else {
      setError('Invalid verification code');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center">
      {!isVerified ? (
        <>
          <div className="mt-6 flex flex-col justify-center gap-2">
            {secretCode ? (
              <>
                <QRCode size={256} className="w-full" value={qrUri || ''} viewBox={`0 0 256 256`} />
                <div className="flex flex-col gap-1 mt-4">
                  <div className="text-left text-sm text-gray-500">Secret Code:</div>
                  <CopyToClipboard textToCopy={secretCode || ''}>
                    <Badge variant="outline" className="flex gap-2 py-2 cursor-pointer">
                      {secretCode || ''} <Copy className="w-4 h-4" />
                    </Badge>
                  </CopyToClipboard>
                </div>
              </>
            ) : (
              <QRSkeleton />
            )}

            <Input
              type="text"
              placeholder="Enter verification code"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              className="border border-gray-300 rounded px-4 py-2"
            />

            <div className="mx-auto">
              <Button disabled={!secretCode} onClick={handleVerifyMFA}>
                Verify MFA
              </Button>
            </div>
          </div>
          {error && (
            <div className="mt-4">
              <p className="text-red-500">{error}</p>
            </div>
          )}
        </>
      ) : (
        <div className="bg-green-200 p-4 rounded">
          <p>Verification successful!</p>
        </div>
      )}
    </div>
  );
};

const QRSkeleton = () => {
  return (
    <div className="grid gap-2">
      <Skeleton className="h-[256px] w-[256px]" />
      <Skeleton className="h-[25px] w-full" />
    </div>
  );
};

export default MFA;
