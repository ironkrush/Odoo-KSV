import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'success' | 'warning' | 'error' | 'info' | 'neutral';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  className = '',
  ...props
}) => {
  const baseStyles = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-caption font-semibold tracking-wider uppercase text-[11px] leading-4';
  
  const variants = {
    success: 'bg-tint-green text-primary',
    warning: 'bg-status-amber-soft text-status-amber',
    error: 'bg-status-red-soft text-status-red',
    info: 'bg-accent-blue-soft text-accent-blue',
    neutral: 'bg-border-soft text-text-secondary',
  };

  return (
    <span
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};
