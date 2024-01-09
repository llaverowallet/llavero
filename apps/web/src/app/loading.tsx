import { Container } from '@/shared/components/ui/container';
import { Skeleton } from '@/shared/components/ui/skeleton';

export default function Loading() {
  return (
    <Container className="flex-1 flex flex-col px-4 lg:px-0">
      <Skeleton className="w-full flex-1" />
    </Container>
  );
}
