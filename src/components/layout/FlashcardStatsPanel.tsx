import React, { useState, useMemo } from 'react';
import { Tooltip } from 'react-tooltip';
import { Button } from '../common/Button';
import { ButtonSize, ButtonVariant } from '../../types/components';
import { ConfirmModal } from '../common/ConfirmModal';
import { clearAllStorage } from '../../utils/storageUtils';
import { ADAPTIVE_CONFIG } from '../../constants/adaptive';
import { calculateSuccessRate, getSuccessRateColorClass } from '../../utils/statisticsUtils';
import { Answer } from '../../types';

interface FlashcardStatsPanelProps {
  adaptiveRange: number;
  correctAnswers: number;
  totalSeen: number;
  allAnswers: Answer[];
  onReset?: () => void;
}

export const FlashcardStatsPanel: React.FC<FlashcardStatsPanelProps> = ({
  adaptiveRange,
  correctAnswers,
  totalSeen,
  allAnswers,
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

  // Calculate overall success rate (for display in parentheses)
  const overallRateData = useMemo(() => {
    if (totalSeen === 0) {
      return null;
    }
    const rate = calculateSuccessRate(correctAnswers, totalSeen);
    return {
      percent: Math.round(rate * 100),
      colorClass: getSuccessRateColorClass(rate),
    };
  }, [correctAnswers, totalSeen]);

  // Calculate recent success rate from last 10 answers (what matters for expansion)
  const recentRateData = useMemo(() => {
    const recentAnswers = allAnswers.slice(-ADAPTIVE_CONFIG.EXPANSION_INTERVAL);
    const recentTotal = recentAnswers.length;
    if (recentTotal === 0) {
      return null;
    }
    const recentCorrect = recentAnswers.filter((a) => a.isCorrect).length;
    const rate = recentCorrect / recentTotal;
    return {
      percent: Math.round(rate * 100),
      colorClass: getSuccessRateColorClass(rate),
    };
  }, [allAnswers]);

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
            <span className="text-sm font-bold text-text-primary" data-testid="stat-answers">
              {correctAnswers} / {totalSeen}
              {overallRateData && (
                <span className={`ml-1 font-medium ${overallRateData.colorClass}`}>
                  ({overallRateData.percent}%)
                </span>
              )}
            </span>
          </div>
          <div
            className="flex items-center gap-1 sm:gap-2 cursor-help"
            data-tooltip-id="adaptive-range-tooltip"
          >
            <span className="text-xs text-text-tertiary whitespace-nowrap hidden sm:inline">
              Recent Success:
            </span>
            <span className="text-xs text-text-tertiary whitespace-nowrap sm:hidden">RS:</span>
            {recentRateData ? (
              <span
                className={`text-sm font-medium ${recentRateData.colorClass}`}
                data-testid="stat-recent-success-rate"
              >
                {recentRateData.percent}%
              </span>
            ) : (
              <span
                className="text-sm font-medium text-text-tertiary"
                data-testid="stat-recent-success-rate"
              >
                -
              </span>
            )}
          </div>
          <div
            className="flex items-center gap-1 sm:gap-2 cursor-help"
            data-tooltip-id="adaptive-range-tooltip"
            aria-label={`Character range 1-${adaptiveRange}. The range automatically expands when your last ${ADAPTIVE_CONFIG.EXPANSION_INTERVAL} answers achieve ${ADAPTIVE_CONFIG.SUCCESS_THRESHOLD * 100}% success rate.`}
          >
            <span className="text-xs text-text-tertiary whitespace-nowrap hidden sm:inline">
              Range:
            </span>
            <span className="text-xs text-text-tertiary whitespace-nowrap sm:hidden">R:</span>
            <span className="text-sm font-medium text-text-secondary" data-testid="adaptive-range">
              1-{adaptiveRange}
            </span>
          </div>
          <Tooltip id="adaptive-range-tooltip" place="bottom" className="max-w-xs z-50">
            <div className="text-sm">
              <p className="font-semibold mb-1">Adaptive Range</p>
              <p className="mb-2">
                Currently practicing characters 1-{adaptiveRange}. The range automatically expands
                when your last {ADAPTIVE_CONFIG.EXPANSION_INTERVAL} answers achieve{' '}
                {ADAPTIVE_CONFIG.SUCCESS_THRESHOLD * 100}% success rate.
              </p>
              <p className="text-xs opacity-90">
                Starting range: {ADAPTIVE_CONFIG.INITIAL_RANGE} • Expansion: +
                {ADAPTIVE_CONFIG.EXPANSION_AMOUNT} every {ADAPTIVE_CONFIG.EXPANSION_INTERVAL}{' '}
                answers
              </p>
            </div>
          </Tooltip>
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
