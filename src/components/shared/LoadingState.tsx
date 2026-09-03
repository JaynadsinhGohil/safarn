import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
  className?: string;
  fullScreen?: boolean;
}

export function LoadingState({ message = 'Loading...', className, fullScreen = false }: LoadingStateProps) {
  return (
    <div 
      className={cn(
        "flex flex-col items-center justify-center text-center",
        fullScreen ? "fixed inset-0 z-50 bg-background/80 backdrop-blur-sm" : "min-h-[400px] p-8",
        className
      )}
    >
      <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
      <p className="text-sm font-medium text-muted-foreground animate-pulse">
        {message}
      </p>
    </div>
  );
}
