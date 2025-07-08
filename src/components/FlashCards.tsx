import React, { useState, useEffect } from 'react';
import styled, { keyframes } from "styled-components";
import data from '../output.json';

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const slideIn = keyframes`
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

const pulse = keyframes`
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
`;

const PageContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
`;

const Card = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 24px;
  padding: 40px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  max-width: 600px;
  width: 100%;
  text-align: center;
  animation: ${fadeIn} 0.6s ease-out;
`;

const Header = styled.div`
  margin-bottom: 30px;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  color: #2d3748;
  margin: 0 0 10px 0;
  background: linear-gradient(135deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const Subtitle = styled.p`
  color: #718096;
  font-size: 1.1rem;
  margin: 0;
  font-weight: 400;
`;

const SettingsSection = styled.div`
  margin-bottom: 30px;
  padding: 20px;
  background: rgba(102, 126, 234, 0.05);
  border-radius: 16px;
  border: 1px solid rgba(102, 126, 234, 0.1);
`;

const SettingsLabel = styled.label`
  display: block;
  font-size: 0.9rem;
  font-weight: 600;
  color: #4a5568;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const SettingsInput = styled.input`
  width: 100%;
  max-width: 200px;
  padding: 12px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 1rem;
  font-family: inherit;
  transition: all 0.3s ease;
  outline: none;
  background: white;
  
  &:focus {
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
  
  &::placeholder {
    color: #a0aec0;
  }
`;

const CharacterSection = styled.div`
  margin-bottom: 30px;
  animation: ${slideIn} 0.4s ease-out;
`;

const ChineseCharacter = styled.div`
  font-size: 6rem;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 20px;
  text-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  animation: ${pulse} 2s ease-in-out infinite;
  line-height: 1;
`;

const HintSection = styled.div`
  min-height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 30px;
`;

const HintText = styled.div<{ $visible: boolean }>`
  font-size: 1.5rem;
  color: ${props => props.$visible ? '#667eea' : '#a0aec0'};
  font-weight: 500;
  transition: all 0.3s ease;
  opacity: ${props => props.$visible ? 1 : 0.6};
  padding: 16px 24px;
  background: ${props => props.$visible ? 'rgba(102, 126, 234, 0.1)' : 'transparent'};
  border-radius: 12px;
  border: 2px solid ${props => props.$visible ? '#667eea' : 'transparent'};
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
`;

const Button = styled.button<{ $primary?: boolean }>`
  padding: 14px 24px;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: inherit;
  min-width: 100px;
  
  ${props => props.$primary ? `
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: white;
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
    }
  ` : `
    background: white;
    color: #4a5568;
    border: 2px solid #e2e8f0;
    
    &:hover {
      background: #f7fafc;
      border-color: #cbd5e0;
      transform: translateY(-1px);
    }
  `}
  
  &:active {
    transform: translateY(0);
  }
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 6px;
  background: #e2e8f0;
  border-radius: 3px;
  margin-bottom: 20px;
  overflow: hidden;
`;

const ProgressFill = styled.div<{ $progress: number }>`
  height: 100%;
  background: linear-gradient(90deg, #667eea, #764ba2);
  border-radius: 3px;
  transition: width 0.3s ease;
  width: ${props => props.$progress}%;
`;

const Stats = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
  padding: 16px;
  background: rgba(102, 126, 234, 0.05);
  border-radius: 12px;
  font-size: 0.9rem;
  color: #4a5568;
`;

const StatItem = styled.div`
  text-align: center;
`;

const StatValue = styled.div`
  font-weight: 700;
  color: #667eea;
  font-size: 1.1rem;
`;

const StatLabel = styled.div`
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-top: 4px;
`;

export const FlashCards = () => {
  const [limit, setLimit] = useState(100);
  const [current, setCurrent] = useState(() => Math.floor(Math.random() * 100));
  const [hint, setHint] = useState(0);
  const [progress, setProgress] = useState(0);
  const [totalSeen, setTotalSeen] = useState(0);

  useEffect(() => {
    setProgress((totalSeen / limit) * 100);
  }, [totalSeen, limit]);

  const getNext = () => {
    const min = 0;
    const next = Math.floor(Math.random() * (limit - min + 1) + min);
    setCurrent(next);
    setHint(0);
    setTotalSeen(prev => prev + 1);
  };

  const toggleHint = (newHint: number) => {
    const result = hint === newHint ? 0 : newHint;
    setHint(result);
  };

  const adjustSetup = (limit: string) => {
    const newLimit = parseInt(limit) || 100;
    setLimit(newLimit);
    setCurrent(Math.floor(Math.random() * newLimit));
    setTotalSeen(0);
    setProgress(0);
    setHint(0);
  };

  const getHintText = () => {
    if (hint === 0) return 'Tap a button below to reveal';
    if (hint === 1) return data[current].pinyin;
    if (hint === 2) return data[current].english;
    return '';
  };

  // Handle keyboard events
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'Enter') {
        getNext();
      } else if (event.key === 'p' || event.key === 'P') {
        toggleHint(1);
      } else if (event.key === 'e' || event.key === 'E') {
        toggleHint(2);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, []); // Remove hint dependency to prevent event listener recreation

  return (
    <PageContainer>
      <Card>
        <Header>
          <Title>汉字 Flashcards</Title>
          <Subtitle>Learn Chinese characters with interactive flashcards</Subtitle>
        </Header>

        <SettingsSection>
          <SettingsLabel htmlFor="limit">Character Range</SettingsLabel>
          <SettingsInput
            id="limit"
            type="number"
            value={limit}
            onChange={e => adjustSetup(e.target.value)}
            placeholder="100"
            min="1"
            max="1500"
          />
        </SettingsSection>

        <ProgressBar>
          <ProgressFill $progress={progress} />
        </ProgressBar>

        <CharacterSection>
          <ChineseCharacter>
            {data[current].chinese}
          </ChineseCharacter>
          
          <HintSection>
            <HintText $visible={hint > 0}>
              {getHintText()}
            </HintText>
          </HintSection>
        </CharacterSection>

        <ButtonGroup>
          <Button onClick={() => toggleHint(1)}>
            Pinyin (P)
          </Button>
          <Button onClick={() => toggleHint(2)}>
            English (E)
          </Button>
          <Button $primary onClick={getNext}>
            Next (Enter)
          </Button>
        </ButtonGroup>

        <Stats>
          <StatItem>
            <StatValue>{current + 1}</StatValue>
            <StatLabel>Current</StatLabel>
          </StatItem>
          <StatItem>
            <StatValue>{totalSeen}</StatValue>
            <StatLabel>Seen</StatLabel>
          </StatItem>
          <StatItem>
            <StatValue>{limit}</StatValue>
            <StatLabel>Total</StatLabel>
          </StatItem>
        </Stats>
      </Card>
    </PageContainer>
  );
};
