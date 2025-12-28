import React from 'react';
import { getCharacterByIndex, getHintText, getDisplayCharacter } from '../../utils/characterUtils';
import { HintType, FlashcardMode } from '../../types';

interface CharacterDisplayProps {
  currentIndex: number;
  hintType: HintType;
  mode: FlashcardMode;
}

export const CharacterDisplay: React.FC<CharacterDisplayProps> = ({
  currentIndex,
  hintType,
  mode,
}) => {
  const character = getCharacterByIndex(currentIndex);
  const hintText = getHintText(character, hintType);

  // Get display characters based on mode
  const displayChars = character
    ? getDisplayCharacter(character, mode)
    : { simplified: '?', traditional: '?' };

  const simplifiedChar = displayChars.simplified || '?';
  const traditionalChar = displayChars.traditional || '?';

  return (
    <div className="animate-slideIn">
      <div className="flex items-center justify-center gap-8">
        {mode === FlashcardMode.PINYIN ? (
          <>
            <div
              className="text-8xl font-bold text-text-primary mb-5 drop-shadow-lg leading-none"
              data-testid="simplified-character"
            >
              {simplifiedChar}
            </div>
            <div
              className="text-8xl font-bold text-accent mb-5 drop-shadow-lg leading-none"
              data-testid="traditional-character"
            >
              {traditionalChar}
            </div>
          </>
        ) : mode === FlashcardMode.SIMPLIFIED ? (
          <div
            className="text-8xl font-bold text-accent mb-5 drop-shadow-lg leading-none"
            data-testid="traditional-character"
          >
            {traditionalChar}
          </div>
        ) : (
          <div
            className="text-8xl font-bold text-text-primary mb-5 drop-shadow-lg leading-none"
            data-testid="simplified-character"
          >
            {simplifiedChar}
          </div>
        )}
      </div>

      <div className="min-h-[40px] flex items-center justify-center">
        <div
          className="text-base text-text-tertiary font-medium transition-all duration-300 opacity-100 px-3 py-2 bg-transparent rounded-lg border-2 border-transparent"
          data-testid="hint-text"
        >
          {hintText}
        </div>
      </div>
    </div>
  );
};
