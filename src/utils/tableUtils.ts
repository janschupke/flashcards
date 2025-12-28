import React from 'react';
import { Answer } from '../types';
import { getSubmittedText, getCorrectText } from './answerUtils';
import { getAnswerColorClass } from './styleUtils';

/**
 * Generates table rows for answer history display
 * @param answers - Array of answers to display
 * @param hasCharacterModes - Whether any answers are from character input modes
 * @returns Array of React node arrays representing table rows
 */
export const generateAnswerTableRows = (
  answers: Answer[],
  hasCharacterModes: boolean
): React.ReactNode[][] => {
  return answers.map((answer) => {
    const submitted = getSubmittedText(answer);
    const correct = getCorrectText(answer);
    const submittedColorClass = getAnswerColorClass(answer.isCorrect);

    if (hasCharacterModes) {
      return [
        React.createElement(
          'span',
          { key: 'simplified', className: 'text-text-secondary' },
          answer.simplified
        ),
        React.createElement(
          'span',
          { key: 'traditional', className: 'text-text-secondary' },
          answer.traditional
        ),
        React.createElement('span', { key: 'correct', className: 'text-text-secondary' }, correct),
        React.createElement(
          'span',
          { key: 'submitted', className: submittedColorClass },
          submitted
        ),
        React.createElement(
          'span',
          { key: 'english', className: 'text-text-secondary' },
          answer.english
        ),
      ];
    } else {
      return [
        React.createElement(
          'span',
          { key: 'simplified', className: 'text-text-secondary' },
          answer.simplified
        ),
        React.createElement(
          'span',
          { key: 'traditional', className: 'text-text-secondary' },
          answer.traditional
        ),
        React.createElement(
          'span',
          { key: 'pinyin', className: 'text-text-secondary' },
          answer.correctPinyin
        ),
        React.createElement(
          'span',
          { key: 'submitted', className: submittedColorClass },
          submitted
        ),
        React.createElement(
          'span',
          { key: 'english', className: 'text-text-secondary' },
          answer.english
        ),
      ];
    }
  });
};
