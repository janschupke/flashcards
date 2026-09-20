import { useState, useEffect, useCallback, useRef } from 'react';
import { FlashCardState, FlashCardActions, HintType, HINT_TYPES, FlashcardMode } from '../types';
import {
  loadHistory,
  loadCounters,
  loadPreviousAnswer,
  loadAdaptiveRange,
  loadRecentAnswers,
  loadMode,
  saveMode,
  saveAdaptiveRange,
  getAllCharacterPerformance,
  clearAllStorage,
  migrateStorage,
} from '../utils/storageUtils';
import { selectAdaptiveCharacter } from '../utils/adaptiveUtils';
import { ADAPTIVE_CONFIG } from '../constants/adaptive';
import { ANIMATION_TIMINGS } from '../constants';
import {
  processAnswer,
  updateStorageAfterAnswer,
  calculateAdaptiveRangeExpansion,
  getNextCharacterIndex,
  createNextState,
} from '../utils/flashcardStateUtils';
import data from '../data/characters.json';

interface UseFlashCardProps {
  initialCurrent?: number;
}

export const useFlashCard = ({ initialCurrent }: UseFlashCardProps = {}): FlashCardState &
  FlashCardActions => {
  // Lazy initializer: load storage data and compute initial state only once on mount
  const [state, setState] = useState<FlashCardState>(() => {
    // Validate and version everything on disk before the first read.
    migrateStorage();

    const storedHistory = loadHistory();
    const storedCounters = loadCounters();
    const storedPreviousAnswer = loadPreviousAnswer();
    const storedAdaptiveRange = loadAdaptiveRange();
    const storedRecentAnswers = loadRecentAnswers();
    const storedMode = loadMode();

    // Trim history if it exceeds limit (defensive check in case of data migration or manual edits)
    const trimmedHistory =
      storedHistory.length > ADAPTIVE_CONFIG.MAX_HISTORY_ENTRIES
        ? storedHistory.slice(-ADAPTIVE_CONFIG.MAX_HISTORY_ENTRIES)
        : storedHistory;

    const initialAdaptiveRange = storedAdaptiveRange ?? ADAPTIVE_CONFIG.INITIAL_RANGE;
    const effectiveLimit = Math.min(initialAdaptiveRange, data.length);

    // Seed the first card through the adaptive selector rather than uniformly,
    // so a session resumes on something worth practising.
    const initialCurrentIndex =
      initialCurrent ??
      selectAdaptiveCharacter(
        Array.from({ length: effectiveLimit }, (_, i) => i),
        getAllCharacterPerformance()
      );

    return {
      current: initialCurrentIndex,
      limit: effectiveLimit,
      hint: HINT_TYPES.NONE,
      totalSeen: storedCounters?.totalSeen ?? 0,
      pinyinInput: '',
      isPinyinCorrect: null,
      correctAnswers: storedCounters?.correctAnswers ?? 0,
      totalAttempted: storedCounters?.totalAttempted ?? 0,
      flashResult: null,
      // Previous character tracking
      previousCharacter: null,
      // Previous answer tracking
      previousAnswer: storedPreviousAnswer ?? null,
      // Incorrect answers tracking
      incorrectAnswers: [],
      // All answers tracking (trimmed to MAX_HISTORY_ENTRIES)
      allAnswers: trimmedHistory,
      // Display mode - controls what characters are shown (load from storage or default to BOTH)
      mode: storedMode ?? FlashcardMode.BOTH,
      // Adaptive learning fields
      adaptiveRange: initialAdaptiveRange,
      // Restored, so expansion progress survives a reload
      recentAnswers: storedRecentAnswers,
    };
  });

  // Persistence bookkeeping. An answer is written once it is committed, never
  // from inside an updater; keying on totalAttempted makes a re-run of the
  // effect a no-op rather than a second write.
  const persistedAttemptsRef = useRef<number | null>(null);
  const persistedRangeRef = useRef(state.adaptiveRange);

  const getNext = useCallback(() => {
    // The updater is pure: it computes the next state and nothing else.
    // Storage writes used to run inside it, which meant any double invocation
    // -- StrictMode, a concurrent re-render -- double-counted every answer in
    // localStorage. Persistence now happens in an effect, from committed state.
    setState((prev) => {
      // Read the character from prev, not from the render-scoped closure. The
      // old code graded against getCurrentCharacter() but recorded against
      // prev.current, so two calls in one batch attributed the answer to the
      // wrong character.
      const currentCharacter = data[prev.current] ?? null;
      if (!currentCharacter) return prev;

      const { answer, isCorrect, hasInput } = processAnswer(
        currentCharacter,
        prev.pinyinInput,
        prev.current
      );

      const newIncorrectAnswers = [...prev.incorrectAnswers];
      if (!isCorrect) {
        newIncorrectAnswers.push(answer);
      }

      // Empty answers are still attempts (incorrect ones), so count them
      const newCorrectAnswers = isCorrect ? prev.correctAnswers + 1 : prev.correctAnswers;
      const newTotalAttempted = prev.totalAttempted + 1;
      const newTotalSeen = prev.totalSeen + 1;

      const newAllAnswers = [...prev.allAnswers, answer];

      // Rolling window that drives range expansion
      const newRecentAnswers = [...prev.recentAnswers, answer].slice(
        -ADAPTIVE_CONFIG.EXPANSION_INTERVAL
      );

      const { newAdaptiveRange, shouldExpand } = calculateAdaptiveRangeExpansion(
        newRecentAnswers,
        prev.adaptiveRange
      );

      // Start a fresh window after an expansion
      const finalRecentAnswers = shouldExpand ? [] : newRecentAnswers;

      // Exclude the character just answered so it cannot come up twice running
      const newIndex = getNextCharacterIndex(newAdaptiveRange, prev.current);

      return createNextState(
        prev,
        answer,
        isCorrect,
        hasInput,
        newCorrectAnswers,
        newTotalAttempted,
        newTotalSeen,
        newIncorrectAnswers,
        newAllAnswers,
        newAdaptiveRange,
        finalRecentAnswers,
        newIndex
      );
    });
  }, []);

  const toggleHint = useCallback((hintType: HintType) => {
    setState((prev) => ({
      ...prev,
      hint: prev.hint === hintType ? HINT_TYPES.NONE : hintType,
    }));
  }, []);

  const resetStatistics = useCallback(() => {
    // Self-sufficient: clears storage itself rather than relying on the caller
    // having called clearAllStorage first, which is what made correctness
    // depend on call order at the single call site.
    const initialRange = ADAPTIVE_CONFIG.INITIAL_RANGE;
    clearAllStorage();
    saveAdaptiveRange(initialRange);
    persistedAttemptsRef.current = 0;
    persistedRangeRef.current = initialRange;

    setState((prev) => ({
      ...prev,
      // Reset statistics
      totalSeen: 0,
      correctAnswers: 0,
      totalAttempted: 0,
      // Reset answer tracking
      previousAnswer: null,
      allAnswers: [],
      incorrectAnswers: [],
      recentAnswers: [],
      // Reset adaptive range
      adaptiveRange: initialRange,
      // Keep current character and mode
    }));
  }, []);

  const setPinyinInput = useCallback((input: string) => {
    setState((prev) => ({
      ...prev,
      pinyinInput: input,
      isPinyinCorrect: null, // Reset evaluation when input changes
    }));
  }, []);

  // Display mode action - only changes what's displayed, doesn't reset state
  const setMode = useCallback((mode: FlashcardMode) => {
    // Save mode to storage
    saveMode(mode);

    setState((prev) => ({
      ...prev,
      mode,
      // Clear input when switching display modes
      pinyinInput: '',
      isPinyinCorrect: null,
      flashResult: null,
    }));
  }, []);

  useEffect(() => {
    if (persistedAttemptsRef.current === null) {
      // First render: nothing was answered yet, just record the starting point.
      persistedAttemptsRef.current = state.totalAttempted;
      return;
    }
    if (persistedAttemptsRef.current === state.totalAttempted) return;
    persistedAttemptsRef.current = state.totalAttempted;

    const answer = state.previousAnswer;
    if (!answer) return;

    updateStorageAfterAnswer(
      answer.characterIndex,
      answer.isCorrect,
      state.correctAnswers,
      state.totalAttempted,
      state.totalSeen,
      state.allAnswers,
      answer,
      state.recentAnswers,
      state.adaptiveRange,
      persistedRangeRef.current
    );
    persistedRangeRef.current = state.adaptiveRange;
  }, [state]);

  // Clear flash result after animation
  useEffect(() => {
    if (state.flashResult !== null && state.flashResult !== undefined) {
      const timer = setTimeout(() => {
        setState((prev) => ({ ...prev, flashResult: null }));
      }, ANIMATION_TIMINGS.FLASH_RESULT_DURATION);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [state.flashResult]);

  return {
    ...state,
    getNext,
    toggleHint,
    resetStatistics,
    setPinyinInput,
    setMode,
  };
};
