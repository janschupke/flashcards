import styled, { keyframes } from "styled-components";

// Animations
export const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

export const slideIn = keyframes`
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

export const pulse = keyframes`
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
`;

// Layout Components
export const PageContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #2d3748 0%, #1a202c 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
`;

export const Card = styled.div`
  background: rgba(45, 55, 72, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 24px;
  padding: 40px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  max-width: 600px;
  width: 100%;
  text-align: center;
  animation: ${fadeIn} 0.6s ease-out;
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

export const Header = styled.div`
  margin-bottom: 30px;
`;

export const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 10px 0;
  background: linear-gradient(135deg, #dc2626, #b91c1c);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

export const Subtitle = styled.p`
  color: #a0aec0;
  font-size: 1.1rem;
  margin: 0;
  font-weight: 400;
`;

// Settings Components
export const SettingsSection = styled.div`
  margin-bottom: 30px;
  padding: 20px;
  background: rgba(220, 38, 38, 0.1);
  border-radius: 16px;
  border: 1px solid rgba(220, 38, 38, 0.2);
`;

export const SettingsLabel = styled.label`
  display: block;
  font-size: 0.9rem;
  font-weight: 600;
  color: #e2e8f0;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

export const SettingsInput = styled.input`
  width: 100%;
  max-width: 200px;
  padding: 12px 16px;
  border: 2px solid #4a5568;
  border-radius: 12px;
  font-size: 1rem;
  font-family: inherit;
  transition: all 0.3s ease;
  outline: none;
  background: #2d3748;
  color: #ffffff;
  
  &:focus {
    border-color: #dc2626;
    box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
  }
  
  &::placeholder {
    color: #718096;
  }
`;

// Character Components
export const CharacterSection = styled.div`
  margin-bottom: 30px;
  animation: ${slideIn} 0.4s ease-out;
`;

export const ChineseCharacter = styled.div`
  font-size: 6rem;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 20px;
  text-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  animation: ${pulse} 2s ease-in-out infinite;
  line-height: 1;
`;

export const HintSection = styled.div`
  min-height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 30px;
`;

export const HintText = styled.div<{ $visible: boolean; $isDefault: boolean }>`
  font-size: 1.5rem;
  color: #718096;
  font-weight: 500;
  transition: all 0.3s ease;
  opacity: ${props => props.$visible ? 1 : 0.6};
  padding: 16px 24px;
  background: transparent;
  border-radius: 12px;
  border: 2px solid transparent;
`;

// Button Components
export const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
`;

export const Button = styled.button<{ $primary?: boolean }>`
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
    background: linear-gradient(135deg, #dc2626, #b91c1c);
    color: white;
    
    &:hover {
      transform: translateY(-2px);
    }
  ` : `
    background: #4a5568;
    color: #e2e8f0;
    border: 2px solid #2d3748;
    
    &:hover {
      background: #2d3748;
      border-color: #dc2626;
      transform: translateY(-1px);
    }
  `}
  
  &:active {
    transform: translateY(0);
  }
`;

// Progress Components
export const ProgressBar = styled.div.attrs({ role: 'progressbar' })`
  width: 100%;
  height: 6px;
  background: #4a5568;
  border-radius: 3px;
  margin-bottom: 20px;
  overflow: hidden;
`;

export const ProgressFill = styled.div<{ $progress: number }>`
  height: 100%;
  background: linear-gradient(90deg, #dc2626, #b91c1c);
  border-radius: 3px;
  transition: width 0.3s ease;
  width: ${props => props.$progress}%;
`;

// Stats Components
export const Stats = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
  padding: 16px;
  background: rgba(220, 38, 38, 0.1);
  border-radius: 12px;
  font-size: 0.9rem;
  color: #e2e8f0;
  border: 1px solid rgba(220, 38, 38, 0.2);
`;

export const StatItem = styled.div`
  text-align: center;
`;

export const StatValue = styled.div`
  font-weight: 700;
  color: #dc2626;
  font-size: 1.1rem;
`;

export const StatLabel = styled.div`
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-top: 4px;
  color: #a0aec0;
`; 
