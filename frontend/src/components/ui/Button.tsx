import React from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none disabled:opacity-50 disabled:pointer-events-none rounded-btn h-[40px]';
  
  const variants = {
    primary: 'bg-primary-container text-white hover:bg-primary-container-hover active:bg-primary shadow-sm',
    secondary: 'bg-white border border-border-main text-text-primary hover:bg-surface-container-low active:bg-surface-container',
    outline: 'bg-transparent border border-primary-container text-primary-container hover:bg-tint-green active:bg-tint-green/80',
    ghost: 'bg-transparent text-text-secondary hover:bg-border-soft hover:text-text-primary',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-body-sm h-[32px] rounded-[6px]',
    md: 'px-4 py-2 text-body-md h-[40px]',
    lg: 'px-6 py-3 text-title-md h-[48px] rounded-[12px]',
  };

  const isBtnDisabled = disabled || isLoading;

  return (
    <button
      disabled={isBtnDisabled}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : icon ? (
        <span className="mr-2 inline-flex">{icon}</span>
      ) : null}
      {children}
    </button>
  );
};
