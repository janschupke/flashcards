import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
}

const sizeClass = (size?: ButtonProps['size']) => {
  switch (size) {
    case 'sm':
      return 'px-4 py-2';
    case 'lg':
      return 'px-6 py-5';
    default:
      return 'px-6 py-4';
  }
};

export const Button: React.FC<ButtonProps> = ({ variant = 'secondary', size = 'md', className = '', ...props }) => {
  const base = 'rounded-xl text-base font-semibold transition-all min-w-[160px]';
  const variantCls =
    variant === 'primary'
      ? 'text-white bg-gradient-to-br from-primary to-primary-dark hover:-translate-y-0.5 active:translate-y-0'
      : 'bg-secondary text-textc-secondary border-2 border-secondary-dark hover:bg-secondary-dark hover:border-primary';
  return (
    <button className={`${base} ${sizeClass(size)} ${variantCls} ${className}`} {...props} />
  );
}; 
