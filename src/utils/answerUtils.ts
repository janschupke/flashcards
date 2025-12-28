import { Answer, FlashcardMode } from '../types';

/**
 * Gets the submitted text from an answer based on the mode
 * @param answer - The answer object
 * @returns The submitted text (pinyin or character) or '(empty)' if empty
 */
export const getSubmittedText = (answer: Answer): string => {
  if (answer.mode === FlashcardMode.PINYIN) {
    return answer.submittedPinyin || '(empty)';
  }
  return answer.submittedCharacter || '(empty)';
};

/**
 * Gets the correct text from an answer based on the mode
 * @param answer - The answer object
 * @returns The correct text (pinyin or character)
 */
export const getCorrectText = (answer: Answer): string => {
  if (answer.mode === FlashcardMode.PINYIN) {
    return answer.correctPinyin;
  }
  return answer.correctCharacter ?? '';
};

