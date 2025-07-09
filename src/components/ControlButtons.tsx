import React from 'react';
import { ButtonGroup, Button } from './styled';

interface ControlButtonsProps {
  onTogglePinyin: () => void;
  onToggleEnglish: () => void;
  onNext: () => void;
  onEvaluatePinyin?: () => void;
  isPinyinEvaluated?: boolean;
  isPinyinCorrect?: boolean | null;
}

export const ControlButtons: React.FC<ControlButtonsProps> = ({
  onTogglePinyin,
  onToggleEnglish,
  onNext,
  onEvaluatePinyin,
  isPinyinEvaluated = false,
  isPinyinCorrect = null,
}) => {
  const getNextButtonText = () => {
    if (!isPinyinEvaluated) return 'Next (Enter)';
    if (isPinyinCorrect === true) return 'Next (Enter)';
    if (isPinyinCorrect === false) return 'Next (Enter)';
    return 'Next (Enter)';
  };

  const getNextButtonStyle = () => {
    if (!isPinyinEvaluated) return {};
    if (isPinyinCorrect === true) return { backgroundColor: '#28a745' };
    if (isPinyinCorrect === false) return { backgroundColor: '#dc3545' };
    return {};
  };

  return (
    <ButtonGroup>
      <Button onClick={onTogglePinyin}>
        Pinyin (P)
      </Button>
      <Button onClick={onToggleEnglish}>
        English (E)
      </Button>
      {onEvaluatePinyin && (
        <Button 
          onClick={onEvaluatePinyin}
          disabled={isPinyinEvaluated}
          style={{ backgroundColor: isPinyinEvaluated ? '#6c757d' : '#007bff' }}
        >
          {isPinyinEvaluated ? 'Evaluated' : 'Evaluate Pinyin'}
        </Button>
      )}
      <Button 
        $primary 
        onClick={onNext}
        style={getNextButtonStyle()}
      >
        {getNextButtonText()}
      </Button>
    </ButtonGroup>
  );
}; 
