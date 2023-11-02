import { cn } from '@/lib/utils';
import React, { HTMLAttributes } from 'react';

type Props = {
  children: React.ReactNode;
};

const Container = ({ children, className, ...props }: Props & HTMLAttributes<HTMLDivElement>) => {
  return (
    <div className={cn('mx-auto w-full max-w-6xl h-full', className)} {...props}>
      {children}
    </div>
  );
};

export { Container };
