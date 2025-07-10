import React from 'react';
import styled from 'styled-components';
import { ModeToggleButtonsProps, FlashcardMode } from '../types';

const Container = styled.div`
  margin-bottom: 20px;
`;

const Title = styled.h3`
  margin: 0 0 12px 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #a0aec0;
  text-align: center;
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 8px;
  width: 100%;
`;

const ModeButton = styled.button<{ isActive: boolean }>`
  flex: 1;
  padding: 12px 16px;
  border: 2px solid ${props => props.isActive ? '#dc2626' : '#4a5568'};
  background-color: ${props => props.isActive ? '#dc2626' : '#2d3748'};
  color: ${props => props.isActive ? '#ffffff' : '#e2e8f0'};
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  
  &:hover {
    background-color: ${props => props.isActive ? '#b91c1c' : '#4a5568'};
    border-color: ${props => props.isActive ? '#b91c1c' : '#718096'};
  }
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
  }
  
  &:active {
    transform: translateY(1px);
  }
`;

export const ModeToggleButtons: React.FC<ModeToggleButtonsProps> = ({
  currentMode,
  onModeChange,
}) => {
  const handleModeChange = (mode: FlashcardMode) => {
    if (mode !== currentMode) {
      onModeChange(mode);
    }
  };

  return (
    <Container>
      <Title>Flashcard Mode</Title>
      <ButtonContainer>
        <ModeButton
          isActive={currentMode === 'pinyin'}
          onClick={() => handleModeChange('pinyin')}
          title="拼音模式 - Pinyin Mode (F1)"
        >
          拼音 (F1)
        </ModeButton>
        <ModeButton
          isActive={currentMode === 'simplified'}
          onClick={() => handleModeChange('simplified')}
          title="简体模式 - Simplified Mode (F2)"
        >
          简体 (F2)
        </ModeButton>
        <ModeButton
          isActive={currentMode === 'traditional'}
          onClick={() => handleModeChange('traditional')}
          title="繁体模式 - Traditional Mode (F3)"
        >
          繁体 (F3)
        </ModeButton>
      </ButtonContainer>
    </Container>
  );
}; 
