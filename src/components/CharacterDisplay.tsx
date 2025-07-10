import React from 'react';
import { CharacterSection, ChineseCharacter, HintSection, HintText } from './styled';
import { getCharacterByIndex, getHintText, getDisplayCharacter } from '../utils/characterUtils';
import { HintType, HINT_TYPES, FlashcardMode } from '../types';
import styled from 'styled-components';

interface CharacterDisplayProps {
  currentIndex: number;
  hintType: HintType;
  mode: FlashcardMode;
}

const CharacterContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2rem;
`;

const TraditionalCharacter = styled(ChineseCharacter)`
  color: #6f42c1;
`;

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
    <CharacterSection>
      <CharacterContainer>
        {mode === 'pinyin' ? (
          <>
            <ChineseCharacter data-testid="simplified-character">
              {simplifiedChar}
            </ChineseCharacter>
            <TraditionalCharacter data-testid="traditional-character">
              {traditionalChar}
            </TraditionalCharacter>
          </>
        ) : mode === 'simplified' ? (
          <TraditionalCharacter data-testid="traditional-character">
            {traditionalChar}
          </TraditionalCharacter>
        ) : (
          <ChineseCharacter data-testid="simplified-character">
            {simplifiedChar}
          </ChineseCharacter>
        )}
      </CharacterContainer>
      
      <HintSection>
        <HintText 
          $visible={hintType !== HINT_TYPES.NONE}
          $isDefault={hintType === HINT_TYPES.NONE}
          data-testid="hint-text"
        >
          {hintText}
        </HintText>
      </HintSection>
    </CharacterSection>
  );
}; 
