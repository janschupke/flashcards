import React from 'react';
import styled from 'styled-components';
import { ModeToggleButtonsProps, FlashcardMode } from '../types';

const ButtonContainer = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
  width: 100%;
`;

const ModeButton = styled.button<{ isActive: boolean }>`
  flex: 1;
  padding: 12px 16px;
  border: 2px solid ${props => props.isActive ? '#dc2626' : '#e5e7eb'};
  background-color: ${props => props.isActive ? '#dc2626' : '#ffffff'};
  color: ${props => props.isActive ? '#ffffff' : '#374151'};
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  
  &:hover {
    background-color: ${props => props.isActive ? '#b91c1c' : '#f3f4f6'};
    border-color: ${props => props.isActive ? '#b91c1c' : '#d1d5db'};
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
    <ButtonContainer>
      <ModeButton
        isActive={currentMode === 'pinyin'}
        onClick={() => handleModeChange('pinyin')}
        title="拼音模式 - Pinyin Mode (1)"
      >
        拼音
      </ModeButton>
      <ModeButton
        isActive={currentMode === 'simplified'}
        onClick={() => handleModeChange('simplified')}
        title="简体模式 - Simplified Mode (2)"
      >
        简体
      </ModeButton>
      <ModeButton
        isActive={currentMode === 'traditional'}
        onClick={() => handleModeChange('traditional')}
        title="繁体模式 - Traditional Mode (3)"
      >
        繁体
      </ModeButton>
    </ButtonContainer>
  );
}; 
