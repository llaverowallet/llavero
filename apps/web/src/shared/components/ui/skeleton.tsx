import { cn } from '@/lib/utils';

// eslint-disable-next-line no-undef
function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('animate-pulse rounded-md bg-primary/10', className)} {...props} />;
}

export { Skeleton };
