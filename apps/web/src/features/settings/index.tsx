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

const Settings = () => {
  const { setTheme } = useTheme();

  return (
    <Container>
      <div className='px-4 xl:px-0'>
        <Card className='w-full mx-auto'>
          <CardHeader>
            <CardTitle className='text-2xl'>Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='flex gap-4 items-center'>
              <div>Theme:</div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant='outline' size='icon'>
                    <SunIcon className='h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0' />
                    <MoonIcon className='absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100' />
                    <span className='sr-only'>Toggle theme</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align='end'>
                  <DropdownMenuItem onClick={() => setTheme('light')}>Light</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme('dark')}>Dark</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme('system')}>System</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardContent>
        </Card>
      </div>
    </Container>
  );
};

export { Settings };
