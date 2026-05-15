import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '../../lib/utils';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(({ className, label, error, type, ...props }, ref) => {
  return (
    <div className="w-full space-y-2">
      {label && (
        <label className="text-[13px] font-bold text-slate-700 tracking-wide uppercase ml-1">
          {label}
        </label>
      )}
      <input
        type={type}
        className={cn(
          'flex w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-base text-slate-900 transition-all duration-200 placeholder:text-slate-400 focus:border-primary-500 focus:bg-white focus:ring-4 focus:ring-primary-500/10 outline-none disabled:cursor-not-allowed disabled:opacity-50 shadow-sm',
          error && 'border-red-500 focus:ring-red-500/10',
          className
        )}
        ref={ref}
        {...props}
      />
      {error && (
        <p className="text-xs font-medium text-red-500 ml-1 mt-1">
          {error}
        </p>
      )}
    </div>
  );
});

export { Input };

