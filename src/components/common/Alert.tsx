import React from 'react';
import { AlertVariant } from '../../types/components';

interface AlertProps {
  variant: AlertVariant;
  message: string;
  onDismiss?: () => void;
  className?: string;
}

const variantClasses: Record<AlertVariant, string> = {
  [AlertVariant.SUCCESS]: 'bg-success-light text-success border-success',
  [AlertVariant.ERROR]: 'bg-error-light text-error border-error',
  [AlertVariant.WARNING]: 'bg-warning/20 text-warning border-warning',
  [AlertVariant.INFO]: 'bg-info/20 text-info border-info',
};

export const Alert: React.FC<AlertProps> = ({ variant, message, onDismiss, className = '' }) => {
  return (
    <div
      className={`
        px-4 py-3 rounded-xl border-2 flex items-center justify-between
        ${variantClasses[variant]}
        ${className}
      `}
      role="alert"
    >
      <span>{message}</span>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="ml-4 text-current hover:opacity-80"
          aria-label="Dismiss alert"
        >
          ×
        </button>
      )}
    </div>
  );
};
