/* eslint-disable @next/next/no-img-element */
import { FormEvent, useState } from 'react';
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
import { Input } from '@/shared/components/ui/input';
import WalletConnectLogo from '@/shared/assets/wallet-connect-logo.png';

const WalletConnectDialog = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleConnect = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const target = e.currentTarget;
    const formData = new FormData(target);
    const { uri } = Object.fromEntries(formData) as { uri: string };

    if (!uri) return;

    try {
      setIsLoading(true);
      await web3wallet.pair({ uri, activatePairing: true });
      console.log('Connected to WalletConnect');
    } catch (error: unknown) {
      console.error((error as Error).message, 'error');
    } finally {
      setIsLoading(false);
      setIsOpen(false);
      target.reset();
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <img
            src={WalletConnectLogo.src}
            alt="Wallet Connect logo"
            className="h-8 w-8 cursor-pointer"
          />
        </DialogTrigger>
        <DialogContent className="max-w-[360px] sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>WalletConnect</DialogTitle>
            <DialogDescription>Use WalletConnect uri</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleConnect}>
            <div className="flex flex-col gap-4 py-4">
              <div>
                <Input name="uri" placeholder="e.g. wc:a281567bb3e4..." className="w-full" />
              </div>
            </div>

            <DialogFooter className="mt-4">
              <Button type="submit"> {isLoading ? 'Loading...' : 'Connect'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export { WalletConnectDialog };
