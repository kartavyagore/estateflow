import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: any[]) {
  return twMerge(clsx(inputs));
}

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "danger" | "info" | "purple" | "cyan" | "outline";
  withDot?: boolean;
  pulse?: boolean;
}

export function Badge({
  className,
  variant = "default",
  withDot = false,
  pulse = false,
  children,
  ...props
}: BadgeProps) {
  const variantStyles = {
    default: "bg-slate-100 text-slate-800 border-slate-200/80",
    success: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
    warning: "bg-amber-50 text-amber-700 border-amber-200/80",
    danger: "bg-rose-50 text-rose-700 border-rose-200/80",
    info: "bg-blue-50 text-blue-700 border-blue-200/80",
    purple: "bg-purple-50 text-purple-700 border-purple-200/80",
    cyan: "bg-cyan-50 text-cyan-700 border-cyan-200/80",
    outline: "bg-transparent text-slate-600 border-slate-300",
  };

  const dotColors = {
    default: "bg-slate-400",
    success: "bg-emerald-500",
    warning: "bg-amber-500",
    danger: "bg-rose-500",
    info: "bg-blue-500",
    purple: "bg-purple-500",
    cyan: "bg-cyan-500",
    outline: "bg-slate-400",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide border transition-colors",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {withDot && (
        <span className="relative flex h-1.5 w-1.5">
          {pulse && (
            <span
              className={cn(
                "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
                dotColors[variant]
              )}
            ></span>
          )}
          <span className={cn("relative inline-flex rounded-full h-1.5 w-1.5", dotColors[variant])}></span>
        </span>
      )}
      {children}
    </span>
  );
}
