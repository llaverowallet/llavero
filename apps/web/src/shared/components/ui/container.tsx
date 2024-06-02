import { cn } from '@/lib/utils';
import React from 'react';

type Props = {
  children: React.ReactNode;
  className?: string;
};

const Container: React.FC<Props> = ({ children, className, ...props }) => {
  return (
    <div className={cn('mx-auto w-full max-w-6xl h-full', className)} {...props}>
      {children}
    </div>
  );
};
export { Container };
