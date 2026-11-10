import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: any[]) {
  return twMerge(clsx(inputs));
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "accent" | "outline" | "danger" | "ghost" | "link" | "glass";
  size?: "xs" | "sm" | "md" | "lg";
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", isLoading, children, disabled, ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer active:scale-[0.98]";

    const sizeStyles = {
      xs: "h-7 px-2.5 text-[11px] gap-1 rounded-lg",
      sm: "h-8.5 px-3.5 text-xs gap-1.5",
      md: "h-10 px-4 text-sm gap-2",
      lg: "h-12 px-6 text-base gap-2.5",
    };

    const variantStyles = {
      primary:
        "bg-[var(--primary,#2563EB)] text-white hover:brightness-105 shadow-sm hover:shadow-md hover:shadow-blue-500/15 focus:ring-[var(--primary,#2563EB)]",
      secondary:
        "bg-[var(--secondary,#1E40AF)] text-white hover:brightness-105 shadow-sm focus:ring-[var(--secondary,#1E40AF)]",
      accent:
        "bg-[var(--accent,#EA580C)] text-white hover:brightness-105 shadow-sm hover:shadow-md hover:shadow-orange-500/20 focus:ring-[var(--accent,#EA580C)]",
      outline:
        "border border-slate-200/90 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300 shadow-xs focus:ring-blue-500",
      danger:
        "bg-rose-600 text-white hover:bg-rose-700 shadow-sm hover:shadow-rose-500/20 focus:ring-rose-500",
      ghost:
        "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 focus:ring-slate-400",
      link:
        "text-[var(--primary,#2563EB)] underline-offset-4 hover:underline p-0 h-auto font-semibold active:scale-100",
      glass:
        "bg-white/80 backdrop-blur-md border border-slate-200/80 text-slate-800 hover:bg-white shadow-xs focus:ring-blue-500",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, sizeStyles[size], variantStyles[variant], className)}
        {...props}
      >
        {isLoading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
