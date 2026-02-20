"use client";

import { motion } from "motion/react";
import { forwardRef, type ReactNode, type MouseEventHandler } from "react";

interface ButtonProps {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "default" | "large";
  isLoading?: boolean;
  fullWidth?: boolean;
  disabled?: boolean;
  className?: string;
  children?: ReactNode;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  type?: "button" | "submit" | "reset";
  "aria-label"?: string;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "default",
      isLoading,
      fullWidth = true,
      children,
      className = "",
      disabled,
      onClick,
      type = "button",
      ...rest
    },
    ref
  ) => {
    const base =
      "inline-flex items-center justify-center font-bold rounded-2xl transition-all focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none select-none";

    const variants: Record<string, string> = {
      primary:
        "bg-primary text-white shadow-button active:shadow-none active:brightness-95 active:translate-y-[1px]",
      secondary:
        "bg-bg-card text-primary border border-primary/15 shadow-card active:bg-primary-50",
      ghost: "bg-transparent text-text-secondary active:bg-bg-warm",
      danger:
        "bg-danger text-white shadow-[0_4px_14px_rgba(255,59,48,0.3)] active:shadow-none active:translate-y-[1px]",
    };

    const sizes: Record<string, string> = {
      default: "min-h-[56px] px-6 text-[17px] tracking-tight",
      large: "min-h-[56px] px-8 text-[17px] tracking-tight",
    };

    return (
      <motion.button
        ref={ref}
        whileTap={disabled || isLoading ? undefined : { scale: 0.97 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className={`${base} ${variants[variant]} ${sizes[size]} ${fullWidth ? "w-full" : ""} ${className}`}
        disabled={isLoading || disabled}
        onClick={onClick}
        type={type}
        aria-label={rest["aria-label"]}
      >
        {isLoading ? (
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            <span className="font-semibold">AI가 분석 중이에요...</span>
          </div>
        ) : (
          children
        )}
      </motion.button>
    );
  }
);

Button.displayName = "Button";
export { Button };
export type { ButtonProps };
