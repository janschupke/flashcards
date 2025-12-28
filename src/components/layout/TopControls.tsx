import React from 'react';
import { FlashcardMode } from '../../types';
import { Button } from '../common/Button';
import { ButtonVariant, ButtonSize } from '../../types/components';
import { MODES } from '../controls/ModeToggleButtons';

interface TopControlsProps {
  currentMode: FlashcardMode;
  onModeChange: (mode: FlashcardMode) => void;
  currentLimit: number;
  minLimit: number;
  maxLimit: number;
  onLimitChange: (newLimit: number) => void;
  correctAnswers: number;
  totalSeen: number;
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
}) => {
  const handleModeChange = (mode: FlashcardMode): void => {
    if (mode !== currentMode) {
      onModeChange(mode);
    }
  };

  const handleLimitChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const value = e.target.value;
    const parsed = parseInt(value, 10);
    if (!isNaN(parsed)) {
      const clamped = Math.max(minLimit, Math.min(maxLimit, parsed));
      onLimitChange(clamped);
    }
  };

  const handleLimitBlur = (e: React.FocusEvent<HTMLInputElement>): void => {
    const value = parseInt(e.target.value, 10);
    if (isNaN(value) || value < minLimit) {
      onLimitChange(minLimit);
    } else if (value > maxLimit) {
      onLimitChange(maxLimit);
    } else {
      onLimitChange(value);
    }
  };

  return (
    <div className="flex items-center gap-3 px-4 py-2 bg-surface-secondary border-b border-border-primary">
      {/* Mode buttons */}
      <div className="flex gap-1">
        {MODES.map(({ mode, label, title }) => {
          const isActive = currentMode === mode;
          return (
            <Button
              key={mode}
              variant={isActive ? ButtonVariant.PRIMARY : ButtonVariant.SECONDARY}
              onClick={() => handleModeChange(mode)}
              title={title}
              size={ButtonSize.SM}
              className="text-xs"
            >
              {label}
            </Button>
          );
        })}
      </div>

      {/* Range input */}
      <div className="flex items-center gap-2">
        <label htmlFor="limit" className="text-xs text-text-tertiary whitespace-nowrap">
          Range:
        </label>
        <input
          id="limit"
          type="number"
          className="w-20 px-2 py-1 border border-border-secondary rounded text-sm bg-surface-primary text-text-primary outline-none focus:ring-1 focus:ring-border-focus"
          value={currentLimit}
          onChange={handleLimitChange}
          onBlur={handleLimitBlur}
          min={minLimit}
          max={maxLimit}
          data-testid="range-input"
        />
      </div>

      {/* Answer counter */}
      <div className="flex items-center gap-2 ml-auto">
        <span className="text-xs text-text-tertiary whitespace-nowrap">Score:</span>
        <span className="text-sm font-bold text-primary" data-testid="stat-answers">
          {correctAnswers} / {totalSeen}
        </span>
      </div>
    </div>
  );
};
