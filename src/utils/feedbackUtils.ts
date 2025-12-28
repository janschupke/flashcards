import { CHINESE_TEXT } from '../constants';

/**
 * Gets feedback text for pinyin input
 * @param isCorrect - Whether the input is correct (true/false/null)
 * @param correctPinyin - The correct pinyin value
 * @returns Feedback message string
 */
export const getPinyinFeedbackText = (isCorrect: boolean | null, correctPinyin: string): string => {
  if (isCorrect === true) return CHINESE_TEXT.FEEDBACK.CORRECT;
  if (isCorrect === false) return CHINESE_TEXT.FEEDBACK.INCORRECT_PINYIN(correctPinyin);
  return '';
};

/**
 * Gets feedback text for character input
 * @param isCorrect - Whether the input is correct (true/false/null)
 * @param correctCharacter - The correct character value
 * @returns Feedback message string
 */
export const getCharacterFeedbackText = (isCorrect: boolean | null, correctCharacter: string): string => {
  if (isCorrect === true) return CHINESE_TEXT.FEEDBACK.CORRECT;
  if (isCorrect === false) return CHINESE_TEXT.FEEDBACK.INCORRECT_CHARACTER(correctCharacter);
  return '';
};

