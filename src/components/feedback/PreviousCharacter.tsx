import React from 'react';
import styled from 'styled-components';
import data from '../../data/characters.json';

interface PreviousCharacterProps {
  previousCharacterIndex: number | null;
}

const PreviousCharacterContainer = styled.div`
  margin-top: 2rem;
  padding: 1rem;
  background: #2d3748;
  border-radius: 12px;
  border: 1px solid #4a5568;
`;

const PreviousLabel = styled.div`
  font-size: 0.75rem;
  color: #718096;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const CharacterInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  font-size: 0.875rem;
  color: #e2e8f0;
`;

const InfoItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
`;

const Label = styled.div`
  font-size: 0.625rem;
  color: #718096;
  margin-bottom: 0.25rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const Value = styled.div`
  font-size: 1rem;
  font-weight: 500;
  color: #a0aec0;
`;

const TraditionalValue = styled(Value)`
  color: #a0aec0;
`;

const PLACEHOLDER = '—';

export const PreviousCharacter: React.FC<PreviousCharacterProps> = ({
  previousCharacterIndex,
}) => {
  let character = null;
  if (
    previousCharacterIndex !== null &&
    previousCharacterIndex >= 0 &&
    previousCharacterIndex < data.length
  ) {
    character = data[previousCharacterIndex];
  }

  return (
    <PreviousCharacterContainer>
      <PreviousLabel>Previous Character</PreviousLabel>
      <CharacterInfo>
        <InfoItem>
          <Label>Simplified</Label>
          <Value>{character ? character.simplified : PLACEHOLDER}</Value>
        </InfoItem>
        <InfoItem>
          <Label>Traditional</Label>
          <TraditionalValue>{character ? character.traditional : PLACEHOLDER}</TraditionalValue>
        </InfoItem>
        <InfoItem>
          <Label>Pinyin</Label>
          <Value>{character ? character.pinyin : PLACEHOLDER}</Value>
        </InfoItem>
        <InfoItem>
          <Label>English</Label>
          <Value>{character ? character.english : PLACEHOLDER}</Value>
        </InfoItem>
      </CharacterInfo>
    </PreviousCharacterContainer>
  );
}; 
