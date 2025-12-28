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
      className={`px-4 py-3 rounded-b-lg shadow-lg flex items-center justify-between min-w-[300px] max-w-md ${variantStyles[toast.variant]} animate-[rolldown_0.5s_ease-out]`}
      role="alert"
      aria-live="polite"
    >
      <span className="text-sm font-medium">{toast.message}</span>
      <button
        onClick={() => onDismiss(toast.id)}
        className={`ml-4 hover:opacity-80 focus:outline-none ${
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
        ×
      </button>
    </div>
  );
};
