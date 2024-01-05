'use client';

import React, { useEffect, useState } from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/shared/components/ui/tooltip';

type Props = {
  children: React.ReactNode;
  textToCopy: string;
};

const CopyToClipboard = ({ children, textToCopy }: Props) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleCopyToClipboard = async (string: string) => {
    setIsOpen(true);
    await navigator.clipboard.writeText(string);
  };

  useEffect(() => {
    if (!isOpen) return;

    const timeout = setTimeout(() => {
      setIsOpen(false);
    }, 1500);

    return () => {
      clearTimeout(timeout);
    };
  }, [isOpen]);

  return (
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
    <div onClick={() => handleCopyToClipboard(textToCopy)}>
      <TooltipProvider>
        <Tooltip open={isOpen}>
          <TooltipTrigger>{children}</TooltipTrigger>
          <TooltipContent>
            <p>Copied!</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

export { CopyToClipboard };
