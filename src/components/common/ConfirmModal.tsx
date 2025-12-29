import React, { useEffect, useRef } from 'react';
import { Button } from './Button';
import { ButtonVariant } from '../../types/components';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
}) => {
  const confirmButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen && confirmButtonRef.current) {
      confirmButtonRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent): void => {
      if (e.key === 'Escape' && isOpen) {
        onCancel();
      }
    };

    const handleEnter = (e: KeyboardEvent): void => {
      // When modal is open, prevent Enter from triggering other handlers (like answer submission)
      if (e.key === 'Enter' && isOpen) {
        e.preventDefault();
        e.stopPropagation();
        // Trigger confirm when Enter is pressed (prevents answer submission)
        onConfirm();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.addEventListener('keydown', handleEnter, true); // Use capture phase to intercept early
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('keydown', handleEnter, true);
      document.body.style.overflow = '';
    };
  }, [isOpen, onCancel, onConfirm]);

  if (!isOpen) return null;

  const handleConfirm = (): void => {
    onConfirm();
  };

  const handleCancel = (): void => {
    onCancel();
  };

  const handleKeyDown = (e: React.KeyboardEvent): void => {
    // Prevent Enter from bubbling up (handled by global listener in useEffect)
    if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
      onClick={handleCancel}
    >
      <div
        className="bg-surface-primary rounded-lg shadow-xl max-w-md w-full mx-4 p-6 animate-[fadeInScale_0.2s_ease-in]"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        <h2 id="modal-title" className="text-xl font-bold text-text-primary mb-4">
          {title}
        </h2>
        <p id="modal-description" className="text-text-secondary mb-6">
          {message}
        </p>
        <div className="flex gap-3 justify-end">
          <Button type="button" onClick={handleCancel} variant={ButtonVariant.SECONDARY}>
            {cancelText}
          </Button>
          <Button
            ref={confirmButtonRef}
            type="button"
            onClick={handleConfirm}
            variant={ButtonVariant.ERROR}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
};
