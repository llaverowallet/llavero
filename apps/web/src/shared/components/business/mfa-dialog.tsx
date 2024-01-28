import { Button } from '@/shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { getAccessToken } from '@/shared/utils/general';
import { isTOTPRegistered } from '@/shared/utils/mfa-actions';
import { useSession } from 'next-auth/react';
import React, { FC, useEffect, useMemo, useState } from 'react';

interface MfaDialogProps {
  open: boolean;
  onSubmit: (mfaCode: string) => void;
}

export const MfaDialog: FC<MfaDialogProps> = ({ open, onSubmit }) => {
  const [mfaCode, setMfaCode] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [mfaRegistered, setMFARegistered] = useState<boolean>(false);
  const { data, status } = useSession();
  const isAuthenticated = status === 'authenticated';

  const handleSubmit = () => {
    setIsDialogOpen(false);
    onSubmit(mfaCode);
  };

  useEffect(() => {
    const checkMFA = async () => {
      const token = getAccessToken(data);
      setMFARegistered(await isTOTPRegistered(token));
    };

    checkMFA();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  useMemo(() => {
    if (open) {
      if (mfaRegistered) {
        setIsDialogOpen(true);
      } else {
        handleSubmit();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, mfaRegistered]);

  return (
    <Dialog open={isDialogOpen}>
      <DialogContent className="max-w-[360px] sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Multi-Factor Authentication:</DialogTitle>
          <DialogDescription>Insert you MFA Code</DialogDescription>
        </DialogHeader>

        <div>
          <Label htmlFor="mfaCode">MFA Code:</Label>
          <Input
            name="mfaCode"
            className="w-full mb-1"
            value={mfaCode}
            onChange={(e) => setMfaCode(e.target.value)}
          />
        </div>

        <DialogFooter className="mt-4">
          <Button type="button" onClick={handleSubmit}>
            Validate
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
