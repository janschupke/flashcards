import React from 'react';
import { CharacterDisplayToggleProps } from '../types';
import styled from 'styled-components';

const ToggleContainer = styled.div`
  display: flex;
  justify-content: center;
  margin: 1rem 0;
  gap: 0.5rem;
`;

const ToggleButton = styled.button<{ active: boolean }>`
  padding: 0.5rem 1rem;
  border: 2px solid ${props => props.active ? '#007bff' : '#e9ecef'};
  background-color: ${props => props.active ? '#007bff' : '#ffffff'};
  color: ${props => props.active ? '#ffffff' : '#495057'};
  border-radius: 0.375rem;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s ease-in-out;

  &:hover {
    border-color: ${props => props.active ? '#0056b3' : '#007bff'};
    background-color: ${props => props.active ? '#0056b3' : '#f8f9fa'};
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.25);
  }
`;

export const CharacterDisplayToggle: React.FC<CharacterDisplayToggleProps> = ({
  displayMode,
  onModeChange,
}) => {
  return (
    <ToggleContainer>
      <ToggleButton
        active={displayMode === 'simplified'}
        onClick={() => onModeChange('simplified')}
        aria-label="Show simplified characters"
      >
        Simplified
      </ToggleButton>
      <ToggleButton
        active={displayMode === 'traditional'}
        onClick={() => onModeChange('traditional')}
        aria-label="Show traditional characters"
      >
        Traditional
      </ToggleButton>
      <ToggleButton
        active={displayMode === 'both'}
        onClick={() => onModeChange('both')}
        aria-label="Show both simplified and traditional characters"
      >
        Both
      </ToggleButton>
    </ToggleContainer>
  );
}; 
