import React from 'react';
import { Button } from '../common/Button';
import { ButtonSize, ButtonVariant } from '../../types/components';
import { KEYBOARD_SHORTCUTS } from '../../types';

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
        size={ButtonSize.XL}
        fullWidth
        className="border-2 border-transparent"
      >
        Next ({KEYBOARD_SHORTCUTS.NEXT})
      </Button>
    </div>
  );
};
