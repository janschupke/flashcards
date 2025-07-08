import React from 'react';
import { ButtonGroup, Button } from './styled';


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
      <Button onClick={onTogglePinyin}>
        Pinyin (P)
      </Button>
      <Button onClick={onToggleEnglish}>
        English (E)
      </Button>
      <Button $primary onClick={onNext}>
        Next (Enter)
      </Button>
    </ButtonGroup>
  );
}; 
