import React from 'react';
import { Answer } from '../types';
import { getSubmittedText } from './answerUtils';
import { getAnswerColorClass } from './styleUtils';

/**
 * Generates table rows for answer history display (always pinyin)
 * @param answers - Array of answers to display
 * @returns Array of React node arrays representing table rows
 */
export const generateAnswerTableRows = (answers: Answer[]): React.ReactNode[][] => {
  return answers.map((answer) => {
    const submitted = getSubmittedText(answer);
    const submittedColorClass = getAnswerColorClass(answer.isCorrect);

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
      React.createElement('span', { key: 'submitted', className: submittedColorClass }, submitted),
      React.createElement(
        'span',
        { key: 'english', className: 'text-text-secondary' },
        answer.english
      ),
    ];
  });
};
