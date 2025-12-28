import React from 'react';
import { Answer, FlashcardMode } from '../../types';

interface PreviousCharacterProps {
  previousAnswer: Answer | null;
}

const PLACEHOLDER = '—';

export const PreviousCharacter: React.FC<PreviousCharacterProps> = ({ previousAnswer }) => {
  const getSubmittedText = (): string => {
    if (!previousAnswer) return PLACEHOLDER;
    if (previousAnswer.mode === FlashcardMode.PINYIN) {
      return previousAnswer.submittedPinyin || '(empty)';
    }
    return previousAnswer.submittedCharacter || '(empty)';
  };

  const getSubmittedColorClass = (): string => {
    if (!previousAnswer) return 'text-text-secondary';
    return previousAnswer.isCorrect ? 'text-success' : 'text-error';
  };

  return (
    <div>
      <div className="text-xs text-text-tertiary mb-1 uppercase tracking-wider text-center">
        Previous Character
      </div>
      <div className="flex justify-between items-center gap-2 sm:gap-3 text-sm text-text-secondary">
        <div className="flex flex-col items-center flex-1">
          <div className="text-xs sm:text-sm text-text-tertiary mb-1 uppercase tracking-wider">Simplified</div>
          <div className="text-lg sm:text-xl md:text-2xl font-medium text-text-secondary">
            {previousAnswer ? previousAnswer.simplified : PLACEHOLDER}
          </div>
        </div>
        <div className="flex flex-col items-center flex-1">
          <div className="text-xs sm:text-sm text-text-tertiary mb-1 uppercase tracking-wider">
            Traditional
          </div>
          <div className="text-lg sm:text-xl md:text-2xl font-medium text-text-secondary">
            {previousAnswer ? previousAnswer.traditional : PLACEHOLDER}
          </div>
        </div>
        <div className="flex flex-col items-center flex-1">
          <div className="text-xs sm:text-sm text-text-tertiary mb-1 uppercase tracking-wider">Pinyin</div>
          <div className="text-lg sm:text-xl md:text-2xl font-medium text-text-secondary">
            {previousAnswer ? previousAnswer.correctPinyin : PLACEHOLDER}
          </div>
        </div>
        <div className="flex flex-col items-center flex-1">
          <div className="text-xs sm:text-sm text-text-tertiary mb-1 uppercase tracking-wider">English</div>
          <div className="text-lg sm:text-xl md:text-2xl font-medium text-text-secondary">
            {previousAnswer ? previousAnswer.english : PLACEHOLDER}
          </div>
        </div>
        <div className="flex flex-col items-center flex-1">
          <div className="text-xs sm:text-sm text-text-tertiary mb-1 uppercase tracking-wider">Submitted</div>
          <div className={`text-lg sm:text-xl md:text-2xl font-medium ${getSubmittedColorClass()}`}>
            {getSubmittedText()}
          </div>
        </div>
      </div>
    </div>
  );
};
