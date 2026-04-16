import { cn } from "@/lib/utils";
import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, leftIcon, ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label className="block text-sm font-medium text-slate-300">
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
              {leftIcon}
            </span>
          )}
          <input
            ref={ref}
            className={cn(
              "w-full bg-slate-800/60 border border-white/8 rounded-[12px] px-4 py-3 text-sm text-slate-200 placeholder:text-slate-500",
              "focus:outline-none focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/20",
              "transition-all duration-200",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              leftIcon && "pl-10",
              error && "border-red-500/50 focus:border-red-500/60 focus:ring-red-500/20",
              className
            )}
            {...props}
          />
        </div>
        {error && <p className="text-xs text-red-400">{error}</p>}
        {hint && !error && <p className="text-xs text-slate-500">{hint}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
export default Input;
