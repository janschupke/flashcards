import React from 'react';
import { useRangeInput } from '../../hooks/useRangeInput';

interface RangeInputProps {
  currentLimit: number;
  minLimit: number;
  maxLimit: number;
  onLimitChange: (newLimit: number) => void;
  label?: string;
  className?: string;
  id?: string;
  'data-testid'?: string;
}

/**
 * Reusable range input component for character limit selection
 * Extracted from TopControls to eliminate duplication
 */
export const RangeInput: React.FC<RangeInputProps> = ({
  currentLimit,
  minLimit,
  maxLimit,
  onLimitChange,
  label = 'Range:',
  className = '',
  id = 'limit',
  'data-testid': testId = 'range-input',
}) => {
  const { inputValue, handleChange, handleBlur } = useRangeInput(
    currentLimit,
    minLimit,
    maxLimit,
    onLimitChange
  );

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <label htmlFor={id} className="text-xs text-text-tertiary whitespace-nowrap">
        {label}
      </label>
      <input
        id={id}
        type="number"
        className="w-16 sm:w-20 px-2 py-1 border border-border-secondary rounded text-sm bg-surface-primary text-text-primary outline-none focus:ring-1 focus:ring-border-focus"
        value={inputValue}
        onChange={handleChange}
        onBlur={handleBlur}
        min={minLimit}
        max={maxLimit}
        data-testid={testId}
      />
    </div>
  );
};

