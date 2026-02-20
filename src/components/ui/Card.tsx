import { HTMLAttributes, forwardRef } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated" | "outlined";
  padding?: "default" | "compact" | "none";
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      variant = "default",
      padding = "default",
      className = "",
      children,
      ...props
    },
    ref
  ) => {
    const base = "rounded-3xl bg-bg-card";

    const variants: Record<string, string> = {
      default: "shadow-card",
      elevated: "shadow-elevated",
      outlined: "border border-border-card",
    };

    const paddings: Record<string, string> = {
      default: "p-6",
      compact: "p-4",
      none: "",
    };

    return (
      <div
        ref={ref}
        className={`${base} ${variants[variant]} ${paddings[padding]} ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";
export { Card };
