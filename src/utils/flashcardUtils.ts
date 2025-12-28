import { Character, IncorrectAnswer, Answer } from '../types';
import { evaluatePinyinInput } from './pinyinUtils';

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

export const createIncorrectAnswer = (
  character: Character,
  submittedPinyin: string,
  characterIndex: number
): IncorrectAnswer => {
  return {
    characterIndex,
    submittedPinyin: submittedPinyin.trim() || '(empty)',
    correctPinyin: character.pinyin,
    simplified: character.simplified,
    traditional: character.traditional,
    english: character.english,
  };
};

export const createAnswer = (
  character: Character,
  submittedPinyin: string,
  characterIndex: number,
  isCorrect: boolean
): Answer => {
  const incorrectAnswer = createIncorrectAnswer(character, submittedPinyin, characterIndex);
  return {
    ...incorrectAnswer,
    isCorrect,
  };
};
