import React from 'react';
import { useToastContext } from '../../contexts/ToastContext';
import { Toast } from './Toast';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToastContext();

  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 flex flex-col"
      role="region"
      aria-label="Notifications"
    >
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onDismiss={removeToast} />
      ))}
    </div>
  );
};
