import React from 'react';
import { Button } from '../common/Button';
import { ButtonVariant } from '../../types/components';

interface ControlButtonsProps {
  onNext: () => void;
}

export const ControlButtons: React.FC<ControlButtonsProps> = ({ onNext }) => {
  return (
    <div className="w-full max-w-full sm:max-w-md">
      <Button
        type="button"
        onClick={onNext}
        variant={ButtonVariant.PRIMARY}
        fullWidth
        className="!px-3 !py-1.5 !text-2xl !border-2 !border-primary"
      >
        Next (Enter)
      </Button>
    </div>
  );
};
