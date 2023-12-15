'use client';

import { Container } from '@/shared/components/ui/container';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';

const Settings = () => {
  return (
    <Container>
      <div className='px-4 xl:px-0'>
        <Card className='w-full mx-auto'>
          <CardHeader>
            <CardTitle className='text-2xl'>Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='flex gap-4'>
              <div>Theme:</div>
              <div>Light / Dark</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Container>
  );
};

export { Settings };
