import React from 'react';
import { Button } from '../common/Button';
import { ButtonGroup } from '../common/ButtonGroup';
import { ButtonVariant } from '../../types/components';

interface ControlButtonsProps {
  onNext: () => void;
}

export const ControlButtons: React.FC<ControlButtonsProps> = ({ onNext }) => {
  return (
    <div className="flex justify-center">
      <ButtonGroup>
        <Button
          type="button"
          onClick={onNext}
          variant={ButtonVariant.PRIMARY}
          className="min-w-[80px] text-sm"
        >
          Next (Enter)
        </Button>
      </ButtonGroup>
    </div>
  );
};
