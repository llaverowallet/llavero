'use client';

import { Skeleton } from '@/shared/components/ui/skeleton';

const AccountActivitySkeleton = () => {
  return (
    <div className="grid gap-2">
      <Skeleton className="h-[50px] w-full" />
      <Skeleton className="h-[50px] w-full" />
      <Skeleton className="h-[50px] w-full" />
    </div>
  );
};

export { AccountActivitySkeleton };
