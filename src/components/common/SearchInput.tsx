import React, { useId } from 'react';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  /** Visible label. Both tables render one of these, so they need distinct names. */
  label?: string;
}

/**
 * Reusable search input component with consistent styling
 */
export const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  placeholder = 'Search in any column...',
  className = '',
  label = 'Search',
}) => {
  const id = useId();

  return (
    <div className={`w-full ${className}`}>
      {/* A placeholder is not a label: it disappears as soon as you type. */}
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <input
        id={id}
        type="search"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        // v4 syntax: `placeholder-text-tertiary` was v3 and generated nothing.
        className="w-full px-3 py-2 text-sm border border-border-primary rounded bg-transparent text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-border-focus focus:border-transparent"
      />
    </div>
  );
};
