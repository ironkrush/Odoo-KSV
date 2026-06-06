import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hoverable = false,
  ...props
}) => {
  return (
    <div
      className={`bg-surface-card rounded-card border border-border-main p-comfortable shadow-[0_1px_3px_rgba(0,0,0,0.05)] transition-all duration-200 ${
        hoverable ? 'hover:shadow-[0_4px_12px_rgba(0,0,0,0.05)] hover:border-border-strong cursor-pointer' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
