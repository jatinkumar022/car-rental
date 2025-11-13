import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoaderProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  text?: string;
}

export default function Loader({ size = 'md', className, text }: LoaderProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  return (
    <div className={cn('flex flex-col items-center justify-center gap-3', className)}>
      <Loader2 className={cn('animate-spin text-[#6366f1]', sizeClasses[size])} />
      {text && <p className="text-sm text-gray-600">{text}</p>}
    </div>
  );
}

export function SkeletonLoader({ className }: { className?: string }) {
  return (
    <div className={cn('animate-pulse rounded-lg bg-gray-200', className)} />
  );
}

export function CardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border bg-white shadow-md">
      <SkeletonLoader className="h-48 w-full sm:h-56" />
      <div className="p-4 space-y-3">
        <SkeletonLoader className="h-5 w-3/4" />
        <SkeletonLoader className="h-4 w-1/2" />
        <div className="flex gap-2">
          <SkeletonLoader className="h-4 w-16" />
          <SkeletonLoader className="h-4 w-16" />
        </div>
        <SkeletonLoader className="h-4 w-1/3" />
      </div>
    </div>
  );
}

