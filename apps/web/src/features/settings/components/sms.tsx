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

const SMS: React.FC = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [code, setCode] = useState('');
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
      if (phoneNumber.trim() === '') {
        setErrorMessage('Phone number cannot be empty');
        return;
      }
      await createSmsSettings(phoneNumber);
      setIsVerified(false);
      setShowCode(true);
    } catch (error: any) {
      setErrorMessage(error.message);
      setIsVerified(false);
    }
  };

  const handleVerify = async () => {
    try {
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
    } catch (error: any) {
      setErrorMessage(error.message);
      setIsVerified(false);
    }
  };

  const handleModify = () => {
    setIsVerified(false);
  };

  return (
    <div>
      {isVerified ? (
        <div className="flex w-full max-w-sm items-center space-x-2">
          <div>{phoneNumber}</div>
          <Button onClick={handleModify}>Modify SMS</Button>
        </div>
      ) : (
        <div className="flex w-full max-w-sm items-center space-x-2">
          <Label htmlFor="phone">Phone number</Label>
          <Input
            id="phone"
            type="tel"
            placeholder="+1 123 456 7891"
            value={phoneNumber}
            pattern="/^+91(7\d|8\d|9\d)\d{9}$/"
            onChange={(e) => setPhoneNumber(e.target.value)}
          />
          <Button onClick={handleSave}>Save</Button>
        </div>
      )}

      {showCode && (
        <div className="flex w-full max-w-sm items-center space-x-2">
          <Label htmlFor="code">SMS Code</Label>
          <Input
            id="code"
            type="number"
            value={code}
            placeholder="Enter code"
            onChange={(e) => setCode(e.target.value)}
          />
          <Button onClick={handleVerify}>Verify</Button>
          <span> {getDescriptionVerification()}</span>
        </div>
      )}

      {errorMessage && <div>{errorMessage}</div>}
    </div>
  );
};

export default SMS;
