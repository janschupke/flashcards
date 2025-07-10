import React, { useCallback, useEffect, useRef } from 'react';
import { PageContainer, Card, Header, Title, Subtitle } from './styled';
import styled from 'styled-components';
import { useFlashCard } from '../hooks/useFlashCard';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { HINT_TYPES, HintType, FlashcardMode } from '../types';
import { CharacterRangeInput } from './CharacterRangeInput';
import { CharacterDisplay } from './CharacterDisplay';
import { ControlButtons } from './ControlButtons';
import { ProgressBar } from './ProgressBar';
import { Statistics } from './Statistics';
import { PinyinInput } from './PinyinInput';
import { CharacterInput } from './CharacterInput';
import { ModeToggleButtons } from './ModeToggleButtons';
import { PreviousCharacter } from './PreviousCharacter';
import { IncorrectAnswers } from './IncorrectAnswers';
import { FlashCardProps } from '../types';
import { getExpectedCharacter, getCharacterAtIndex, getModeSpecificLimit, validateCharacterInput } from '../utils/characterUtils';
import { evaluatePinyinInput } from '../utils/pinyinUtils';
import data from '../data.json';

const CardCompact = styled(Card)`
  padding-top: 16px;
  padding-bottom: 16px;
`;

export const FlashCards: React.FC<FlashCardProps> = ({ 
  initialCurrent, 
  initialLimit 
}) => {
  const {
    current,
    limit,
    hint,
    totalSeen,
    progress,
    isPinyinCorrect,
    isCharacterCorrect,
    correctAnswers,
    flashResult,
    previousCharacter,
    incorrectAnswers,
    mode,
    pinyinInput,
    characterInput,
    getNext,
    toggleHint,
    updateLimit,
    setPinyinInput,
    setCharacterInput,
    setMode,
    validateCharacter,
    setPinyinFlashResult,
    setCharacterFlashResult,
  } = useFlashCard({ initialCurrent, initialLimit });

  const handleTogglePinyin = useCallback(() => {
    toggleHint(HINT_TYPES.PINYIN);
  }, [toggleHint]);

  const handleToggleEnglish = useCallback(() => {
    toggleHint(HINT_TYPES.ENGLISH);
  }, [toggleHint]);

  const handleLimitChange = useCallback((newLimit: number) => {
    updateLimit(newLimit);
  }, [updateLimit]);

  const handlePinyinSubmit = useCallback((input: string) => {
    setPinyinFlashResult(input);
  }, [setPinyinFlashResult]);

  const handleCharacterSubmit = useCallback((input: string) => {
    setCharacterFlashResult(input);
  }, [setCharacterFlashResult]);

  const handleModeChange = useCallback((newMode: FlashcardMode) => {
    setMode(newMode);
  }, [setMode]);

  // Get current character based on mode
  const getCurrentCharacter = () => {
    if (mode === 'pinyin') {
      return data[current];
    } else {
      return getCharacterAtIndex(current, mode);
    }
  };

  const currentCharacter = getCurrentCharacter();

  // Get mode-specific limits
  const getModeLimits = () => {
    const maxLimit = getModeSpecificLimit(mode);
    return {
      minLimit: 50,
      maxLimit: Math.min(maxLimit, mode === 'pinyin' ? 1500 : 539),
    };
  };

  const { minLimit, maxLimit } = getModeLimits();

  // Set up keyboard shortcuts
  useKeyboardShortcuts({
    onNext: getNext,
    onTogglePinyin: handleTogglePinyin,
    onToggleEnglish: handleToggleEnglish,
    onModeChange: handleModeChange,
  });

  // Global arrow key handler for range
  useEffect(() => {
    const handleArrow = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        // Only trigger if not focused on the range input
        const active = document.activeElement;
        if (active && (active as HTMLElement).id === 'limit') return;
        const increment = e.key === 'ArrowUp' ? 50 : -50;
        const minLimit = 50;
        const maxLimit = mode === 'pinyin' ? Math.min(1500, data.length) : 539; // 539 characters have different simplified/traditional
        let newLimit = limit + increment;
        newLimit = Math.min(maxLimit, Math.max(minLimit, newLimit));
        handleLimitChange(newLimit);
        e.preventDefault();
      }
    };
    window.addEventListener('keydown', handleArrow);
    return () => window.removeEventListener('keydown', handleArrow);
  }, [limit, handleLimitChange, mode]);

  // Refs for focusing inputs
  const pinyinInputRef = useRef<HTMLInputElement>(null);
  const characterInputRef = useRef<HTMLInputElement>(null);

  // Focus the relevant input after mode change
  useEffect(() => {
    if (mode === 'pinyin' && pinyinInputRef.current) {
      pinyinInputRef.current.focus();
    } else if ((mode === 'simplified' || mode === 'traditional') && characterInputRef.current) {
      characterInputRef.current.focus();
    }
  }, [mode]);

  return (
    <PageContainer>
      <Card>
        <Header>
          <Title>汉字 Flashcards</Title>
          <Subtitle>Learn Chinese characters with interactive flashcards</Subtitle>
        </Header>

        <ModeToggleButtons
          currentMode={mode}
          onModeChange={handleModeChange}
        />

        <CharacterRangeInput
          currentLimit={limit}
          onLimitChange={handleLimitChange}
          minLimit={minLimit}
          maxLimit={maxLimit}
        />

        <ProgressBar progress={progress} />

        <CharacterDisplay
          currentIndex={current}
          hintType={hint as HintType}
          mode={mode}
        />

        {mode === 'pinyin' ? (
          <PinyinInput
            ref={pinyinInputRef}
            value={pinyinInput}
            onChange={setPinyinInput}
            currentPinyin={currentCharacter?.pinyin || ''}
            onSubmit={handlePinyinSubmit}
            isCorrect={isPinyinCorrect}
            disabled={false}
            flashResult={flashResult}
          />
        ) : (
          <CharacterInput
            ref={characterInputRef}
            value={characterInput}
            onChange={setCharacterInput}
            expectedCharacter={currentCharacter ? getExpectedCharacter(currentCharacter, mode) : ''}
            onSubmit={handleCharacterSubmit}
            isCorrect={isCharacterCorrect}
            disabled={false}
            flashResult={flashResult}
            mode={mode}
          />
        )}

        <ControlButtons
          onTogglePinyin={handleTogglePinyin}
          onToggleEnglish={handleToggleEnglish}
          onNext={getNext}
        />

        <Statistics
          current={current}
          totalSeen={totalSeen}
          limit={limit}
          correctAnswers={correctAnswers}
        />

        <PreviousCharacter
          previousCharacterIndex={previousCharacter}
        />
      </Card>

      <CardCompact>
        <IncorrectAnswers
          incorrectAnswers={incorrectAnswers}
        />
      </CardCompact>
    </PageContainer>
  );
};
