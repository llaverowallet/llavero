import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import MFA from './mfa';
import { useSession } from 'next-auth/react';
import { isMFARegistered } from '@/shared/utils/mfa-actions';

export const MFADialog = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { data } = useSession();
  const [mfaRegistered, setMFARegistered] = useState<boolean>(false);

  useEffect(() => {
    const checkMFA = async () => {
      const token = (data as any).accessToken;
      setMFARegistered(await isMFARegistered(token));
    };
    checkMFA();
  }, [data, data?.user?.email]);

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <div>
            <Button aria-label="Multi-Factor Authentication">
              {mfaRegistered ? 'Replace MFA' : 'Setup MFA'}
            </Button>
          </div>
        </DialogTrigger>
        <DialogContent className="max-w-[360px] sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Multi-Factor Authentication Setup</DialogTitle>
            <DialogDescription>Use Google Authenticator or Authy app</DialogDescription>
          </DialogHeader>
          <MFA />
        </DialogContent>
      </Dialog>
    </>
  );
};
