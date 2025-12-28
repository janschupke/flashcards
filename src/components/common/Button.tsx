import React from 'react';
import { ButtonVariant, ButtonSize } from '../../types/components';
import { COMPONENT_CONSTANTS } from '../../constants/layout';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
}

const sizeClasses: Record<ButtonSize, string> = {
  [ButtonSize.SM]: 'px-2 py-1 text-xs',
  [ButtonSize.MD]: 'px-3 py-1.5 text-sm',
  [ButtonSize.LG]: 'px-4 py-2 text-base',
};

const variantClasses: Record<ButtonVariant, string> = {
  [ButtonVariant.PRIMARY]: 'bg-primary text-white hover:bg-primary-hover active:bg-primary-active',
  [ButtonVariant.SECONDARY]:
    'bg-surface-secondary text-text-secondary border-2 border-border-secondary hover:bg-surface-tertiary hover:border-primary',
  [ButtonVariant.TERTIARY]:
    'bg-transparent text-text-secondary border border-border-primary hover:bg-surface-secondary',
  [ButtonVariant.GHOST]: 'bg-transparent text-text-secondary hover:bg-surface-secondary',
};

export const Button: React.FC<ButtonProps> = ({
  variant = ButtonVariant.SECONDARY,
  size = ButtonSize.MD,
  fullWidth = false,
  className = '',
  ...props
}) => {
  const baseClasses =
    'inline-flex items-center justify-center rounded-xl font-semibold transition-all select-none focus:outline-none focus:ring-2 focus:ring-border-focus';
  const widthClass = fullWidth ? 'w-full' : '';
  const minWidthStyle = { minWidth: `${COMPONENT_CONSTANTS.BUTTON_MIN_WIDTH}px` };

  return (
    <button
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${widthClass} ${className}`}
      style={!fullWidth ? minWidthStyle : undefined}
      {...props}
    />
  );
};
