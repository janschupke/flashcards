import React from 'react';
import { ModeToggleButtonsProps, FlashcardMode } from '../../types';
import { Button } from '../common/Button';
import { ButtonVariant } from '../../types/components';

export const MODES: { mode: FlashcardMode; label: string; title: string }[] = [
  { mode: FlashcardMode.PINYIN, label: '拼音 (F1)', title: '拼音模式 - Pinyin Mode (F1)' },
  { mode: FlashcardMode.SIMPLIFIED, label: '简体 (F2)', title: '简体模式 - Simplified Mode (F2)' },
  {
    mode: FlashcardMode.TRADITIONAL,
    label: '繁体 (F3)',
    title: '繁体模式 - Traditional Mode (F3)',
  },
];

export const ModeToggleButtons: React.FC<ModeToggleButtonsProps> = ({
  currentMode,
  onModeChange,
}) => {
  const handleModeChange = (mode: FlashcardMode): void => {
    if (mode !== currentMode) {
      onModeChange(mode);
    }
  };

  return (
    <div className="mb-3">
      <h3 className="mb-2 text-sm font-semibold text-text-tertiary text-center">Flashcard Mode</h3>
      <div className="flex gap-2 w-full">
        {MODES.map(({ mode, label, title }) => {
          const isActive = currentMode === mode;
          return (
            <Button
              key={mode}
              variant={isActive ? ButtonVariant.PRIMARY : ButtonVariant.SECONDARY}
              onClick={() => handleModeChange(mode)}
              title={title}
              className="flex-1"
            >
              {label}
            </Button>
          );
        })}
      </div>
    </div>
  );
};
