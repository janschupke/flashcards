import { FlashcardMode, Character, IncorrectAnswer, Answer } from '../types';
import { evaluatePinyinInput } from './pinyinUtils';
import { validateCharacterInput } from './characterUtils';

export interface EvaluationResult {
  isCorrect: boolean;
  hasInput: boolean;
}

export const evaluatePinyinAnswer = (input: string, character: Character): EvaluationResult => {
  const trimmedInput = input.trim();
  const hasInput = trimmedInput.length > 0;
  const isCorrect = hasInput ? evaluatePinyinInput(input, character.pinyin) : false;

  return { isCorrect, hasInput };
};

export const evaluateCharacterAnswer = (
  input: string,
  character: Character,
  mode: FlashcardMode
): EvaluationResult => {
  const trimmedInput = input.trim();
  const hasInput = trimmedInput.length > 0;
  const expectedCharacter =
    mode === FlashcardMode.SIMPLIFIED ? character.simplified : character.traditional;
  const isCorrect = hasInput ? validateCharacterInput(input, expectedCharacter) : false;

  return { isCorrect, hasInput };
};

export const createIncorrectAnswer = (
  character: Character,
  mode: FlashcardMode,
  submittedInput: string,
  characterIndex: number
): IncorrectAnswer => {
  if (mode === FlashcardMode.PINYIN) {
    return {
      characterIndex,
      submittedPinyin: submittedInput.trim() || '(empty)',
      correctPinyin: character.pinyin,
      simplified: character.simplified,
      traditional: character.traditional,
      english: character.english,
      mode: FlashcardMode.PINYIN,
    };
  }

  const expectedCharacter =
    mode === FlashcardMode.SIMPLIFIED ? character.simplified : character.traditional;

  return {
    characterIndex,
    submittedPinyin: '',
    correctPinyin: '',
    submittedCharacter: submittedInput.trim() || '(empty)',
    correctCharacter: expectedCharacter,
    simplified: character.simplified,
    traditional: character.traditional,
    english: character.english,
    mode,
  };
};

export const createAnswer = (
  character: Character,
  mode: FlashcardMode,
  submittedInput: string,
  characterIndex: number,
  isCorrect: boolean
): Answer => {
  const incorrectAnswer = createIncorrectAnswer(character, mode, submittedInput, characterIndex);
  return {
    ...incorrectAnswer,
    isCorrect,
  };
};
