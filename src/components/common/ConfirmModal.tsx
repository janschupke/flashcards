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
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && confirmButtonRef.current) {
      confirmButtonRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return undefined;

    const handleKey = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') {
        onCancel();
        return;
      }

      // Keep Tab inside the dialog. Focus was set to the confirm button but
      // nothing held it there, so Tab walked straight out to the page behind --
      // on a dialog that permanently deletes all progress.
      if (e.key !== 'Tab' || !dialogRef.current) return;

      const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!first || !last) return;

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKey);
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  const handleConfirm = (): void => {
    onConfirm();
  };

  const handleCancel = (): void => {
    onCancel();
  };

  // No keydown handler on the dialog itself: Escape and the focus trap live in
  // the effect above, and the global shortcuts already ignore anything inside
  // [role="dialog"], so Enter activates the focused button and nothing else.
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* The backdrop is click-to-dismiss, so it is a real button rather than a
          div with an onClick and no keyboard equivalent. It is out of the tab
          order because Escape already covers the keyboard path. */}
      <button
        type="button"
        tabIndex={-1}
        aria-label="Close dialog"
        onClick={handleCancel}
        className="absolute inset-0 bg-overlay animate-fade-in cursor-default"
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
        className="relative bg-surface-primary rounded-lg shadow-xl max-w-md w-full mx-4 p-6 animate-fade-in-scale"
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
