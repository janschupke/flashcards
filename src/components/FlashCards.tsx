import React, { useCallback, useEffect, useRef } from 'react';
import { PageContainer, Card, Header, Title, Subtitle } from './styled';
import styled from 'styled-components';
import { useFlashCard } from '../hooks/useFlashCard';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { HINT_TYPES, HintType } from '../types';
import { CharacterRangeInput } from './CharacterRangeInput';
import { CharacterDisplay } from './CharacterDisplay';
import { ControlButtons } from './ControlButtons';
import { ProgressBar } from './ProgressBar';
import { Statistics } from './Statistics';
import { PinyinInput } from './PinyinInput';
import { PreviousCharacter } from './PreviousCharacter';
import { IncorrectAnswers } from './IncorrectAnswers';
import { FlashCardProps } from '../types';
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
    pinyinInput,
    isPinyinCorrect,
    correctAnswers,
    totalAttempted,
    flashResult,
    previousCharacter,
    incorrectAnswers,
    getNext,
    toggleHint,
    updateLimit,
    setPinyinInput,
  } = useFlashCard({ initialCurrent, initialLimit });

  const rangeInputRef = useRef<HTMLInputElement>(null);

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

  // Set up keyboard shortcuts
  useKeyboardShortcuts({
    onNext: getNext,
    onTogglePinyin: handleTogglePinyin,
    onToggleEnglish: handleToggleEnglish,
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
        const maxLimit = Math.min(1500, data.length);
        let newLimit = limit + increment;
        newLimit = Math.max(minLimit, Math.min(maxLimit, newLimit));
        handleLimitChange(newLimit);
        e.preventDefault();
      }
    };
    window.addEventListener('keydown', handleArrow);
    return () => window.removeEventListener('keydown', handleArrow);
  }, [limit, handleLimitChange]);

  return (
    <PageContainer>
      <Card>
        <Header>
          <Title>汉字 Flashcards</Title>
          <Subtitle>Learn Chinese characters with interactive flashcards</Subtitle>
        </Header>

        <CharacterRangeInput
          currentLimit={limit}
          onLimitChange={handleLimitChange}
        />

        <ProgressBar progress={progress} />

        <CharacterDisplay
          currentIndex={current}
          hintType={hint as HintType}
        />

        <PinyinInput
          currentPinyin={data[current]?.pinyin || ''}
          currentIndex={current}
          onSubmit={handlePinyinSubmit}
          isCorrect={isPinyinCorrect}
          disabled={false}
          flashResult={flashResult}
        />

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
