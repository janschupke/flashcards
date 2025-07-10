import styled from 'styled-components';
import { theme } from '../../theme';

interface ButtonProps {
  $variant?: 'primary' | 'secondary';
  $size?: 'sm' | 'md' | 'lg';
}

export const Button = styled.button<ButtonProps>`
  padding: ${props => {
    switch (props.$size) {
      case 'sm': return `${theme.spacing.sm} ${theme.spacing.md}`;
      case 'lg': return `${theme.spacing.lg} ${theme.spacing.xl}`;
      default: return `${theme.spacing.md} ${theme.spacing.xl}`;
    }
  }};
  border: none;
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.typography.fontSize.base};
  font-weight: ${theme.typography.fontWeight.semibold};
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: inherit;
  min-width: ${theme.spacing.xxl};
  
  ${props => props.$variant === 'primary' ? `
    background: linear-gradient(135deg, ${theme.colors.primary.main}, ${theme.colors.primary.dark});
    color: ${theme.colors.text.primary};
    
    &:hover {
      transform: translateY(-2px);
    }
  ` : `
    background: ${theme.colors.secondary.main};
    color: ${theme.colors.text.secondary};
    border: 2px solid ${theme.colors.background.secondary};
    
    &:hover {
      background: ${theme.colors.background.secondary};
      border-color: ${theme.colors.primary.main};
      transform: translateY(-1px);
    }
  `}
  
  &:active {
    transform: translateY(0);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`; 
