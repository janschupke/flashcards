import React, { useEffect, useRef } from 'react';
import { useFlashCardContext } from '../../contexts/FlashCardContext';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';
import { useModeNavigation } from '../../hooks/useModeNavigation';
import { useToastContext } from '../../contexts/ToastContext';
import { HINT_TYPES } from '../../types';
import { CharacterDisplay } from './CharacterDisplay';
import { ControlButtons } from '../controls/ControlButtons';
import { FlashcardInput } from '../input/FlashcardInput';
import { CHINESE_TEXT } from '../../constants';
import { getPinyinFeedbackText } from '../../utils/feedbackUtils';
import { PreviousCharacter } from '../feedback/PreviousCharacter';
import { FlashcardControls } from '../controls/FlashcardControls';
import { getHintText } from '../../utils/characterUtils';
import data from '../../data/characters.json';

export const FlashcardPage: React.FC = () => {
  const {
    current,
    hint,
    isPinyinCorrect,
    flashResult,
    previousAnswer,
    mode,
    pinyinInput,
    adaptiveRange,
    getNext,
    toggleHint,
    setPinyinInput,
    setMode,
    setPinyinFlashResult,
  } = useFlashCardContext();

  // Show toast when range expands
  const { showToast } = useToastContext();
  const prevRangeRef = React.useRef<number | null>(null);
  useEffect(() => {
    if (prevRangeRef.current !== null && adaptiveRange > prevRangeRef.current) {
      showToast(`Range expanded! Now practicing characters 1-${adaptiveRange}`, 'success');
    }
    prevRangeRef.current = adaptiveRange;
  }, [adaptiveRange, showToast]);

  // Get current character - always return full character (mode only affects display)
  const currentCharacter = data[current] ?? null;

  // Set up keyboard shortcuts
  useKeyboardShortcuts({
    onNext: getNext,
    onTogglePinyin: () => toggleHint(HINT_TYPES.PINYIN),
    onToggleEnglish: () => toggleHint(HINT_TYPES.ENGLISH),
    onModeChange: setMode,
  });

  // Mode navigation with arrow keys
  useModeNavigation({ currentMode: mode, onModeChange: setMode });

  // Ref for focusing pinyin input
  const pinyinInputRef = useRef<HTMLInputElement>(null);

  // Focus pinyin input after mode change
  useEffect(() => {
    if (pinyinInputRef.current) {
      pinyinInputRef.current.focus();
    }
  }, [mode]);

  return (
    <div className="h-full flex flex-col">
      {/* Flashcard controls */}
      <FlashcardControls
        currentMode={mode}
        onModeChange={setMode}
        currentHint={hint}
        onTogglePinyin={() => toggleHint(HINT_TYPES.PINYIN)}
        onToggleEnglish={() => toggleHint(HINT_TYPES.ENGLISH)}
      />

      {/* Character + Input section centered vertically */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <CharacterDisplay currentIndex={current} mode={mode} />

        <FlashcardInput
          ref={pinyinInputRef}
          value={pinyinInput}
          onChange={setPinyinInput}
          onSubmit={setPinyinFlashResult}
          placeholder={CHINESE_TEXT.MODES.PINYIN.PLACEHOLDER}
          feedbackText={getPinyinFeedbackText(isPinyinCorrect, currentCharacter?.pinyin ?? '')}
          isCorrect={isPinyinCorrect}
          disabled={false}
          flashResult={flashResult ?? null}
        />

        <div>
          <ControlButtons onNext={getNext} />
        </div>
        <div className="mt-2 mb-2 text-base text-text-tertiary font-medium text-center px-2">
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
  );
};
