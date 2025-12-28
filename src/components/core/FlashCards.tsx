import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useFlashCard } from '../../hooks/useFlashCard';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';
import { HINT_TYPES, FlashcardMode } from '../../types';
import { AppTab } from '../../types/layout';
import { CharacterDisplay } from './CharacterDisplay';
import { ControlButtons } from '../controls/ControlButtons';
import { PinyinInput } from '../input/PinyinInput';
import { CharacterInput } from '../input/CharacterInput';
import { PreviousCharacter } from '../feedback/PreviousCharacter';
import { IncorrectAnswers } from '../feedback/IncorrectAnswers';
import { FlashCardProps, Character } from '../../types';
import {
  getExpectedCharacter,
  getCharacterAtIndex,
  getModeSpecificLimit,
} from '../../utils/characterUtils';
import { APP_LIMITS, UI_CONSTANTS } from '../../constants';
import { AppLayout } from '../layout/AppLayout';
import { TabPanel } from '../layout/TabPanel';
import { Card } from '../common/Card';
import data from '../../data/characters.json';
import { MODES } from '../controls/ModeToggleButtons';

export const FlashCards: React.FC<FlashCardProps> = ({ initialCurrent, initialLimit }) => {
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.FLASHCARDS);

  const flashCardProps: { initialCurrent?: number; initialLimit?: number } = {};
  if (initialCurrent !== undefined) {
    flashCardProps.initialCurrent = initialCurrent;
  }
  if (initialLimit !== undefined) {
    flashCardProps.initialLimit = initialLimit;
  }

  const {
    current,
    limit,
    hint,
    totalSeen,
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
    setPinyinFlashResult,
    setCharacterFlashResult,
  } = useFlashCard(flashCardProps);

  const handleTogglePinyin = useCallback(() => {
    toggleHint(HINT_TYPES.PINYIN);
  }, [toggleHint]);

  const handleToggleEnglish = useCallback(() => {
    toggleHint(HINT_TYPES.ENGLISH);
  }, [toggleHint]);

  const handleLimitChange = useCallback(
    (newLimit: number) => {
      updateLimit(newLimit);
    },
    [updateLimit]
  );

  const handlePinyinSubmit = useCallback(
    (input: string) => {
      setPinyinFlashResult(input);
    },
    [setPinyinFlashResult]
  );

  const handleCharacterSubmit = useCallback(
    (input: string) => {
      setCharacterFlashResult(input);
    },
    [setCharacterFlashResult]
  );

  const handleModeChange = useCallback(
    (newMode: FlashcardMode) => {
      setMode(newMode);
    },
    [setMode]
  );

  const handleTabChange = useCallback((tab: AppTab) => {
    setActiveTab(tab);
  }, []);

  // Get current character based on mode
  const getCurrentCharacter = (): Character | null => {
    if (mode === FlashcardMode.PINYIN) {
      return data[current] ?? null;
    }
    return getCharacterAtIndex(current, mode);
  };

  const currentCharacter = getCurrentCharacter();

  // Get mode-specific limits
  const getModeLimits = (): { minLimit: number; maxLimit: number } => {
    const maxLimit = getModeSpecificLimit(mode);
    return {
      minLimit: APP_LIMITS.MIN_LIMIT,
      maxLimit: Math.min(
        maxLimit,
        mode === FlashcardMode.PINYIN
          ? APP_LIMITS.PINYIN_MODE_MAX
          : APP_LIMITS.SIMPLIFIED_TRADITIONAL_MAX
      ),
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

  // Add left/right arrow hotkeys for mode switching
  useEffect(() => {
    const handleArrowModeSwitch = (e: KeyboardEvent): void => {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
      const modeIndex = MODES.findIndex((m: { mode: FlashcardMode }) => m.mode === mode);
      if (modeIndex === -1) return;
      if (e.key === 'ArrowLeft' && modeIndex > 0) {
        const prevMode = MODES[modeIndex - 1];
        if (prevMode) {
          setMode(prevMode.mode);
        }
        e.preventDefault();
      } else if (e.key === 'ArrowRight' && modeIndex < MODES.length - 1) {
        const nextMode = MODES[modeIndex + 1];
        if (nextMode) {
          setMode(nextMode.mode);
        }
        e.preventDefault();
      }
    };
    window.addEventListener('keydown', handleArrowModeSwitch);
    return () => window.removeEventListener('keydown', handleArrowModeSwitch);
  }, [mode, setMode]);

  // Global arrow key handler for range
  useEffect(() => {
    const handleArrow = (e: KeyboardEvent): void => {
      if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        // Only trigger if not focused on the range input
        const active = document.activeElement;
        if (active?.id === 'limit') return;
        const increment =
          e.key === 'ArrowUp' ? UI_CONSTANTS.INCREMENT_STEP : -UI_CONSTANTS.INCREMENT_STEP;
        const minLimit = APP_LIMITS.MIN_LIMIT;
        const maxLimit =
          mode === FlashcardMode.PINYIN
            ? Math.min(APP_LIMITS.PINYIN_MODE_MAX, data.length)
            : APP_LIMITS.SIMPLIFIED_TRADITIONAL_MAX;
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
      onTabChange={handleTabChange}
      currentMode={mode}
      onModeChange={handleModeChange}
      currentLimit={limit}
      minLimit={minLimit}
      maxLimit={maxLimit}
      onLimitChange={handleLimitChange}
      correctAnswers={correctAnswers}
      totalSeen={totalSeen}
    >
      <div className="container mx-auto px-3 py-3 max-w-screen-xl">
        <TabPanel tab={AppTab.FLASHCARDS} activeTab={activeTab}>
          <Card className="mb-3">
            <CharacterDisplay currentIndex={current} hintType={hint} mode={mode} />

            {mode === FlashcardMode.PINYIN ? (
              <PinyinInput
                ref={pinyinInputRef}
                value={pinyinInput}
                onChange={setPinyinInput}
                currentPinyin={currentCharacter?.pinyin ?? ''}
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
                expectedCharacter={
                  currentCharacter ? getExpectedCharacter(currentCharacter, mode) : ''
                }
                onSubmit={handleCharacterSubmit}
                isCorrect={isCharacterCorrect}
                disabled={false}
                flashResult={flashResult}
                mode={mode}
              />
            )}

            <div className="mt-3">
              <ControlButtons
                onTogglePinyin={handleTogglePinyin}
                onToggleEnglish={handleToggleEnglish}
                onNext={getNext}
              />

              <PreviousCharacter previousCharacterIndex={previousCharacter} />
            </div>
          </Card>
        </TabPanel>

        <TabPanel tab={AppTab.HISTORY} activeTab={activeTab}>
          <Card>
            <IncorrectAnswers incorrectAnswers={incorrectAnswers} />
          </Card>
        </TabPanel>
      </div>
    </AppLayout>
  );
};
