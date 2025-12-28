import React from 'react';
import { Answer } from '../../types';
import { getSubmittedText } from '../../utils/answerUtils';
import { getAnswerColorClass } from '../../utils/styleUtils';
import { CharacterInfoColumn } from './CharacterInfoColumn';

interface PreviousCharacterProps {
  previousAnswer: Answer | null;
}

const PLACEHOLDER = '—';

export const PreviousCharacter: React.FC<PreviousCharacterProps> = ({ previousAnswer }) => {
  const submittedText = previousAnswer ? getSubmittedText(previousAnswer) : PLACEHOLDER;
  const submittedColorClass = previousAnswer
    ? getAnswerColorClass(previousAnswer.isCorrect)
    : 'text-text-secondary';

  return (
    <div>
      <div className="text-xs text-text-tertiary mb-1 uppercase tracking-wider text-center">
        Previous Character
      </div>
      <div className="flex flex-wrap justify-between items-center gap-2 sm:gap-3 text-sm text-text-secondary">
        <CharacterInfoColumn
          label="Simplified"
          value={previousAnswer ? previousAnswer.simplified : PLACEHOLDER}
        />
        <CharacterInfoColumn
          label="Traditional"
          value={previousAnswer ? previousAnswer.traditional : PLACEHOLDER}
        />
        <CharacterInfoColumn
          label="Pinyin"
          value={previousAnswer ? previousAnswer.correctPinyin : PLACEHOLDER}
        />
        <CharacterInfoColumn
          label="English"
          value={previousAnswer ? previousAnswer.english : PLACEHOLDER}
        />
        <CharacterInfoColumn
          label="Submitted"
          value={submittedText}
          valueClassName={submittedColorClass}
        />
      </div>
    </div>
  );
};
