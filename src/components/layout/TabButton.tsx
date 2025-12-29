import React from 'react';
import { Button } from '../common/Button';
import { ButtonVariant, ButtonSize } from '../../types/components';

interface TabButtonProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
  id: string;
  ariaLabel: string;
}

export const TabButton: React.FC<TabButtonProps> = ({
  label,
  isActive,
  onClick,
  id,
  ariaLabel,
}) => {
  return (
    <Button
      type="button"
      role="tab"
      id={`tab-${id}`}
      aria-controls={`tab-panel-${id}`}
      aria-selected={isActive}
      aria-label={ariaLabel}
      onClick={onClick}
      variant={isActive ? ButtonVariant.PRIMARY : ButtonVariant.SECONDARY}
      size={ButtonSize.SM}
      className="rounded-md"
    >
      {label}
    </Button>
  );
};
