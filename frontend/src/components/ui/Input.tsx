import React, { forwardRef } from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className = '', type = 'text', ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1 w-full text-left">
        {label && (
          <label className="text-label-md font-semibold text-text-secondary">
            {label}
          </label>
        )}
        <input
          ref={ref}
          type={type}
          className={`w-full h-[40px] px-3 bg-white border rounded-input font-body-sm text-body-sm text-text-primary placeholder:text-text-disabled transition-all duration-200 outline-none focus:border-primary-container focus:ring-2 focus:ring-tint-green ${
            error ? 'border-status-red focus:border-status-red focus:ring-status-red-soft' : 'border-border-main'
          } ${className}`}
          {...props}
        />
        {error ? (
          <span className="text-[12px] font-medium text-status-red mt-0.5">{error}</span>
        ) : helperText ? (
          <span className="text-[12px] text-text-muted mt-0.5">{helperText}</span>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';
