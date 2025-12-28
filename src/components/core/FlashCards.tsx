import React, { useEffect, useRef, useState } from 'react';
import { useFlashCard } from '../../hooks/useFlashCard';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';
import { useModeNavigation } from '../../hooks/useModeNavigation';
import { useToastContext } from '../../contexts/ToastContext';
import { HINT_TYPES, FlashcardMode } from '../../types';
import { AppTab } from '../../types/layout';
import { CharacterDisplay } from './CharacterDisplay';
import { ControlButtons } from '../controls/ControlButtons';
import { PinyinInput } from '../input/PinyinInput';
import { CharacterInput } from '../input/CharacterInput';
import { PreviousCharacter } from '../feedback/PreviousCharacter';
import { IncorrectAnswers } from '../feedback/IncorrectAnswers';
import { Statistics } from '../feedback/Statistics';
import { About } from '../feedback/About';
import { FlashCardProps } from '../../types';
import { getExpectedCharacter, getCharacterAtIndex, getHintText } from '../../utils/characterUtils';
import { AppLayout } from '../layout/AppLayout';
import { TabPanel } from '../layout/TabPanel';
import data from '../../data/characters.json';

export const FlashCards: React.FC<FlashCardProps> = ({ initialCurrent }) => {
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.FLASHCARDS);
  const { showToast } = useToastContext();

  const {
    current,
    hint,
    totalSeen,
    isPinyinCorrect,
    isCharacterCorrect,
    correctAnswers,
    flashResult,
    previousAnswer,
    allAnswers,
    mode,
    pinyinInput,
    characterInput,
    adaptiveRange,
    getNext,
    toggleHint,
    resetStatistics,
    setPinyinInput,
    setCharacterInput,
    setMode,
    setPinyinFlashResult,
    setCharacterFlashResult,
  } = useFlashCard({
    initialCurrent,
  });

  // Show toast when range expands
  const prevRangeRef = React.useRef<number | null>(null);
  useEffect(() => {
    if (prevRangeRef.current !== null && adaptiveRange > prevRangeRef.current) {
      showToast(`Range expanded! Now practicing characters 1-${adaptiveRange}`, 'success');
    }
    prevRangeRef.current = adaptiveRange;
  }, [adaptiveRange, showToast]);

  // Get current character based on mode
  const currentCharacter =
    mode === FlashcardMode.PINYIN ? (data[current] ?? null) : getCharacterAtIndex(current, mode);

  // Set up keyboard shortcuts
  useKeyboardShortcuts({
    onNext: getNext,
    onTogglePinyin: () => toggleHint(HINT_TYPES.PINYIN),
    onToggleEnglish: () => toggleHint(HINT_TYPES.ENGLISH),
    onModeChange: setMode,
  });

  // Mode navigation with arrow keys
  useModeNavigation({ currentMode: mode, onModeChange: setMode });

  // Refs for focusing inputs
  const pinyinInputRef = useRef<HTMLInputElement>(null);
  const characterInputRef = useRef<HTMLInputElement>(null);

  // Focus the relevant input after mode change
  useEffect(() => {
    if (mode === FlashcardMode.PINYIN && pinyinInputRef.current) {
      pinyinInputRef.current.focus();
    } else if (
      (mode === FlashcardMode.SIMPLIFIED || mode === FlashcardMode.TRADITIONAL) &&
      characterInputRef.current
    ) {
      characterInputRef.current.focus();
    }
  }, [mode]);

  return (
    <AppLayout
      activeTab={activeTab}
      onTabChange={setActiveTab}
      currentMode={mode}
      onModeChange={setMode}
      adaptiveRange={adaptiveRange}
      correctAnswers={correctAnswers}
      totalSeen={totalSeen}
      currentHint={hint}
      onTogglePinyin={() => toggleHint(HINT_TYPES.PINYIN)}
      onToggleEnglish={() => toggleHint(HINT_TYPES.ENGLISH)}
      onReset={resetStatistics}
    >
      <TabPanel tab={AppTab.FLASHCARDS} activeTab={activeTab}>
        <div className="h-full flex flex-col">
          {/* Character + Input section centered vertically */}
          <div className="flex-1 flex flex-col items-center justify-center">
            <CharacterDisplay currentIndex={current} mode={mode} />

            {mode === FlashcardMode.PINYIN ? (
              <PinyinInput
                ref={pinyinInputRef}
                value={pinyinInput}
                onChange={setPinyinInput}
                currentPinyin={currentCharacter?.pinyin ?? ''}
                onSubmit={setPinyinFlashResult}
                isCorrect={isPinyinCorrect}
                disabled={false}
                flashResult={flashResult}
              />
            ) : (
              <CharacterInput
                ref={characterInputRef}
                value={characterInput}
                onChange={setCharacterInput}
                expectedCharacter={
                  currentCharacter ? getExpectedCharacter(currentCharacter, mode) : ''
                }
                onSubmit={setCharacterFlashResult}
                isCorrect={isCharacterCorrect}
                disabled={false}
                flashResult={flashResult}
                mode={mode}
              />
            )}

            <div className="mt-4 sm:mt-6">
              <ControlButtons onNext={getNext} />
            </div>
            <div className="mt-2 text-sm sm:text-base text-text-tertiary font-medium">
              {getHintText(currentCharacter, hint)}
            </div>
          </div>

          {/* Previous character at bottom with separator */}
          <div className="flex-shrink-0 pb-3 pt-3 sm:pb-4 sm:pt-4 px-2 sm:px-4 border-t border-border-primary">
            <div className="max-w-2xl mx-auto">
              <PreviousCharacter previousAnswer={previousAnswer} />
            </div>
          </div>
        </div>
      </TabPanel>

      <TabPanel tab={AppTab.HISTORY} activeTab={activeTab}>
        <div className="container mx-auto px-2 py-2 sm:px-4 sm:py-4 max-w-screen-xl">
          <IncorrectAnswers allAnswers={allAnswers} />
        </div>
      </TabPanel>

      <TabPanel tab={AppTab.STATISTICS} activeTab={activeTab}>
        <div className="container mx-auto px-2 py-2 sm:px-4 sm:py-4 max-w-screen-xl">
          <Statistics />
        </div>
      </TabPanel>

      <TabPanel tab={AppTab.ABOUT} activeTab={activeTab}>
        <div className="container mx-auto px-2 py-2 sm:px-4 sm:py-4 max-w-screen-xl">
          <About />
        </div>
      </TabPanel>
    </AppLayout>
  );
};
