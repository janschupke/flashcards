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
import { CharacterDisplayToggle } from './CharacterDisplayToggle';
import { PinyinInput } from './PinyinInput';
import { ScoreDisplay } from './ScoreDisplay';
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
    displayMode,
    pinyinInput,
    isPinyinCorrect,
    correctAnswers,
    totalAttempted,
    getNext,
    toggleHint,
    updateLimit,
    setDisplayMode,
    setPinyinInput,
    evaluatePinyin,
    resetScore,
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

  const handleDisplayModeChange = useCallback((mode: 'simplified' | 'traditional' | 'both') => {
    setDisplayMode(mode);
  }, [setDisplayMode]);

  const handlePinyinSubmit = useCallback((input: string) => {
    setPinyinInput(input);
  }, [setPinyinInput]);

  const handleEvaluatePinyin = useCallback(() => {
    evaluatePinyin();
  }, [evaluatePinyin]);

  // Set up keyboard shortcuts
  useKeyboardShortcuts({
    onNext: getNext,
    onTogglePinyin: handleTogglePinyin,
    onToggleEnglish: handleToggleEnglish,
  });

  // Calculate percentage for score display
  const percentage = totalAttempted > 0 ? (correctAnswers / totalAttempted) * 100 : 0;

  return (
    <PageContainer>
      <Card>
        <Header>
          <Title>汉字 Flashcards</Title>
          <Subtitle>Learn Chinese characters with interactive flashcards</Subtitle>
        </Header>

        <CharacterDisplayToggle
          displayMode={displayMode}
          onModeChange={handleDisplayModeChange}
        />

        <CharacterRangeInput
          currentLimit={limit}
          onLimitChange={handleLimitChange}
        />

        <ProgressBar progress={progress} />

        <CharacterDisplay
          currentIndex={current}
          hintType={hint as HintType}
          displayMode={displayMode}
        />

        <PinyinInput
          currentPinyin={pinyinInput}
          onSubmit={handlePinyinSubmit}
          isCorrect={isPinyinCorrect}
          disabled={false}
        />

        <ControlButtons
          onTogglePinyin={handleTogglePinyin}
          onToggleEnglish={handleToggleEnglish}
          onNext={getNext}
          onEvaluatePinyin={handleEvaluatePinyin}
          isPinyinEvaluated={isPinyinCorrect !== null}
          isPinyinCorrect={isPinyinCorrect}
        />

        <ScoreDisplay
          correctAnswers={correctAnswers}
          totalAttempted={totalAttempted}
          percentage={percentage}
        />

        <Statistics
          current={current}
          totalSeen={totalSeen}
          limit={limit}
        />
      </Card>
    </PageContainer>
  );
};
