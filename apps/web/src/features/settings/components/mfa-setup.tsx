/* eslint-disable no-unused-vars */
import { Button } from '@/shared/components/ui/button';
import { MfaOption, getMFaOptions, setMFaOption } from '@/shared/utils/mfa-actions';
import { useSession } from 'next-auth/react';
import React, { useEffect, useState } from 'react';

const getMfaDescription = (option: MfaOption) => {
  const optMFa = option as MfaOption;
  if (optMFa === MfaOption.SMSOnly)
    return {
      title: 'SMS only',
      description: 'You will receive a SMS code to verify your identity',
    };
  else if (optMFa == MfaOption.AuthenticatorAppOnly)
    return {
      title: 'Authenticator app only',
      description: 'You will use an authenticator app to verify your identity',
    };
  else if (optMFa == MfaOption.SMSIfAvailable)
    return {
      title: 'SMS if available, otherwise authenticator app',
      description:
        'You will receive a SMS code to verify your identity if you have a phone number associated with your account',
    };
  else if (optMFa == MfaOption.AuthenticatorAppIfAvailable)
    return {
      title: 'Authenticator app if available, otherwise SMS',
      description:
        'You will use an authenticator app to verify your identity if you have a phone number associated with your account',
    };
  else if (optMFa == MfaOption.ChoosePreferredDeliveryMethod)
    return {
      title: 'Choose preferred delivery method',
      description: 'You will choose your preferred delivery method',
    };
  return { title: 'e', description: 'aaa' };
};

const getMfaOptions = (): MfaOption[] => {
  return Object.values(MfaOption)
    .filter((value) => typeof value === 'number')
    .map((value) => value as MfaOption);
};

const MFASetup: React.FC = () => {
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [selectedOption, setSelectedOption] = useState<MfaOption | null>(null);
  const [save, setSave] = useState(false);
  const { data } = useSession();

  useEffect(() => {
    const getMFAConfiguration = async () => {
      const token = (data as any).accessToken;
      const option = await getMFaOptions(token);
      if (option) {
        setSelectedOption(option);
        setMfaEnabled(true);
      } else {
        setMfaEnabled(false);
      }
      setSave(false);
    };
    getMFAConfiguration();
  }, [save]);
  const handleMfaToggle = () => {
    setMfaEnabled(!mfaEnabled);
  };

  const handleOptionChange = (option: MfaOption) => {
    setSelectedOption(option);
  };

  const handleSave = async () => {
    await setMFaOption((data as any).accessToken, selectedOption as MfaOption);
    setSave(true);
  };

  return (
    <div>
      <label>
        <input type="checkbox" checked={mfaEnabled} onChange={handleMfaToggle} />
        Enable MFA
      </label>

      {mfaEnabled && (
        <div>
          <h3>Select MFA Option:</h3>
          <ul>
            {getMfaOptions().map((option) => {
              return (
                <li key={option}>
                  <label>
                    <input
                      type="radio"
                      value={option}
                      checked={selectedOption === option}
                      onChange={() => handleOptionChange(option as MfaOption)}
                    />
                    {getMfaDescription(option as MfaOption).title}
                  </label>
                  <p>{getMfaDescription(option as MfaOption).description}</p>
                </li>
              );
            })}
          </ul>
        </div>
      )}
      <Button onClick={handleSave}>Save</Button>
    </div>
  );
};

export default MFASetup;
