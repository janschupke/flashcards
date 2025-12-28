import React from 'react';

interface CharacterInfoColumnProps {
  label: string;
  value: string;
  valueClassName?: string;
}

/**
 * Reusable component for displaying character information in a column
 * Extracted from PreviousCharacter to eliminate markup duplication
 */
export const CharacterInfoColumn: React.FC<CharacterInfoColumnProps> = ({
  label,
  value,
  valueClassName = 'text-text-secondary',
}) => {
  return (
    <div className="flex flex-col items-center min-w-0">
      <div className="text-xs sm:text-sm text-text-tertiary mb-1 uppercase tracking-wider whitespace-nowrap">
        {label}
      </div>
      <div className={`text-lg sm:text-xl md:text-2xl font-medium ${valueClassName} whitespace-nowrap`}>
        {value}
      </div>
    </div>
  );
};
