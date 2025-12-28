import React, { useState } from 'react';
import { Tooltip } from 'react-tooltip';
import { Button } from '../common/Button';
import { ButtonSize, ButtonVariant } from '../../types/components';
import { ConfirmModal } from '../common/ConfirmModal';
import { clearAllStorage } from '../../utils/storageUtils';
import { ADAPTIVE_CONFIG } from '../../constants/adaptive';

interface FlashcardStatsPanelProps {
  adaptiveRange: number;
  correctAnswers: number;
  totalSeen: number;
  onReset?: () => void;
}

export const FlashcardStatsPanel: React.FC<FlashcardStatsPanelProps> = ({
  adaptiveRange,
  correctAnswers,
  totalSeen,
  onReset,
}) => {
  const [showResetModal, setShowResetModal] = useState(false);

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
      <div className="flex flex-wrap items-center gap-2 sm:gap-3 px-2 py-1.5 sm:px-4 sm:py-2 bg-surface-secondary">
        {/* Answer counter, success rate, range, and reset button */}
        <div className="flex items-center gap-1.5 sm:gap-2 ml-auto flex-wrap justify-end">
          <div className="flex items-center gap-1 sm:gap-2">
            <span className="text-xs text-text-tertiary whitespace-nowrap hidden sm:inline">
              Answers:
            </span>
            <span className="text-xs text-text-tertiary whitespace-nowrap sm:hidden">A:</span>
            <span className="text-sm font-bold text-primary" data-testid="stat-answers">
              {correctAnswers} / {totalSeen}
            </span>
          </div>
          {totalSeen > 0 &&
            (() => {
              const successRate = correctAnswers / totalSeen;
              const successRatePercent = Math.round(successRate * 100);
              const colorClass =
                successRate >= 0.8
                  ? 'text-success'
                  : successRate >= 0.5
                    ? 'text-warning'
                    : 'text-error';
              return (
                <div className="flex items-center gap-1 sm:gap-2">
                  <span className="text-xs text-text-tertiary whitespace-nowrap hidden sm:inline">
                    Success:
                  </span>
                  <span className="text-xs text-text-tertiary whitespace-nowrap sm:hidden">S:</span>
                  <span
                    className={`text-sm font-medium ${colorClass}`}
                    data-testid="stat-success-rate"
                  >
                    {successRatePercent}%
                  </span>
                </div>
              );
            })()}
          <div className="flex items-center gap-1 sm:gap-2">
            <span className="text-xs text-text-tertiary whitespace-nowrap hidden sm:inline">
              Range:
            </span>
            <span className="text-xs text-text-tertiary whitespace-nowrap sm:hidden">R:</span>
            <span
              className="text-sm font-medium text-text-secondary cursor-help"
              data-testid="adaptive-range"
              data-tooltip-id="adaptive-range-tooltip"
            >
              1-{adaptiveRange}
            </span>
            <Tooltip id="adaptive-range-tooltip" place="bottom" className="max-w-xs z-50">
              <div className="text-sm">
                <p className="font-semibold mb-1">Adaptive Range</p>
                <p className="mb-2">
                  Currently practicing characters 1-{adaptiveRange}. The range automatically expands
                  when you achieve {ADAPTIVE_CONFIG.SUCCESS_THRESHOLD * 100}% success rate over{' '}
                  {ADAPTIVE_CONFIG.MIN_ATTEMPTS_FOR_EXPANSION} attempts.
                </p>
                <p className="text-xs opacity-90">
                  Starting range: {ADAPTIVE_CONFIG.INITIAL_RANGE} • Expansion: +
                  {ADAPTIVE_CONFIG.EXPANSION_AMOUNT} every {ADAPTIVE_CONFIG.EXPANSION_INTERVAL}{' '}
                  answers
                </p>
              </div>
            </Tooltip>
          </div>
          {onReset && (
            <Button
              type="button"
              onClick={handleResetClick}
              variant={ButtonVariant.SECONDARY}
              size={ButtonSize.SM}
              className="text-xs"
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
