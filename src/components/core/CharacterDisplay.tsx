import React from 'react';
import { getCharacterByIndex, getDisplayCharacter } from '../../utils/characterUtils';
import { FlashcardMode } from '../../types';

interface CharacterDisplayProps {
  currentIndex: number;
  mode: FlashcardMode;
}

export const CharacterDisplay: React.FC<CharacterDisplayProps> = ({ currentIndex, mode }) => {
  const character = getCharacterByIndex(currentIndex);

  // Get display characters based on mode
  const displayChars = character
    ? getDisplayCharacter(character, mode)
    : { simplified: '?', traditional: '?' };

  const simplifiedChar = displayChars.simplified || '?';
  const traditionalChar = displayChars.traditional || '?';

  return (
    <div className="animate-slideIn">
      <div className="flex items-center justify-center gap-8">
        {mode === FlashcardMode.BOTH ? (
          <>
            <div
              className="text-8xl font-bold text-text-primary mb-5 drop-shadow-lg leading-none animate-slow-pulse"
              data-testid="simplified-character"
            >
              {simplifiedChar}
            </div>
            <div
              className="text-8xl font-bold text-accent mb-5 drop-shadow-lg leading-none animate-slow-pulse"
              data-testid="traditional-character"
            >
              {traditionalChar}
            </div>
          </>
        ) : mode === FlashcardMode.SIMPLIFIED ? (
          <div
            className="text-8xl font-bold text-text-primary mb-5 drop-shadow-lg leading-none animate-slow-pulse"
            data-testid="simplified-character"
          >
            {simplifiedChar}
          </div>
        ) : (
          <div
            className="text-8xl font-bold text-accent mb-5 drop-shadow-lg leading-none animate-slow-pulse"
            data-testid="traditional-character"
          >
            {traditionalChar}
          </div>
        )}
      </div>
    </div>
  );
};
