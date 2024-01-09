'use client';

import { Skeleton } from '@/shared/components/ui/skeleton';

const AccountsSkeleton = () => {
  return (
    <div className="grid gap-2">
      <Skeleton className="h-[50px] w-full" />
      <Skeleton className="h-[200px] w-full" />
    </div>
  );
};

export { AccountsSkeleton };
