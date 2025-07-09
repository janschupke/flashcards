import React, { useCallback } from 'react';
import { PageContainer, Card, Header, Title, Subtitle } from './styled';
import { useFlashCard } from '../hooks/useFlashCard';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { HINT_TYPES, HintType } from '../types';
import { CharacterRangeInput } from './CharacterRangeInput';
import { CharacterDisplay } from './CharacterDisplay';
import { ControlButtons } from './ControlButtons';
import { ProgressBar } from './ProgressBar';
import { Statistics } from './Statistics';
import { PinyinInput } from './PinyinInput';
import { FlashCardProps } from '../types';
import data from '../data.json';

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
    getNext,
    toggleHint,
    updateLimit,
    setPinyinInput,
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

  // Set up keyboard shortcuts
  useKeyboardShortcuts({
    onNext: getNext,
    onTogglePinyin: handleTogglePinyin,
    onToggleEnglish: handleToggleEnglish,
  });

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
          onSubmit={handlePinyinSubmit}
          isCorrect={isPinyinCorrect}
          disabled={false}
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
      </Card>
    </PageContainer>
  );
};
