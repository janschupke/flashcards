import React from 'react';
import { CharacterSection, ChineseCharacter, HintSection, HintText } from './styled';
import { getCharacterByIndex, getHintText } from '../utils/characterUtils';
import { HintType, HINT_TYPES, DisplayMode } from '../types';
import { getTraditionalCharacter } from '../utils/traditionalMapping';
import styled from 'styled-components';

interface CharacterDisplayProps {
  currentIndex: number;
  hintType: HintType;
  displayMode: DisplayMode;
}

const CharacterContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
`;

const CharacterRow = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const CharacterLabel = styled.span`
  font-size: 0.75rem;
  color: #6c757d;
  text-transform: uppercase;
  font-weight: 600;
`;

const TraditionalCharacter = styled(ChineseCharacter)`
  color: #6f42c1;
`;

export const CharacterDisplay: React.FC<CharacterDisplayProps> = ({
  currentIndex,
  hintType,
  displayMode,
}) => {
  const character = getCharacterByIndex(currentIndex);
  const hintText = getHintText(character, hintType);
  
  const simplifiedChar = character?.chinese || '?';
  const traditionalChar = character?.traditional || getTraditionalCharacter(simplifiedChar);

  const renderCharacter = () => {
    switch (displayMode) {
      case 'simplified':
        return (
          <ChineseCharacter data-testid="main-character">
            {simplifiedChar}
          </ChineseCharacter>
        );
      
      case 'traditional':
        return (
          <TraditionalCharacter data-testid="main-character">
            {traditionalChar}
          </TraditionalCharacter>
        );
      
      case 'both':
        return (
          <CharacterContainer>
            <CharacterRow>
              <CharacterLabel>Simplified:</CharacterLabel>
              <ChineseCharacter data-testid="simplified-character">
                {simplifiedChar}
              </ChineseCharacter>
            </CharacterRow>
            <CharacterRow>
              <CharacterLabel>Traditional:</CharacterLabel>
              <TraditionalCharacter data-testid="traditional-character">
                {traditionalChar}
              </TraditionalCharacter>
            </CharacterRow>
          </CharacterContainer>
        );
      
      default:
        return (
          <ChineseCharacter data-testid="main-character">
            {simplifiedChar}
          </ChineseCharacter>
        );
    }
  };

  return (
    <CharacterSection>
      {renderCharacter()}
      
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
