import React, { useCallback, useEffect } from 'react';
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
import { getExpectedCharacter, getCharacterAtIndex } from '../utils/characterUtils';
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
    setPinyinInput(input);
  }, [setPinyinInput]);

  const handleCharacterSubmit = useCallback((input: string) => {
    setCharacterInput(input);
  }, [setCharacterInput]);

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
        />

        <ProgressBar progress={progress} />

        <CharacterDisplay
          currentIndex={current}
          hintType={hint as HintType}
          mode={mode}
        />

        {mode === 'pinyin' ? (
          <PinyinInput
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
