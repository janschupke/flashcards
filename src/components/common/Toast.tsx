import React from 'react';
import { Toast as ToastType } from '../../contexts/ToastContext';

interface ToastProps {
  toast: ToastType;
  onDismiss: (id: string) => void;
}

const variantStyles: Record<ToastType['variant'], string> = {
  success: 'bg-success text-text-on-success',
  info: 'bg-primary text-text-on-primary',
  warning: 'bg-warning text-text-on-warning',
  error: 'bg-error text-text-on-error',
};

export const Toast: React.FC<ToastProps> = ({ toast, onDismiss }) => {
  return (
    <div
      className={`px-4 py-3 rounded-b-lg shadow-lg flex items-center justify-between min-w-75 max-w-md ${variantStyles[toast.variant]} animate-rolldown`}
      role="alert"
      aria-live="polite"
    >
      <span className="text-sm font-medium">{toast.message}</span>
      <button
        onClick={() => onDismiss(toast.id)}
        className={`ml-4 px-1.5 rounded-sm hover:bg-overlay-hover focus:outline-none focus:ring-2 focus:ring-current ${
          toast.variant === 'success'
            ? 'text-text-on-success'
            : toast.variant === 'error'
              ? 'text-text-on-error'
              : toast.variant === 'warning'
                ? 'text-text-on-warning'
                : 'text-text-on-primary'
        }`}
        aria-label="Dismiss notification"
      >
        <span aria-hidden="true">×</span>
      </button>
    </div>
  );
};
