import React from 'react';
import { ButtonVariant, ButtonSize } from '../../types/components';
import { COMPONENT_CONSTANTS } from '../../constants/layout';
import cn from 'classnames';

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
  [ButtonVariant.PRIMARY]:
    'bg-primary text-text-on-primary hover:bg-primary-hover active:bg-primary-active',
  [ButtonVariant.SECONDARY]:
    'bg-surface-secondary text-text-secondary border-2 border-border-secondary hover:bg-surface-tertiary hover:border-primary',
  [ButtonVariant.TERTIARY]:
    'bg-transparent text-text-secondary border border-border-primary hover:bg-surface-secondary',
  [ButtonVariant.GHOST]: 'bg-transparent text-text-secondary hover:bg-surface-secondary',
  [ButtonVariant.ERROR]: 'bg-error text-text-on-error hover:opacity-90 active:opacity-80',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = ButtonVariant.SECONDARY,
      size = ButtonSize.MD,
      fullWidth = false,
      className = '',
      ...props
    },
    ref
  ) => {
    // Use inline style for dynamic min-width (Tailwind doesn't support dynamic arbitrary values)
    // This is acceptable for constant values that may need to be configurable
    const minWidthStyle = !fullWidth
      ? { minWidth: `${COMPONENT_CONSTANTS.BUTTON_MIN_WIDTH}px` }
      : undefined;

    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-xl font-semibold transition-all select-none focus:outline-none focus:ring-2 focus:ring-border-focus',
          sizeClasses[size],
          variantClasses[variant],
          fullWidth && 'w-full',
          className
        )}
        style={minWidthStyle}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';
