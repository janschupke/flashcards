import React from 'react';
import { ModeToggleButtonsProps } from '../../types';
import { ModeButtonGroup } from './ModeButtonGroup';

/**
 * Legacy component - refactored to use ModeButtonGroup
 * Kept for backward compatibility with tests
 * @deprecated Consider using ModeButtonGroup directly
 */
export const ModeToggleButtons: React.FC<ModeToggleButtonsProps> = ({
  currentMode,
  onModeChange,
}) => {
  return (
    <div className="mb-3">
      <h3 className="mb-2 text-sm font-semibold text-text-tertiary text-center">Flashcard Mode</h3>
      <ModeButtonGroup
        currentMode={currentMode}
        onModeChange={onModeChange}
        className="flex gap-2 w-full"
      />
    </div>
  );
};

// Re-export MODES for backward compatibility
export { MODES } from '../../constants/modes';
