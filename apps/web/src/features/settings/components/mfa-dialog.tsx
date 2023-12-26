import { FormEvent, useEffect, useState } from 'react';
import { web3wallet } from '@/shared/utils/walletConnectUtil';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import MFA from './mfa';
import { useSession } from 'next-auth/react';
import { isMFARegistered } from "@/shared/utils/mfa-actions";


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
          <Button>
            {mfaRegistered ? 'Replace MFA' : 'Setup MFA'}
          </Button>
        </DialogTrigger>
        <DialogContent className='max-w-[360px] sm:max-w-[600px]'>
          <DialogHeader>
            <DialogTitle>MFA SETUP</DialogTitle>
            <DialogDescription>Google Authenticator or Authy</DialogDescription>
          </DialogHeader>
            <MFA />
        </DialogContent>
      </Dialog>
    </>
  );
};
