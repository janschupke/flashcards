import React, { useState } from 'react';
import { FlashcardMode, HintType } from '../../types';
import { Button } from '../common/Button';
import { ButtonSize, ButtonVariant } from '../../types/components';
import { ModeButtonGroup } from '../controls/ModeButtonGroup';
import { ConfirmModal } from '../common/ConfirmModal';
import { clearAllStorage } from '../../utils/storageUtils';

interface TopControlsProps {
  currentMode: FlashcardMode;
  onModeChange: (mode: FlashcardMode) => void;
  adaptiveRange: number;
  correctAnswers: number;
  totalSeen: number;
  currentHint?: HintType;
  onTogglePinyin?: () => void;
  onToggleEnglish?: () => void;
  onReset?: () => void;
}

export const TopControls: React.FC<TopControlsProps> = ({
  currentMode,
  onModeChange,
  adaptiveRange,
  correctAnswers,
  totalSeen,
  currentHint,
  onTogglePinyin,
  onToggleEnglish,
  onReset,
}) => {
  const [showResetModal, setShowResetModal] = useState(false);
  const isPinyinActive = currentHint === HintType.PINYIN;
  const isEnglishActive = currentHint === HintType.ENGLISH;

  const handleResetClick = (): void => {
    setShowResetModal(true);
  };

  const handleResetConfirm = (): void => {
    clearAllStorage();
    if (onReset) {
      onReset();
    }
    setShowResetModal(false);
  };

  const handleResetCancel = (): void => {
    setShowResetModal(false);
  };

  return (
    <>
      <div className="flex flex-wrap items-center gap-2 sm:gap-3 px-2 py-1.5 sm:px-4 sm:py-2 bg-surface-secondary border-b border-border-primary">
        {/* Mode buttons */}
        <ModeButtonGroup
          currentMode={currentMode}
          onModeChange={onModeChange}
          size={ButtonSize.SM}
        />

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

        {/* Adaptive range indicator */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-text-tertiary whitespace-nowrap">Range:</span>
          <span className="text-sm font-medium text-text-secondary" data-testid="adaptive-range">
            1-{adaptiveRange}
          </span>
        </div>

        {/* Answer counter and reset button */}
        <div className="flex items-center gap-2 ml-auto">
          <span className="text-xs text-text-tertiary whitespace-nowrap">Answers:</span>
          <span className="text-sm font-bold text-primary" data-testid="stat-answers">
            {correctAnswers} / {totalSeen}
          </span>
          {onReset && (
            <Button
              type="button"
              onClick={handleResetClick}
              variant={ButtonVariant.SECONDARY}
              size={ButtonSize.SM}
              className="text-xs ml-2"
            >
              Reset
            </Button>
          )}
        </div>
      </div>
      <ConfirmModal
        isOpen={showResetModal}
        title="Reset Statistics?"
        message="This will permanently delete all your progress, statistics, and history. This action cannot be undone."
        confirmText="Confirm Reset"
        cancelText="Cancel"
        onConfirm={handleResetConfirm}
        onCancel={handleResetCancel}
      />
    </>
  );
};
