import { Input } from '@/shared/components/ui/input';
import { useSession } from 'next-auth/react';
import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/shared/components/ui/button';
import {
  createSmsSettings,
  verifySmsSettings,
  isSMSSetup,
  verifySmsSettings2,
  sendCode2,
} from '@/shared/services/user.service';
import { Label } from '@/shared/components/ui/label';
import { isMobilePhone } from 'validator';

const SMS: React.FC = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [code, setCode] = useState('');
  const [isSaveLoading, setIsSaveLoading] = useState(false);
  const [isVerifyLoading, setIsVerifyLoading] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [firstVerificationDone, setFirstVerificationDone] = useState(false);
  const { data } = useSession();
  const verificationPhase = useRef(0);

  const getDescriptionVerification = () => {
    if (!firstVerificationDone) {
      return 'You will get two SMS codes. Enter the first code you received via SMS ';
    }
    return 'Enter the code you received via SMS';
  };

  useEffect(() => {
    const checkSMS = async () => {
      const phoneVerified = await isSMSSetup();
      if (phoneVerified.verificationPhase === 2) {
        setIsVerified(true);
        setPhoneNumber(phoneVerified?.phoneNumber);
        verificationPhase.current = 2;
      } else if (phoneVerified.verificationPhase === 1) {
        verificationPhase.current = 1;
        setPhoneNumber(phoneVerified?.phoneNumber);
        setFirstVerificationDone(true);
      }
    };

    checkSMS();
  }, [data, data?.user?.email]);

  const handleSave = async () => {
    try {
      setIsSaveLoading(true);

      if (!phoneNumber) {
        setErrorMessage('Phone number cannot be empty');
        return;
      }

      if (!isMobilePhone(phoneNumber, undefined, { strictMode: true })) {
        setErrorMessage('Phone number is not valid');
        return;
      }

      await createSmsSettings(phoneNumber);
      setIsVerified(false);
      setShowCode(true);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      setErrorMessage(error.message);
      setIsVerified(false);
    } finally {
      setIsSaveLoading(false);
    }
  };

  const handleVerify = async () => {
    try {
      setIsVerifyLoading(true);

      if (code.trim() === '') {
        setErrorMessage('Verification code cannot be empty');
        return;
      }

      if (!firstVerificationDone) {
        await verifySmsSettings(phoneNumber, code);
        verificationPhase.current = 1;
        await sendCode2();
        setFirstVerificationDone(true);
      } else {
        await verifySmsSettings2(phoneNumber, code);
        setIsVerified(true);
        setShowCode(false);
      }
      setErrorMessage('');
      setCode('');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      setErrorMessage(error.message);
      setIsVerified(false);
    } finally {
      setIsVerifyLoading(false);
    }
  };

  const handleModify = () => {
    setIsVerified(false);
  };

  return (
    <div className="w-full flex flex-col gap-4">
      {isVerified ? (
        <div className="flex gap-4 items-center">
          <div>{phoneNumber}</div>
          <Button onClick={handleModify}>Modify SMS</Button>
        </div>
      ) : (
        <div className="flex gap-4 items-center">
          <Label htmlFor="phone">Phone number</Label>
          <Input
            id="phone"
            type="tel"
            placeholder="+11234567891"
            value={phoneNumber}
            pattern="/^+91(7\d|8\d|9\d)\d{9}$/"
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="max-w-xs"
          />
          <Button onClick={handleSave} disabled={isSaveLoading}>
            {isSaveLoading ? 'Saving' : 'Save'}
          </Button>
        </div>
      )}

      {showCode && (
        <div className="flex gap-4 items-center">
          <Label htmlFor="code">SMS Code</Label>
          <Input
            id="code"
            type="number"
            value={code}
            placeholder="Enter code"
            onChange={(e) => setCode(e.target.value)}
            className="max-w-xs"
          />
          <Button onClick={handleVerify} disabled={isVerifyLoading}>
            {isVerifyLoading ? 'Verifying' : 'Verify'}
          </Button>
          <span className="text-gray-500 text-xs"> {getDescriptionVerification()}</span>
        </div>
      )}

      {errorMessage && <div className="text-sm text-red-500">{errorMessage}</div>}
    </div>
  );
};

export default SMS;
