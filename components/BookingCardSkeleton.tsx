import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function BookingCardSkeleton() {
  return (
    <Card className="shadow-[0_4px_16px_rgba(0,0,0,0.12)]">
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row gap-6">
          <Skeleton className="h-32 w-full sm:w-48 rounded-lg" />
          <div className="flex-1 space-y-3">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <div className="flex gap-4">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="h-5 w-32" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

