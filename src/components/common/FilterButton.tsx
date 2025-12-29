import React from 'react';
import { Button } from './Button';
import { ButtonVariant, ButtonSize } from '../../types/components';

interface FilterButtonProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
  count?: number;
}

export const FilterButton: React.FC<FilterButtonProps> = ({ label, isActive, onClick, count }) => {
  const displayLabel = count !== undefined ? `${label} (${count})` : label;

  return (
    <Button
      type="button"
      onClick={onClick}
      variant={isActive ? ButtonVariant.PRIMARY : ButtonVariant.SECONDARY}
      size={ButtonSize.SM}
      className="text-xs"
    >
      {displayLabel}
    </Button>
  );
};
