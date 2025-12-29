import { Answer } from '../types';

/**
 * Gets the submitted pinyin text from an answer
 * @param answer - The answer object
 * @returns The submitted pinyin text or '(empty)' if empty
 */
export const getSubmittedText = (answer: Answer): string => {
  return answer.submittedPinyin && answer.submittedPinyin.trim() !== ''
    ? answer.submittedPinyin
    : '(empty)';
};

/**
 * Gets the correct pinyin text from an answer
 * @param answer - The answer object
 * @returns The correct pinyin text
 */
export const getCorrectText = (answer: Answer): string => {
  return answer.correctPinyin;
};
