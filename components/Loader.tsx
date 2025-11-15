import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoaderProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  text?: string;
  fullHeight?: boolean;
}

export default function Loader({ 
  size = 'md', 
  className, 
  text,
  fullHeight = false 
}: LoaderProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  const heightClass = fullHeight ? 'min-h-[400px]' : '';

  return (
    <div className={cn(
      'flex flex-col items-center justify-center gap-3 w-full',
      heightClass,
      className
    )}>
      <Loader2 className={cn('animate-spin text-[#6366f1]', sizeClasses[size])} />
      {text && <p className="text-sm text-gray-600">{text}</p>}
    </div>
  );
}

