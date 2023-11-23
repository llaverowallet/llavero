'use client';

import { Button } from '@/shared/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { Container } from '@/shared/components/ui/container';
import { signIn } from 'next-auth/react';

const REDIRECT_AFTER_LOGIN_URL = '/accounts';

const HomePage = () => {
  const handleLogin = async () => {
    await signIn('cognito', { callbackUrl: REDIRECT_AFTER_LOGIN_URL });
  };

  return (
    <main className='flex-1 flex flex-col'>
      <Container>
        <Card className='w-[350px] mx-auto'>
          <CardHeader>
            <CardTitle>Welcome</CardTitle>
            <CardDescription>Please login</CardDescription>
          </CardHeader>
          <CardContent></CardContent>
          <CardFooter className='flex justify-between'>
            <Button className='w-full' onClick={handleLogin}>
              Log in
            </Button>
          </CardFooter>
        </Card>
      </Container>
    </main>
  );
};

HomePage.displayName = 'HomePage';

export default HomePage;
