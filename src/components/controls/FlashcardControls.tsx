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
    <div className="flex items-center justify-center sm:justify-between gap-2 sm:gap-3 px-2 py-2 sm:px-4 sm:py-3 w-full flex-wrap">
      {/* Mode buttons - centered on mobile, left aligned on desktop */}
      <ModeButtonGroup currentMode={currentMode} onModeChange={onModeChange} size={ButtonSize.SM} />

      {/* Hint toggle buttons - centered on mobile, right aligned on desktop */}
      <div className="flex gap-1 sm:ml-auto flex-shrink-0">
        <Button
          type="button"
          onClick={onTogglePinyin}
          variant={isPinyinActive ? ButtonVariant.PRIMARY : ButtonVariant.SECONDARY}
          size={ButtonSize.SM}
          className="text-xs whitespace-nowrap"
        >
          Pinyin (,)
        </Button>
        <Button
          type="button"
          onClick={onToggleEnglish}
          variant={isEnglishActive ? ButtonVariant.PRIMARY : ButtonVariant.SECONDARY}
          size={ButtonSize.SM}
          className="text-xs whitespace-nowrap"
        >
          English (.)
        </Button>
      </div>
    </div>
  );
};
