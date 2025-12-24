import React from 'react';
import { ModeToggleButtonsProps, FlashcardMode } from '../../types';

export const MODES: { mode: FlashcardMode; label: string; title: string }[] = [
  { mode: FlashcardMode.PINYIN, label: '拼音 (F1)', title: '拼音模式 - Pinyin Mode (F1)' },
  { mode: FlashcardMode.SIMPLIFIED, label: '简体 (F2)', title: '简体模式 - Simplified Mode (F2)' },
  { mode: FlashcardMode.TRADITIONAL, label: '繁体 (F3)', title: '繁体模式 - Traditional Mode (F3)' },
];

const btnBase = "btn flex-1";

export const ModeToggleButtons: React.FC<ModeToggleButtonsProps> = ({
  currentMode,
  onModeChange,
}) => {
  const handleModeChange = (mode: FlashcardMode) => {
    if (mode !== currentMode) {
      onModeChange(mode);
    }
  };

  return (
    <div className="mb-5">
      <h3 className="mb-3 text-[1.1rem] font-semibold text-textc-muted text-center">Flashcard Mode</h3>
      <div className="flex gap-2 w-full">
        {MODES.map(({ mode, label, title }) => {
          const isActive = currentMode === mode;
          const cls = isActive
            ? `${btnBase} btn-primary bg-primary`
            : `${btnBase} btn-secondary`;
          return (
            <button key={mode} className={cls} onClick={() => handleModeChange(mode)} title={title}>
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}; 
