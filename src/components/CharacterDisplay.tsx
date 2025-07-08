import React from 'react';
import { CharacterSection, ChineseCharacter, HintSection, HintText } from './styled';
import { getCharacterByIndex, getHintText } from '../utils/characterUtils';
import { HintType, HINT_TYPES } from '../types';

interface CharacterDisplayProps {
  currentIndex: number;
  hintType: HintType;
}

export const CharacterDisplay: React.FC<CharacterDisplayProps> = ({
  currentIndex,
  hintType,
}) => {
  const character = getCharacterByIndex(currentIndex);
  const hintText = getHintText(character, hintType);

  return (
    <CharacterSection>
      <ChineseCharacter data-testid="main-character">
        {character?.chinese || '?'}
      </ChineseCharacter>
      
      <HintSection>
        <HintText $visible={hintType !== HINT_TYPES.NONE} data-testid="hint-text">
          {hintText}
        </HintText>
      </HintSection>
    </CharacterSection>
  );
}; 
