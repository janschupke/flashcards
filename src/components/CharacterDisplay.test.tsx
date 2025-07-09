
import React from 'react';
import { render, screen } from '@testing-library/react';
import { CharacterDisplay } from './CharacterDisplay';
import { HINT_TYPES } from '../types';

describe('CharacterDisplay', () => {
  it('should display both simplified and traditional characters', () => {
    render(
      <CharacterDisplay
        currentIndex={0}
        hintType={HINT_TYPES.NONE}
      />
    );

    expect(screen.getByTestId('simplified-character')).toBeInTheDocument();
    expect(screen.getByTestId('traditional-character')).toBeInTheDocument();
  });

  it('should show hint text when hint is provided', () => {
    render(
      <CharacterDisplay
        currentIndex={0}
        hintType={HINT_TYPES.PINYIN}
      />
    );

    expect(screen.getByTestId('hint-text')).toBeInTheDocument();
  });
}); 
