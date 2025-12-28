import React from 'react';
import { InputVariant, ButtonSize } from '../../types/components';

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  variant?: InputVariant;
  feedback?: string;
  label?: string;
  size?: ButtonSize;
}

const variantClasses: Record<InputVariant, string> = {
  [InputVariant.DEFAULT]: 'border-border-secondary',
  [InputVariant.SUCCESS]: 'border-success',
  [InputVariant.ERROR]: 'border-error',
};

const feedbackClasses: Record<InputVariant, string> = {
  [InputVariant.DEFAULT]: 'text-text-tertiary',
  [InputVariant.SUCCESS]: 'text-success',
  [InputVariant.ERROR]: 'text-error',
};

const sizeClasses: Record<ButtonSize, string> = {
  [ButtonSize.SM]: 'px-3 py-1.5 text-sm',
  [ButtonSize.MD]: 'px-4 py-2 text-base',
  [ButtonSize.LG]: 'px-5 py-3 text-lg',
};

export const Input: React.FC<InputProps> = ({
  variant = InputVariant.DEFAULT,
  feedback,
  label,
  size = ButtonSize.MD,
  className = '',
  ...props
}) => {
  return (
    <div className="w-full">
      {label ? (
        <label className="block text-sm font-semibold text-text-secondary mb-2">{label}</label>
      ) : null}
      <input
        className={`
          w-full rounded-xl border-2 bg-surface-secondary text-text-primary
          ${sizeClasses[size]}
          ${variantClasses[variant]}
          focus:outline-none focus:ring-2 focus:ring-border-focus
          disabled:bg-surface-primary disabled:text-text-disabled disabled:cursor-not-allowed
          placeholder:text-text-tertiary
          ${className}
        `}
        {...props}
      />
      {feedback ? (
        <div
          className={`mt-2 text-sm font-medium ${feedbackClasses[variant]}`}
          data-testid="input-feedback"
        >
          {feedback}
        </div>
      ) : null}
    </div>
  );
};
