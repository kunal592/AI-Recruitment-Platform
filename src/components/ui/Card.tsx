import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '../../lib/utils';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  'border-danger'?: boolean;
}

const Card = forwardRef<HTMLDivElement, CardProps>(({ className, 'border-danger': borderDanger, ...props }, ref) => (
  <div 
    ref={ref} 
    className={cn(
      'rounded-xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-900', 
      borderDanger && 'border-red-500 dark:border-red-900/50',
      className
    )} 
    {...props} 
  />
));

const CardHeader = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('flex flex-col space-y-1.5 p-6', className)} {...props} />
);

const CardTitle = ({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) => (
  <h3 className={cn('text-lg font-semibold leading-none tracking-tight text-slate-900 dark:text-slate-50', className)} {...props} />
);

const CardContent = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('p-6 pt-0', className)} {...props} />
);

export { Card, CardHeader, CardTitle, CardContent };
