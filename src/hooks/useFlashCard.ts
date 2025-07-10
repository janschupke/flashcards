import { useState, useEffect, useCallback, useMemo } from 'react';
import { FlashCardState, FlashCardActions, HintType, HINT_TYPES, FlashcardMode } from '../types';
import { evaluatePinyinInput } from '../utils/pinyinUtils';
import { validateCharacterInput, getFilteredCharacters, getModeSpecificLimit, getRandomCharacterIndex, getCharacterAtIndex } from '../utils/characterUtils';
import data from '../data.json';

interface UseFlashCardProps {
  initialCurrent?: number;
  initialLimit?: number;
}

export const useFlashCard = ({ initialCurrent, initialLimit }: UseFlashCardProps = {}): FlashCardState & FlashCardActions => {
  const defaultLimit = initialLimit !== undefined ? Math.min(initialLimit, data.length) : Math.min(1500, data.length);
  
  const [state, setState] = useState<FlashCardState>({
    current: initialCurrent !== undefined ? initialCurrent : Math.floor(Math.random() * defaultLimit),
    limit: defaultLimit,
    hint: HINT_TYPES.NONE,
    totalSeen: 0,
    progress: 0,
    // New state for traditional character feature
    displayMode: 'simplified',
    pinyinInput: '',
    isPinyinCorrect: null,
    correctAnswers: 0,
    totalAttempted: 0,
    flashResult: null,
    // Previous character tracking
    previousCharacter: null,
    // Incorrect answers tracking
    incorrectAnswers: [],
    // New fields for flashcard modes
    mode: 'pinyin',
    characterInput: '',
    isCharacterCorrect: null,
  });

  // Memoize progress calculation to avoid unnecessary recalculations
  const progress = useMemo(() => {
    return state.limit > 0 ? Math.min((state.totalSeen / state.limit) * 100, 100) : 0;
  }, [state.totalSeen, state.limit]);

  // Update progress when dependencies change
  useEffect(() => {
    setState(prev => ({ ...prev, progress }));
  }, [progress]);

  // Get current character based on mode
  const getCurrentCharacter = useCallback(() => {
    if (state.mode === 'pinyin') {
      return data[state.current];
    } else {
      return getCharacterAtIndex(state.current, state.mode);
    }
  }, [state.current, state.mode]);

  const getNext = useCallback(() => {
    setState(prev => {
      const currentCharacter = getCurrentCharacter();
      if (!currentCharacter) return prev;

      let isCorrect = false;
      let hasInput = false;
      let newIncorrectAnswers = [...prev.incorrectAnswers];

      if (prev.mode === 'pinyin') {
        const trimmedInput = prev.pinyinInput.trim();
        hasInput = trimmedInput.length > 0;
        isCorrect = hasInput ? evaluatePinyinInput(prev.pinyinInput, currentCharacter.pinyin) : false;
        
        // Add to incorrect answers if wrong or empty input
        if (!isCorrect) {
          newIncorrectAnswers.push({
            characterIndex: prev.current,
            submittedPinyin: prev.pinyinInput.trim() || '(empty)',
            correctPinyin: currentCharacter.pinyin,
            simplified: currentCharacter.simplified,
            traditional: currentCharacter.traditional,
            english: currentCharacter.english,
            mode: 'pinyin',
          });
        }
      } else {
        // Character input modes
        const trimmedInput = prev.characterInput.trim();
        hasInput = trimmedInput.length > 0;
        const expectedCharacter = prev.mode === 'simplified' ? currentCharacter.simplified : currentCharacter.traditional;
        isCorrect = hasInput ? validateCharacterInput(prev.characterInput, expectedCharacter) : false;
        
        // Add to incorrect answers if wrong or empty input
        if (!isCorrect) {
          newIncorrectAnswers.push({
            characterIndex: prev.current,
            submittedPinyin: '', // Not applicable for character modes
            correctPinyin: '', // Not applicable for character modes
            submittedCharacter: prev.characterInput.trim() || '(empty)',
            correctCharacter: expectedCharacter,
            simplified: currentCharacter.simplified,
            traditional: currentCharacter.traditional,
            english: currentCharacter.english,
            mode: prev.mode,
          });
        }
      }
      
      // Get new random index based on current mode
      const newIndex = getRandomCharacterIndex(prev.mode, prev.limit);
      
      return {
        ...prev,
        previousCharacter: prev.current, // Store current as previous
        current: newIndex,
        hint: HINT_TYPES.NONE,
        totalSeen: prev.totalSeen + 1,
        // Reset input state for new character
        pinyinInput: '',
        isPinyinCorrect: null,
        characterInput: '',
        isCharacterCorrect: null,
        // Update scoring
        correctAnswers: isCorrect ? prev.correctAnswers + 1 : prev.correctAnswers,
        totalAttempted: hasInput ? prev.totalAttempted + 1 : prev.totalAttempted,
        // Set flash result based on evaluation
        flashResult: hasInput ? (isCorrect ? 'correct' : 'incorrect') : null,
        // Update incorrect answers
        incorrectAnswers: newIncorrectAnswers,
      };
    });
  }, [getCurrentCharacter]);

  const toggleHint = useCallback((hintType: HintType) => {
    setState(prev => ({
      ...prev,
      hint: prev.hint === hintType ? HINT_TYPES.NONE : hintType,
    }));
  }, []);

  const updateLimit = useCallback((newLimit: number) => {
    const maxLimit = Math.min(newLimit, getModeSpecificLimit(state.mode));
    setState(prev => ({
      ...prev,
      limit: maxLimit,
      // Don't reset current character or totalSeen
      // Don't reset scoring
      hint: HINT_TYPES.NONE,
      pinyinInput: '',
      isPinyinCorrect: null,
      characterInput: '',
      isCharacterCorrect: null,
      flashResult: null,
    }));
  }, [state.mode]);

  const reset = useCallback(() => {
    setState(prev => ({
      ...prev,
      current: getRandomCharacterIndex(prev.mode, prev.limit),
      totalSeen: 0,
      hint: HINT_TYPES.NONE,
      // Reset scoring
      correctAnswers: 0,
      totalAttempted: 0,
      pinyinInput: '',
      isPinyinCorrect: null,
      characterInput: '',
      isCharacterCorrect: null,
      flashResult: null,
    }));
  }, []);

  // New actions for traditional character feature
  const setDisplayMode = useCallback((mode: 'simplified' | 'traditional' | 'both') => {
    setState(prev => ({
      ...prev,
      displayMode: mode,
    }));
  }, []);

  const setPinyinInput = useCallback((input: string) => {
    setState(prev => ({
      ...prev,
      pinyinInput: input,
      isPinyinCorrect: null, // Reset evaluation when input changes
    }));
  }, []);

  const evaluatePinyin = useCallback(() => {
    setState(prev => {
      const currentCharacter = getCurrentCharacter();
      if (!currentCharacter) return prev;
      
      const isCorrect = evaluatePinyinInput(prev.pinyinInput, currentCharacter.pinyin);
      
      return {
        ...prev,
        isPinyinCorrect: isCorrect,
        correctAnswers: isCorrect ? prev.correctAnswers + 1 : prev.correctAnswers,
        totalAttempted: prev.totalAttempted + 1,
      };
    });
  }, [getCurrentCharacter]);

  const resetScore = useCallback(() => {
    setState(prev => ({
      ...prev,
      correctAnswers: 0,
      totalAttempted: 0,
      pinyinInput: '',
      isPinyinCorrect: null,
      characterInput: '',
      isCharacterCorrect: null,
      flashResult: null,
    }));
  }, []);

  // New actions for flashcard modes
  const setMode = useCallback((mode: FlashcardMode) => {
    setState(prev => {
      const newMaxLimit = getModeSpecificLimit(mode);
      // Always use the max available for the mode as the default limit
      const newLimit = newMaxLimit;
      return {
        ...prev,
        mode,
        limit: newLimit,
        current: getRandomCharacterIndex(mode, newLimit),
        totalSeen: 0,
        correctAnswers: 0,
        totalAttempted: 0,
        hint: HINT_TYPES.NONE,
        pinyinInput: '',
        isPinyinCorrect: null,
        characterInput: '',
        isCharacterCorrect: null,
        flashResult: null,
        incorrectAnswers: [], // Reset incorrect answers on mode change
      };
    });
  }, []);

  const setCharacterInput = useCallback((input: string) => {
    setState(prev => ({
      ...prev,
      characterInput: input,
      isCharacterCorrect: null, // Reset evaluation when input changes
    }));
  }, []);

  const validateCharacter = useCallback(() => {
    setState(prev => {
      const currentCharacter = getCurrentCharacter();
      if (!currentCharacter) return prev;
      
      const expectedCharacter = prev.mode === 'simplified' ? currentCharacter.simplified : currentCharacter.traditional;
      const isCorrect = validateCharacterInput(prev.characterInput, expectedCharacter);
      
      return {
        ...prev,
        isCharacterCorrect: isCorrect,
        correctAnswers: isCorrect ? prev.correctAnswers + 1 : prev.correctAnswers,
        totalAttempted: prev.totalAttempted + 1,
      };
    });
  }, [getCurrentCharacter]);

  // Clear flash result after animation
  useEffect(() => {
    if (state.flashResult) {
      const timer = setTimeout(() => {
        setState(prev => ({ ...prev, flashResult: null }));
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [state.flashResult]);

  return {
    ...state,
    getNext,
    toggleHint,
    updateLimit,
    reset,
    setDisplayMode,
    setPinyinInput,
    evaluatePinyin,
    resetScore,
    setMode,
    setCharacterInput,
    validateCharacter,
  };
}; 
