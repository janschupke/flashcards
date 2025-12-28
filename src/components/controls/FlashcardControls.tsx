import React from 'react';
import { FlashcardMode, HintType } from '../../types';
import { Button } from '../common/Button';
import { ButtonSize, ButtonVariant } from '../../types/components';
import { ModeButtonGroup } from './ModeButtonGroup';

interface FlashcardControlsProps {
  currentMode: FlashcardMode;
  onModeChange: (mode: FlashcardMode) => void;
  currentHint: HintType;
  onTogglePinyin: () => void;
  onToggleEnglish: () => void;
}

export const FlashcardControls: React.FC<FlashcardControlsProps> = ({
  currentMode,
  onModeChange,
  currentHint,
  onTogglePinyin,
  onToggleEnglish,
}) => {
  const isPinyinActive = currentHint === HintType.PINYIN;
  const isEnglishActive = currentHint === HintType.ENGLISH;

  return (
    <div className="flex items-center justify-between gap-2 sm:gap-3 px-2 py-2 sm:px-4 sm:py-3 w-full">
      {/* Mode buttons - left aligned */}
      <ModeButtonGroup
        currentMode={currentMode}
        onModeChange={onModeChange}
        size={ButtonSize.SM}
      />

      {/* Hint toggle buttons - right aligned */}
      <div className="flex gap-1 ml-auto">
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
    </div>
  );
};

