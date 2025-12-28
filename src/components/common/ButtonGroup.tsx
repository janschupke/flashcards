import React from 'react';

interface ButtonGroupProps {
  children: React.ReactNode;
  className?: string;
}

export const ButtonGroup: React.FC<ButtonGroupProps> = ({ children, className = '' }) => {
  return <div className={`flex gap-3 justify-center flex-wrap ${className}`}>{children}</div>;
};
