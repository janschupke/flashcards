import React from 'react';
import { FlashcardMode, HintType } from '../../types';
import { Button } from '../common/Button';
import { ButtonSize, ButtonVariant } from '../../types/components';
import { ModeButtonGroup } from '../controls/ModeButtonGroup';
import { RangeInput } from '../input/RangeInput';

interface TopControlsProps {
  currentMode: FlashcardMode;
  onModeChange: (mode: FlashcardMode) => void;
  currentLimit: number;
  minLimit: number;
  maxLimit: number;
  onLimitChange: (newLimit: number) => void;
  correctAnswers: number;
  totalSeen: number;
  currentHint?: HintType;
  onTogglePinyin?: () => void;
  onToggleEnglish?: () => void;
}

export const TopControls: React.FC<TopControlsProps> = ({
  currentMode,
  onModeChange,
  currentLimit,
  minLimit,
  maxLimit,
  onLimitChange,
  correctAnswers,
  totalSeen,
  currentHint,
  onTogglePinyin,
  onToggleEnglish,
}) => {
  const isPinyinActive = currentHint === HintType.PINYIN;
  const isEnglishActive = currentHint === HintType.ENGLISH;


  return (
    <div className="flex flex-wrap items-center gap-2 sm:gap-3 px-2 py-1.5 sm:px-4 sm:py-2 bg-surface-secondary border-b border-border-primary">
      {/* Mode buttons */}
      <ModeButtonGroup currentMode={currentMode} onModeChange={onModeChange} size={ButtonSize.SM} />

      {/* Hint toggle buttons */}
      {onTogglePinyin && onToggleEnglish && (
        <div className="flex gap-1">
          <Button
            type="button"
            onClick={onTogglePinyin}
            variant={isPinyinActive ? ButtonVariant.PRIMARY : ButtonVariant.SECONDARY}
            size={ButtonSize.SM}
            className="text-xs"
          >
            Pinyin (,)
          </Button>
          <Button
            type="button"
            onClick={onToggleEnglish}
            variant={isEnglishActive ? ButtonVariant.PRIMARY : ButtonVariant.SECONDARY}
            size={ButtonSize.SM}
            className="text-xs"
          >
            English (.)
          </Button>
        </div>
      )}

      {/* Range input */}
      <RangeInput
        currentLimit={currentLimit}
        minLimit={minLimit}
        maxLimit={maxLimit}
        onLimitChange={onLimitChange}
      />

      {/* Answer counter */}
      <div className="flex items-center gap-2 ml-auto">
        <span className="text-xs text-text-tertiary whitespace-nowrap">Answers:</span>
        <span className="text-sm font-bold text-primary" data-testid="stat-answers">
          {correctAnswers} / {totalSeen}
        </span>
      </div>
    </div>
  );
};
