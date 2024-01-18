'use client';

import { Container } from '@/shared/components/ui/container';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { useTheme } from 'next-themes';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { Button } from '@/shared/components/ui/button';
import { MoonIcon, SunIcon } from 'lucide-react';
import { MFADialog } from './components/mfa-dialog';
import SMS from './components/sms';
import { Label } from '@/shared/components/ui/label';
import MFASetup from './components/mfa-setup';
import { Separator } from '@/shared/components/ui/separator';
import { useState } from 'react';

const Settings = () => {
  const { setTheme } = useTheme();
  const [isMFAActive, setIsMFAActive] = useState(false);

  const handleMFAStatusChange = (status: boolean) => {
    console.log('MFA Status changed');
    setIsMFAActive(status);
  };

  return (
    <Container>
      <div className="px-4 xl:px-0">
        <Card className="w-full mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl">Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <div className="flex gap-4 items-center">
                <Label>Theme:</Label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon" aria-label="Toggle theme">
                      <SunIcon className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                      <MoonIcon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setTheme('light')}>Light</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setTheme('dark')}>Dark</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setTheme('system')}>System</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <Separator />

              <div>
                <div className="text-xl font-semibold mb-0">MFA (Multi-factor authentication)</div>
                <p className="text-sm text-gray-500">
                  When TOTP is enabled is used on the login, and when executing a transaction as an
                  extra security layer
                </p>
              </div>
              <div className="flex gap-6 mb-2">
                <div className="flex gap-4 flex-col">
                  <Label>TOPT (time based one-time password)</Label>{' '}
                  <MFADialog onMFAStatusChange={handleMFAStatusChange} />
                </div>

                <div className="flex gap-4 flex-col">
                  <Label>or send one-time password in SMS messages</Label> <SMS />
                </div>
              </div>
              {isMFAActive && (
                <>
                  <div className="text-lg text-gray-600 font-semibold">MFA Settings</div>
                  <MFASetup />
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </Container>
  );
};

export { Settings };
