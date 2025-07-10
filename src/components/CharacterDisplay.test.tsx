
import { render, screen } from '@testing-library/react';
import { CharacterDisplay } from './CharacterDisplay';
import { HINT_TYPES } from '../types';

describe('CharacterDisplay', () => {
  it('should display both simplified and traditional characters in pinyin mode', () => {
    render(
      <CharacterDisplay
        currentIndex={0}
        hintType={HINT_TYPES.NONE}
        mode="pinyin"
      />
    );

    expect(screen.getByTestId('simplified-character')).toBeInTheDocument();
    expect(screen.getByTestId('traditional-character')).toBeInTheDocument();
  });

  it('should display only traditional character in simplified mode', () => {
    render(
      <CharacterDisplay
        currentIndex={0}
        hintType={HINT_TYPES.NONE}
        mode="simplified"
      />
    );

    expect(screen.getByTestId('traditional-character')).toBeInTheDocument();
    expect(screen.queryByTestId('simplified-character')).not.toBeInTheDocument();
  });

  it('should display only simplified character in traditional mode', () => {
    render(
      <CharacterDisplay
        currentIndex={0}
        hintType={HINT_TYPES.NONE}
        mode="traditional"
      />
    );

    expect(screen.getByTestId('simplified-character')).toBeInTheDocument();
    expect(screen.queryByTestId('traditional-character')).not.toBeInTheDocument();
  });

  it('should show hint text when hint is provided', () => {
    render(
      <CharacterDisplay
        currentIndex={0}
        hintType={HINT_TYPES.PINYIN}
        mode="pinyin"
      />
    );

    expect(screen.getByTestId('hint-text')).toBeInTheDocument();
  });
}); 
