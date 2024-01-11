/* eslint-disable no-unused-vars */
import { Button } from '@/shared/components/ui/button';
import { Label } from '@/shared/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/shared/components/ui/radio-group';
import { Switch } from '@/shared/components/ui/switch';
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
  const [selectedOption, setSelectedOption] = useState(1);
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
  }, [save, data]);

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
      <div className="flex items-center space-x-2 mb-6">
        <Switch id="enable-mfa-switch" checked={mfaEnabled} onCheckedChange={handleMfaToggle} />
        <Label htmlFor="enable-mfa-switch">Enable MFA</Label>
      </div>

      {mfaEnabled && (
        <div>
          <div className=" mb-2">
            <div className="text-lg text-gray-600 font-semibold ">MFA methods</div>
            <p className="text-sm text-gray-500">
              Choose how this user receives a One-Time-Password (OTP) when signing in with MFA
            </p>
          </div>

          <RadioGroup
            defaultValue={selectedOption.toString()}
            onValueChange={(value) => {
              handleOptionChange(+value);
            }}
            className="mb-6"
          >
            {getMfaOptions().map((option) => {
              return (
                <div className="flex items-center space-x-2" key={option}>
                  <RadioGroupItem value={option.toString()} id={option.toString()} />
                  <div>
                    <Label htmlFor={option.toString()}>
                      {getMfaDescription(option as MfaOption).title}
                      <p className="text-sm text-gray-500">
                        {getMfaDescription(option as MfaOption).description}
                      </p>
                    </Label>
                  </div>
                </div>
              );
            })}
          </RadioGroup>
        </div>
      )}
      <Button onClick={handleSave}>Save Changes</Button>
    </div>
  );
};

export default MFASetup;
