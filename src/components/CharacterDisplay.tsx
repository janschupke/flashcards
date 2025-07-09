import React from 'react';
import { CharacterSection, ChineseCharacter, HintSection, HintText } from './styled';
import { getCharacterByIndex, getHintText } from '../utils/characterUtils';
import { HintType, HINT_TYPES } from '../types';
import { getTraditionalCharacter } from '../utils/traditionalMapping';
import styled from 'styled-components';

interface CharacterDisplayProps {
  currentIndex: number;
  hintType: HintType;
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
}) => {
  const character = getCharacterByIndex(currentIndex);
  const hintText = getHintText(character, hintType);
  
  const simplifiedChar = character?.chinese || '?';
  const traditionalChar = character?.traditional || getTraditionalCharacter(simplifiedChar);

  return (
    <CharacterSection>
      <CharacterContainer>
        <ChineseCharacter data-testid="simplified-character">
          {simplifiedChar}
        </ChineseCharacter>
        <TraditionalCharacter data-testid="traditional-character">
          {traditionalChar}
        </TraditionalCharacter>
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
