import React from 'react';
import { getCharacterByIndex, getHintText, getDisplayCharacter } from '../../utils/characterUtils';
import { HintType, HINT_TYPES, FlashcardMode } from '../../types';

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
  const displayChars = character ? getDisplayCharacter(character, mode) : { simplified: '?', traditional: '?' };
  
  const simplifiedChar = displayChars.simplified || '?';
  const traditionalChar = displayChars.traditional || '?';

  return (
    <div className="animate-slideIn">
      <div className="flex items-center justify-center gap-8">
        {mode === 'pinyin' ? (
          <>
            <div className="text-[6rem] font-bold text-white mb-5 drop-shadow-[0_4px_8px_rgba(0,0,0,0.3)] animate-pulseCard leading-none" data-testid="simplified-character">
              {simplifiedChar}
            </div>
            <div className="text-[6rem] font-bold text-[#6f42c1] mb-5 drop-shadow-[0_4px_8px_rgba(0,0,0,0.3)] animate-pulseCard leading-none" data-testid="traditional-character">
              {traditionalChar}
            </div>
          </>
        ) : mode === 'simplified' ? (
          <div className="text-[6rem] font-bold text-[#6f42c1] mb-5 drop-shadow-[0_4px_8px_rgba(0,0,0,0.3)] animate-pulseCard leading-none" data-testid="traditional-character">
            {traditionalChar}
          </div>
        ) : (
          <div className="text-[6rem] font-bold text-white mb-5 drop-shadow-[0_4px_8px_rgba(0,0,0,0.3)] animate-pulseCard leading-none" data-testid="simplified-character">
            {simplifiedChar}
          </div>
        )}
      </div>

      <div className="min-h-[60px] flex items-center justify-center">
        <div className="text-[1.5rem] text-secondary-light font-medium transition-all duration-300 opacity-100 px-4 py-3 bg-transparent rounded-xl border-2 border-transparent" data-testid="hint-text">
          {hintText}
        </div>
      </div>
    </div>
  );
}; 
