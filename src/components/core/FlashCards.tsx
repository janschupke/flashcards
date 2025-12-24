import React, { useCallback, useEffect, useRef } from 'react';
import { useFlashCard } from '../../hooks/useFlashCard';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';
import { HINT_TYPES, HintType, FlashcardMode } from '../../types';
import { CharacterRangeInput } from '../input/CharacterRangeInput';
import { CharacterDisplay } from './CharacterDisplay';
import { ControlButtons } from '../controls/ControlButtons';
import { ProgressBar } from '../feedback/ProgressBar';
import { Statistics } from '../feedback/Statistics';
import { PinyinInput } from '../input/PinyinInput';
import { CharacterInput } from '../input/CharacterInput';
import { ModeToggleButtons } from '../controls/ModeToggleButtons';
import { PreviousCharacter } from '../feedback/PreviousCharacter';
import { IncorrectAnswers } from '../feedback/IncorrectAnswers';
import { FlashCardProps } from '../../types';
import { getExpectedCharacter, getCharacterAtIndex, getModeSpecificLimit } from '../../utils/characterUtils';
import { APP_LIMITS, UI_CONSTANTS, CHINESE_TEXT } from '../../constants';
import data from '../../data/characters.json';
import { MODES } from '../controls/ModeToggleButtons';

const CardCompact: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="container mx-auto px-4 md:px-6">
    <div className="app-section max-w-screen-xl p-4 md:p-6">
      {children}
    </div>
  </div>
);

export const FlashCards: React.FC<FlashCardProps> = ({ initialCurrent, initialLimit }) => {
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
    }
    return getCharacterAtIndex(current, mode);
  };

  const currentCharacter = getCurrentCharacter();

  // Get mode-specific limits
  const getModeLimits = () => {
    const maxLimit = getModeSpecificLimit(mode);
    return {
      minLimit: APP_LIMITS.MIN_LIMIT,
      maxLimit: Math.min(
        maxLimit,
        mode === 'pinyin' ? APP_LIMITS.PINYIN_MODE_MAX : APP_LIMITS.SIMPLIFIED_TRADITIONAL_MAX
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
    const handleArrowModeSwitch = (e: KeyboardEvent) => {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
      const modeIndex = MODES.findIndex((m: { mode: string }) => m.mode === mode);
      if (modeIndex === -1) return;
      if (e.key === 'ArrowLeft' && modeIndex > 0) {
        setMode(MODES[modeIndex - 1].mode);
        e.preventDefault();
      } else if (e.key === 'ArrowRight' && modeIndex < MODES.length - 1) {
        setMode(MODES[modeIndex + 1].mode);
        e.preventDefault();
      }
    };
    window.addEventListener('keydown', handleArrowModeSwitch);
    return () => window.removeEventListener('keydown', handleArrowModeSwitch);
  }, [mode, setMode]);

  // Global arrow key handler for range
  useEffect(() => {
    const handleArrow = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        // Only trigger if not focused on the range input
        const active = document.activeElement as HTMLElement | null;
        if (active && active.id === 'limit') return;
        const increment = e.key === 'ArrowUp' ? UI_CONSTANTS.INCREMENT_STEP : -UI_CONSTANTS.INCREMENT_STEP;
        const minLimit = APP_LIMITS.MIN_LIMIT;
        const maxLimit = mode === 'pinyin' ? Math.min(APP_LIMITS.PINYIN_MODE_MAX, data.length) : APP_LIMITS.SIMPLIFIED_TRADITIONAL_MAX;
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
    <div className="min-h-screen bg-gradient-to-br from-secondary-dark to-background-primary py-6 md:py-10">
      <div className="container mx-auto px-4 md:px-6 flex flex-col items-center gap-6">
        <div className="app-section max-w-screen-xl text-left">
          <div className="mb-8">
            <h1 className="text-[2.5rem] font-bold text-white m-0 bg-gradient-to-br from-primary to-primary-dark bg-clip-text text-transparent">
              {CHINESE_TEXT.APP_TITLE}
            </h1>
            <p className="text-textc-muted text-[1.1rem] m-0 font-normal">{CHINESE_TEXT.APP_SUBTITLE}</p>
          </div>

          <ModeToggleButtons currentMode={mode} onModeChange={handleModeChange} />

          <CharacterRangeInput
            currentLimit={limit}
            onLimitChange={handleLimitChange}
            minLimit={minLimit}
            maxLimit={maxLimit}
          />

          <ProgressBar progress={progress} />

          <CharacterDisplay currentIndex={current} hintType={hint as HintType} mode={mode} />

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

          <div className="mt-6">
            <ControlButtons
              onTogglePinyin={handleTogglePinyin}
              onToggleEnglish={handleToggleEnglish}
              onNext={getNext}
            />

            <Statistics current={current} totalSeen={totalSeen} limit={limit} correctAnswers={correctAnswers} />

            <PreviousCharacter previousCharacterIndex={previousCharacter} />
          </div>
        </div>
      </div>

      <CardCompact>
        <IncorrectAnswers incorrectAnswers={incorrectAnswers} />
      </CardCompact>
    </div>
  );
};
