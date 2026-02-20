"use client";

import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = "", id, ...props }, ref) => {
    const inputId = id || label?.replace(/\s/g, "-").toLowerCase();

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-[15px] font-medium text-text-secondary mb-2"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`w-full min-h-[58px] px-5 text-[17px] rounded-2xl border-2 transition-all bg-bg-card text-text-primary placeholder:text-text-disabled focus:outline-none focus:border-primary focus: ${
            error ? "border-danger" : "border-border-card"
          } ${className}`}
          {...props}
        />
        {error && (
          <p className="mt-2 text-[15px] text-danger font-medium">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
export { Input };
