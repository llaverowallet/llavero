import { useEffect, useState } from 'react';
import { Input } from '@/shared/components/ui/input';
import { useSession } from 'next-auth/react';
import QRCode from 'react-qr-code';
import { associateSoftwareToken, setEnableMFA, verifySoftwareToken } from './mfa-actions';


const MFA = () => {
    const [qrCode, setQRCode] = useState('');
    const [secretCode, setSecretCode] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [isVerified, setIsVerified] = useState(false);
    const [error, setError] = useState('');
    const { data } = useSession();
    const [qrUri, setQrUri] = useState('');
    
    let session: string | undefined = undefined;
    
    const getTotpCodeURL = (issuer: string, username: string, secret: string): string =>
        encodeURI(
            `otpauth://totp/${issuer}:${username}?secret=${secret}&issuer=${issuer}`
        );

    useEffect(() => {
        async function checkMFA() { 
            const token = (data as any).accessToken;
            const isAssociated = await associateSoftwareToken(token);
            if (isAssociated.SecretCode) {
                setQrUri(getTotpCodeURL('Llavero', data?.user?.email || "", isAssociated.SecretCode || ""));//;
                setSecretCode(isAssociated.SecretCode);
                // eslint-disable-next-line react-hooks/exhaustive-deps
                session = isAssociated.Session;
            }
        }
        checkMFA();
    }, [data, data?.user?.email]);

    const handleVerifyMFA = async () => {
        const token = (data as any).accessToken;
        if (verificationCode.length === 6 && await verifySoftwareToken(verificationCode, token, session)) {
            await setEnableMFA(token);
            setError('');
            setIsVerified(true);
        } else {
            setError('Invalid verification code');
        }
    };

    return (
        <div className="flex flex-col items-center">
            {!isVerified ? (
                <>
                    <div className="mt-6">
                        {secretCode && (
                            <><QRCode
                                size={256}
                                className='w-full'
                                value={qrUri || ''}
                                viewBox={`0 0 256 256`} />
                                <div>
                                    <p>Secret Code: {secretCode}</p>
                                </div></>
                        )}

                        <Input
                            type="text"
                            placeholder="Enter verification code"
                            value={verificationCode}
                            onChange={(e) => setVerificationCode(e.target.value)}
                            className="border border-gray-300 rounded px-4 py-2"
                        />
                        <button
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ml-2"
                            onClick={handleVerifyMFA}
                        >
                            Verify MFA
                        </button>
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

export default MFA;
