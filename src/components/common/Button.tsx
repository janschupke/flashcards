import React from 'react';
import { ButtonVariant, ButtonSize } from '../../types/components';
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
  // The primary "next" action: large text, compact padding. Existed only as
  // four !important overrides fighting this map from the call site.
  [ButtonSize.XL]: 'px-3 py-1.5 text-2xl',
};

const variantClasses: Record<ButtonVariant, string> = {
  [ButtonVariant.PRIMARY]:
    'bg-primary text-text-on-primary hover:bg-primary-hover active:bg-primary-active',
  [ButtonVariant.SECONDARY]:
    'bg-surface-secondary text-text-secondary border-2 border-border-secondary hover:bg-surface-hover hover:border-primary active:bg-surface-active',
  [ButtonVariant.TERTIARY]:
    'bg-transparent text-text-secondary border border-border-primary hover:bg-surface-hover active:bg-surface-active',
  [ButtonVariant.GHOST]:
    'bg-transparent text-text-secondary hover:bg-surface-hover active:bg-surface-active',
  [ButtonVariant.ERROR]: 'bg-error text-text-on-error hover:bg-error-hover active:bg-error-active',
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
    return (
      <button
        ref={ref}
        className={cn(
          // The ring is offset because it is the same red as a primary fill:
          // drawn flush against one, it was invisible. focus-visible keeps a
          // mouse click from leaving it behind.
          'inline-flex items-center justify-center rounded-xl font-semibold transition-all select-none outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2',
          sizeClasses[size],
          variantClasses[variant],
          // Was an inline style computed from a JS constant; now a theme token.
          fullWidth ? 'w-full' : 'min-w-(--size-button-min)',
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';
