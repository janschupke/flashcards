# Project Refactoring Plan (PRP) - Chinese Flashcards Application

## Executive Summary

This document outlines a comprehensive refactoring plan for the Chinese Flashcards application. The application is a React-based flashcard system for learning Chinese characters with three modes: Pinyin, Simplified, and Traditional character input. The refactoring focuses on improving code structure, eliminating hardcoded values, reducing duplication, enhancing UI consistency, and ensuring maintainability.

## Current State Analysis

### Application Overview
- **Purpose**: Interactive flashcard app for learning 1,500 most common Chinese characters
- **Tech Stack**: React 19.1.0, TypeScript 5.8.3, Vite 7.0.2, styled-components 6.1.19
- **Modes**: Pinyin (default), Simplified, Traditional character input
- **Features**: Progress tracking, keyboard shortcuts, hint system, incorrect answers tracking

### Current Issues Identified

#### 1. Hardcoded Values and Magic Numbers
- **1500**: Total character limit for pinyin mode
- **539**: Character limit for simplified/traditional modes
- **50**: Minimum limit, increment/decrement values
- **1000**: Animation timeout values
- **100**: Various percentage and width values
- Chinese text strings scattered throughout components

#### 2. File Structure Issues
- Mixed concerns in some components
- Inconsistent naming conventions
- Some utility functions could be better organized

#### 3. Code Duplication
- Similar input components (PinyinInput, CharacterInput)
- Repeated styled-components definitions
- Duplicate validation logic

#### 4. UI/UX Inconsistencies
- Inconsistent color usage across components
- Mixed styling approaches
- No centralized theme system

#### 5. Test Issues
- Some React prop warnings in tests
- ESLint configuration syntax error
- Some tests could be more comprehensive

## Refactoring Objectives

### Primary Goals
1. **Eliminate hardcoded values** by creating proper constants and enums
2. **Improve file structure** and component organization
3. **Reduce code duplication** through better abstraction
4. **Unify UI/UX** with consistent theming
5. **Enhance maintainability** through better separation of concerns
6. **Fix all linting and test issues**

### Secondary Goals
1. **Improve type safety** with better TypeScript usage
2. **Enhance performance** through better memoization
3. **Improve accessibility** with better ARIA attributes
4. **Better error handling** and user feedback

## Detailed Implementation Plan

### Phase 1: Constants and Configuration (Priority: High)

#### 1.1 Create Constants File
**File**: `src/constants/index.ts`
```typescript
// Application limits
export const APP_LIMITS = {
  PINYIN_MODE_MAX: 1500,
  SIMPLIFIED_TRADITIONAL_MAX: 539,
  MIN_LIMIT: 50,
  DEFAULT_LIMIT: 500,
} as const;

// Animation timings
export const ANIMATION_TIMINGS = {
  FLASH_RESULT_DURATION: 1000,
  PROGRESS_UPDATE_DELAY: 300,
} as const;

// UI constants
export const UI_CONSTANTS = {
  INCREMENT_STEP: 50,
  PROGRESS_MAX: 100,
  MIN_WIDTH: 100,
} as const;

// Chinese text constants
export const CHINESE_TEXT = {
  APP_TITLE: '汉字 Flashcards',
  APP_SUBTITLE: 'Learn Chinese characters with interactive flashcards',
  MODES: {
    PINYIN: {
      LABEL: '拼音 (F1)',
      TITLE: '拼音模式 - Pinyin Mode (F1)',
      PLACEHOLDER: '输入拼音',
    },
    SIMPLIFIED: {
      LABEL: '简体 (F2)',
      TITLE: '简体模式 - Simplified Mode (F2)',
      PLACEHOLDER: '输入简体字',
    },
    TRADITIONAL: {
      LABEL: '繁体 (F3)',
      TITLE: '繁体模式 - Traditional Mode (F3)',
      PLACEHOLDER: '输入繁体字',
    },
  },
  FEEDBACK: {
    CORRECT: '✓ 正确',
    INCORRECT_PINYIN: (correct: string) => `✗ 错误，正确答案是: ${correct}`,
    INCORRECT_CHARACTER: (correct: string) => `✗ 错误，正确答案是: ${correct}`,
  },
  LABELS: {
    CHARACTER_RANGE: (min: number, max: number) => `Character Range (${min} - ${max})`,
  },
} as const;
```

#### 1.2 Update Types with Enums
**File**: `src/types/index.ts`
```typescript
// Add new enums
export enum FlashcardMode {
  PINYIN = 'pinyin',
  SIMPLIFIED = 'simplified',
  TRADITIONAL = 'traditional',
}

export enum HintType {
  NONE = 'NONE',
  PINYIN = 'PINYIN',
  ENGLISH = 'ENGLISH',
}

export enum FlashResult {
  CORRECT = 'correct',
  INCORRECT = 'incorrect',
}

// Update existing constants to use enums
export const HINT_TYPES = {
  NONE: HintType.NONE,
  PINYIN: HintType.PINYIN,
  ENGLISH: HintType.ENGLISH,
} as const;
```

### Phase 2: Theme System (Priority: High)

#### 2.1 Create Theme Configuration
**File**: `src/theme/index.ts`
```typescript
export const colors = {
  primary: {
    main: '#dc2626',
    light: '#ef4444',
    dark: '#b91c1c',
  },
  secondary: {
    main: '#4a5568',
    light: '#718096',
    dark: '#2d3748',
  },
  background: {
    primary: '#1a202c',
    secondary: '#2d3748',
    card: 'rgba(45, 55, 72, 0.95)',
  },
  text: {
    primary: '#ffffff',
    secondary: '#e2e8f0',
    muted: '#a0aec0',
  },
  feedback: {
    success: '#10b981',
    error: '#ef4444',
    warning: '#f59e0b',
  },
  border: {
    primary: 'rgba(255, 255, 255, 0.1)',
    secondary: 'rgba(220, 38, 38, 0.2)',
  },
} as const;

export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '20px',
  xl: '24px',
  xxl: '40px',
} as const;

export const borderRadius = {
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '24px',
} as const;

export const typography = {
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  fontSize: {
    xs: '0.8rem',
    sm: '0.9rem',
    base: '1rem',
    lg: '1.1rem',
    xl: '1.5rem',
    '2xl': '2.5rem',
    '6xl': '6rem',
  },
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
} as const;

export const shadows = {
  card: '0 20px 40px rgba(0, 0, 0, 0.3)',
  focus: '0 0 0 3px rgba(220, 38, 38, 0.1)',
} as const;

export const theme = {
  colors,
  spacing,
  borderRadius,
  typography,
  shadows,
} as const;
```

#### 2.2 Create Styled Components Theme Provider
**File**: `src/theme/styled.ts`
```typescript
import { createGlobalStyle } from 'styled-components';
import { theme } from './index';

export const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html, body {
    height: 100%;
    font-family: ${theme.typography.fontFamily};
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  #root {
    height: 100%;
  }

  button {
    font-family: inherit;
  }

  input {
    font-family: inherit;
  }
`;
```

### Phase 3: Component Refactoring (Priority: High)

#### 3.1 Create Unified Input Component
**File**: `src/components/common/FlashcardInput.tsx`
```typescript
import React, { forwardRef, useState, useEffect } from 'react';
import { InputContainer, InputBorderWrapper, InputField, FeedbackText } from '../styled';
import { CHINESE_TEXT } from '../../constants';

interface FlashcardInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (value: string) => void;
  isCorrect: boolean | null;
  disabled?: boolean;
  flashResult?: 'correct' | 'incorrect' | null;
  mode: 'pinyin' | 'simplified' | 'traditional';
  expectedValue: string;
}

export const FlashcardInput = forwardRef<HTMLInputElement, FlashcardInputProps>(
  ({
    value,
    onChange,
    onSubmit,
    isCorrect,
    disabled = false,
    flashResult,
    mode,
    expectedValue,
  }, ref) => {
    const [isFlashing, setIsFlashing] = useState(false);

    useEffect(() => {
      if (flashResult) {
        setIsFlashing(true);
        const timer = setTimeout(() => {
          setIsFlashing(false);
        }, 1000);
        return () => clearTimeout(timer);
      }
    }, [flashResult]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(e.target.value);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && !disabled) {
        onSubmit(value);
      }
    };

    const getPlaceholder = () => {
      switch (mode) {
        case 'pinyin':
          return CHINESE_TEXT.MODES.PINYIN.PLACEHOLDER;
        case 'simplified':
          return CHINESE_TEXT.MODES.SIMPLIFIED.PLACEHOLDER;
        case 'traditional':
          return CHINESE_TEXT.MODES.TRADITIONAL.PLACEHOLDER;
        default:
          return '输入字符';
      }
    };

    const getFeedbackText = () => {
      if (isCorrect === true) {
        return CHINESE_TEXT.FEEDBACK.CORRECT;
      }
      if (isCorrect === false) {
        return mode === 'pinyin' 
          ? CHINESE_TEXT.FEEDBACK.INCORRECT_PINYIN(expectedValue)
          : CHINESE_TEXT.FEEDBACK.INCORRECT_CHARACTER(expectedValue);
      }
      return '';
    };

    return (
      <InputContainer>
        <InputBorderWrapper
          $isCorrect={isCorrect}
          $flashResult={flashResult}
          $isFlashing={isFlashing}
        >
          <InputField
            ref={ref}
            type="text"
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder={getPlaceholder()}
            disabled={disabled}
            data-testid={`${mode}-input`}
          />
        </InputBorderWrapper>
        <FeedbackText isCorrect={isCorrect}>
          {getFeedbackText()}
        </FeedbackText>
      </InputContainer>
    );
  }
);
```

#### 3.2 Refactor Existing Input Components
- Update `PinyinInput.tsx` to use the new unified component
- Update `CharacterInput.tsx` to use the new unified component
- Remove duplicate code and styling

#### 3.3 Create Common Button Component
**File**: `src/components/common/Button.tsx`
```typescript
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
```

### Phase 4: Utility Functions Refactoring (Priority: Medium)

#### 4.1 Consolidate Character Utilities
**File**: `src/utils/characterUtils.ts`
- Move all character-related functions here
- Add proper TypeScript types
- Use constants from the new constants file

#### 4.2 Create Validation Utilities
**File**: `src/utils/validationUtils.ts`
```typescript
import { APP_LIMITS, UI_CONSTANTS } from '../constants';

export const validateLimit = (value: string, minAvailable: number, maxAvailable: number): number => {
  const parsed = parseInt(value, 10);
  if (isNaN(parsed) || parsed <= 0) {
    return Math.max(minAvailable, Math.min(UI_CONSTANTS.MIN_WIDTH, maxAvailable));
  }
  return Math.max(minAvailable, Math.min(parsed, maxAvailable));
};

export const getModeSpecificLimit = (mode: 'pinyin' | 'simplified' | 'traditional'): number => {
  return mode === 'pinyin' ? APP_LIMITS.PINYIN_MODE_MAX : APP_LIMITS.SIMPLIFIED_TRADITIONAL_MAX;
};
```

### Phase 5: Hook Refactoring (Priority: Medium)

#### 5.1 Refactor useFlashCard Hook
- Use constants instead of hardcoded values
- Improve state management
- Add better error handling
- Improve performance with better memoization

#### 5.2 Create Custom Hooks for Specific Features
**File**: `src/hooks/useKeyboardShortcuts.ts`
- Improve keyboard shortcut handling
- Add better event cleanup

**File**: `src/hooks/useAnimation.ts`
- Centralize animation logic
- Use constants for timing

### Phase 6: Test Improvements (Priority: Medium)

#### 6.1 Fix ESLint Configuration
**File**: `.eslintrc`
```json
{
  "parser": "@typescript-eslint/parser",
  "plugins": ["@typescript-eslint", "eslint-plugin-react"],
  "env": {
    "commonjs": true,
    "es6": true,
    "node": true
  },
  "extends": "eslint:recommended",
  "parserOptions": {
    "ecmaVersion": 2018,
    "sourceType": "module"
  },
  "rules": {
    "indent": ["error", 2],
    "no-console": "error",
    "func-style": ["error", "expression"],
    "@typescript-eslint/explicit-member-accessibility": "off",
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/camelcase": "off",
    "@typescript-eslint/no-unused-vars": [
      "error",
      { "ignoreRestSiblings": true }
    ],
    "curly": "error",
    "react/self-closing-comp": "error",
    "react/prop-types": ["error", { "skipUndeclared": true }],
    "@typescript-eslint/no-empty-function": "off",
    "@typescript-eslint/prefer-optional-chain": "error",
    "@typescript-eslint/no-non-null-assertion": 0,
    "max-len": ["error", 100, 2]
  }
}
```

#### 6.2 Update Test Files
- Fix React prop warnings
- Add tests for new components
- Improve test coverage
- Use constants in tests

### Phase 7: Documentation and README Update (Priority: Low)

#### 7.1 Update README.md
- Add development setup instructions
- Update tech stack information
- Add contribution guidelines
- Include testing instructions

#### 7.2 Create Component Documentation
- Document all components with JSDoc
- Create usage examples
- Document prop interfaces

## Implementation Timeline

### Week 1: Foundation
- [ ] Phase 1: Constants and Configuration
- [ ] Phase 2: Theme System
- [ ] Fix ESLint configuration

### Week 2: Core Components
- [ ] Phase 3: Component Refactoring
- [ ] Phase 4: Utility Functions Refactoring
- [ ] Update existing components to use new constants

### Week 3: Polish and Testing
- [ ] Phase 5: Hook Refactoring
- [ ] Phase 6: Test Improvements
- [ ] Run full test suite and fix issues

### Week 4: Documentation and Final Review
- [ ] Phase 7: Documentation and README Update
- [ ] Final code review
- [ ] Performance testing
- [ ] Accessibility audit

## Success Criteria

### Code Quality
- [ ] Zero ESLint errors
- [ ] All tests passing
- [ ] No hardcoded values in components
- [ ] Consistent file naming and structure

### Performance
- [ ] Build time under 1 second
- [ ] No console warnings
- [ ] Proper memoization implemented

### Maintainability
- [ ] Clear separation of concerns
- [ ] Comprehensive documentation
- [ ] Consistent theming system
- [ ] Type-safe code throughout

### User Experience
- [ ] Consistent UI/UX across all components
- [ ] Proper error handling
- [ ] Accessible components
- [ ] Responsive design maintained

## Risk Assessment

### High Risk
- **Breaking changes to existing functionality**: Mitigation - comprehensive testing
- **Performance regression**: Mitigation - performance monitoring and optimization

### Medium Risk
- **TypeScript compilation issues**: Mitigation - gradual migration
- **Test failures**: Mitigation - parallel test development

### Low Risk
- **Documentation updates**: Mitigation - automated documentation generation
- **Style inconsistencies**: Mitigation - design system implementation

## Conclusion

This refactoring plan provides a comprehensive approach to improving the Chinese Flashcards application. By following this structured approach, we will achieve:

1. **Better maintainability** through proper constants and enums
2. **Improved user experience** through consistent theming
3. **Enhanced developer experience** through better code organization
4. **Future-proof architecture** that can easily accommodate new features

The plan prioritizes critical issues first while maintaining application functionality throughout the refactoring process. Each phase builds upon the previous one, ensuring a smooth transition to the improved codebase. 
