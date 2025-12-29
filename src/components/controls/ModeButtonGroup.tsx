import React from 'react';
import { FlashcardMode } from '../../types';
import { Button } from '../common/Button';
import { ButtonVariant, ButtonSize } from '../../types/components';
import { MODES } from '../../constants/modes';
import { useModeToggle } from '../../hooks/useModeToggle';
import { cn } from '../../utils/classNameUtils';

interface ModeButtonGroupProps {
  currentMode: FlashcardMode;
  onModeChange: (mode: FlashcardMode) => void;
  size?: ButtonSize;
  className?: string;
}

/**
 * Reusable component for rendering mode toggle buttons
 * Extracted from TopControls and ModeToggleButtons to eliminate duplication
 */
export const ModeButtonGroup: React.FC<ModeButtonGroupProps> = ({
  currentMode,
  onModeChange,
  size = ButtonSize.MD,
  className = '',
}) => {
  const { handleModeChange } = useModeToggle(currentMode, onModeChange);

  return (
    <div className={cn('flex gap-1 flex-wrap', className)}>
      {MODES.map(({ mode, label, title }) => {
        const isActive = currentMode === mode;
        return (
          <Button
            key={mode}
            variant={isActive ? ButtonVariant.PRIMARY : ButtonVariant.SECONDARY}
            onClick={() => handleModeChange(mode)}
            aria-label={title}
            size={size}
            className={cn(size === ButtonSize.SM && 'text-xs', 'whitespace-nowrap')}
          >
            {label}
          </Button>
        );
      })}
    </div>
  );
};
