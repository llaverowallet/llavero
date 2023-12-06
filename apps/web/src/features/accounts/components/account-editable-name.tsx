import React, { FormEvent, useState } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Pencil } from 'lucide-react';
import { Input } from '@/shared/components/ui/input';
import { useMutation, useMutationState, useQueryClient } from '@tanstack/react-query';
import { useRef } from 'react';
import { useToast } from '@/shared/hooks/use-toast';
import { useNetwork } from '@/shared/hooks/use-network';
import { WalletInfo } from '@/models/interfaces';

const updateKey = async ({
  address,
  name,
}: {
  address: string;
  name: string;
}): Promise<{
  status: string;
  message: string;
}> => {
  const response = await fetch(`api/accounts/${address}`, {
    method: 'PATCH', // PUT (update all fields) or PATCH (update selected fields)
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name }),
  });

  if (!response.ok) {
    throw new Error('Network response was not ok');
  }

  return await response.json();
};

type Props = {
  accountName: string;
  accountAddress: string;
};

const AccountEditableName = ({ accountName, accountAddress }: Props) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { network } = useNetwork();
  const eip155Address = `${network.namespace}:${network.chainId}`;
  const nameRef = useRef(accountName);
  const [name, setName] = useState(accountName);
  const isButtonDisabled = name === accountName;
  const { mutate, isPending } = useMutation({
    mutationFn: updateKey,
    onSuccess: () => {
      queryClient.setQueryData(['getAccounts', eip155Address], (oldData: WalletInfo[]) => {
        return (
          oldData?.length > 0 &&
          oldData.map((account) => {
            return account.address === accountAddress
              ? {
                  ...account,
                  name,
                }
              : account;
          })
        );
      });

      toast({
        title: 'Account name updated',
        description: 'Your account name has been updated successfully',
      });
    },

    onError: () => {
      setName(nameRef.current);
      toast({
        title: 'Error',
        description: 'Your account name could not be updated',
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const target = e.currentTarget;
    const formData = new FormData(target);
    const { name } = Object.fromEntries(formData) as { name: string };

    if (!name) return;

    mutate({ address: accountAddress, name });
  };

  return (
    <form className='text-primary flex items-center gap-2 mx-auto' onSubmit={handleSubmit}>
      <Input
        name='name'
        className='w-full border-0'
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <Button
        size='icon'
        className='h-7 w-8'
        type='submit'
        disabled={isButtonDisabled || isPending}
      >
        <Pencil className='h-4 w-4' />
      </Button>
    </form>
  );
};

export { AccountEditableName };
