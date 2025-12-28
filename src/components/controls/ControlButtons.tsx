import React from 'react';
import { Button } from '../common/Button';
import { ButtonGroup } from '../common/ButtonGroup';
import { ButtonVariant } from '../../types/components';

interface ControlButtonsProps {
  onTogglePinyin: () => void;
  onToggleEnglish: () => void;
  onNext: () => void;
}

export const ControlButtons: React.FC<ControlButtonsProps> = ({
  onTogglePinyin,
  onToggleEnglish,
  onNext,
}) => {
  return (
    <ButtonGroup>
      <Button
        type="button"
        onClick={onTogglePinyin}
        variant={ButtonVariant.SECONDARY}
        className="min-w-[80px]"
      >
        Pinyin (,)
      </Button>
      <Button
        type="button"
        onClick={onToggleEnglish}
        variant={ButtonVariant.SECONDARY}
        className="min-w-[80px]"
      >
        English (.)
      </Button>
      <Button
        type="button"
        onClick={onNext}
        variant={ButtonVariant.PRIMARY}
        className="min-w-[80px]"
      >
        Next (Enter)
      </Button>
    </ButtonGroup>
  );
};
