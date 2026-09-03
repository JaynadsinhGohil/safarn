import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
  };
  className?: string;
}

export function PageHeader({ title, description, action, className }: PageHeaderProps) {
  return (
    <div className={cn("flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8", className)}>
      <div className="space-y-2">
        <h1 className="text-3xl md:text-headline-lg font-heading font-bold text-foreground">
          {title}
        </h1>
        {description && (
          <p className="text-body-md text-muted-foreground max-w-2xl">
            {description}
          </p>
        )}
      </div>
      
      {action && (
        <Button onClick={action.onClick} className="w-full md:w-auto shrink-0">
          {action.icon && <span className="mr-2">{action.icon}</span>}
          {action.label}
        </Button>
      )}
    </div>
  );
}
