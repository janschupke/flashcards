import React from 'react';
import { AlertVariant } from '../../types/components';

interface BadgeProps {
  variant?: AlertVariant;
  children: React.ReactNode;
  className?: string;
}

const variantClasses: Record<AlertVariant, string> = {
  [AlertVariant.SUCCESS]: 'bg-success-light text-success',
  [AlertVariant.ERROR]: 'bg-error-light text-error',
  [AlertVariant.WARNING]: 'bg-warning/20 text-warning',
  [AlertVariant.INFO]: 'bg-info/20 text-info',
};

export const Badge: React.FC<BadgeProps> = ({
  variant = AlertVariant.INFO,
  children,
  className = '',
}) => {
  return (
    <span
      className={`
        inline-flex items-center px-2 py-1 rounded-md text-xs font-semibold
        ${variantClasses[variant]}
        ${className}
      `}
    >
      {children}
    </span>
  );
};
