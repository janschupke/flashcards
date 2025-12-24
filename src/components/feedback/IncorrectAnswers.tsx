import React, { useState } from 'react';
import { IncorrectAnswer, FlashcardMode } from '../../types';

interface IncorrectAnswersProps {
  incorrectAnswers: IncorrectAnswer[];
}

export const IncorrectAnswers: React.FC<IncorrectAnswersProps> = ({
  incorrectAnswers,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const getSubmittedColumn = (answer: IncorrectAnswer) => {
    if (answer.mode === FlashcardMode.PINYIN) {
      return answer.submittedPinyin;
    } else {
      return answer.submittedCharacter || '(empty)';
    }
  };

  const getCorrectColumn = (answer: IncorrectAnswer) => {
    if (answer.mode === FlashcardMode.PINYIN) {
      return answer.correctPinyin;
    } else {
      return answer.correctCharacter || '';
    }
  };

  const getColumnHeaders = () => {
    const hasCharacterModes = incorrectAnswers.some(answer => answer.mode !== FlashcardMode.PINYIN);
    
    if (hasCharacterModes) {
      return (
       <tr>
         <th className="text-left text-textc-muted text-[0.95rem] font-semibold px-1.5 py-2 border-b border-secondary">Simplified</th>
         <th className="text-left text-textc-muted text-[0.95rem] font-semibold px-1.5 py-2 border-b border-secondary">Traditional</th>
         <th className="text-left text-textc-muted text-[0.95rem] font-semibold px-1.5 py-2 border-b border-secondary">Expected</th>
         <th className="text-left text-textc-muted text-[0.95rem] font-semibold px-1.5 py-2 border-b border-secondary">Submitted</th>
         <th className="text-left text-textc-muted text-[0.95rem] font-semibold px-1.5 py-2 border-b border-secondary">English</th>
       </tr>
      );
    } else {
      return (
       <tr>
         <th className="text-left text-textc-muted text-[0.95rem] font-semibold px-1.5 py-2 border-b border-secondary">Simplified</th>
         <th className="text-left text-textc-muted text-[0.95rem] font-semibold px-1.5 py-2 border-b border-secondary">Traditional</th>
         <th className="text-left text-textc-muted text-[0.95rem] font-semibold px-1.5 py-2 border-b border-secondary">Pinyin</th>
         <th className="text-left text-textc-muted text-[0.95rem] font-semibold px-1.5 py-2 border-b border-secondary">Submitted</th>
         <th className="text-left text-textc-muted text-[0.95rem] font-semibold px-1.5 py-2 border-b border-secondary">English</th>
       </tr>
      );
    }
  };

  const renderTableRow = (answer: IncorrectAnswer) => {
    const hasCharacterModes = incorrectAnswers.some(a => a.mode !== FlashcardMode.PINYIN);
    
    if (hasCharacterModes) {
      return (
       <tr key={answer.characterIndex}>
         <td className="text-textc-muted text-[0.95rem] px-1.5 py-2 border-b border-background-secondary align-middle">{answer.simplified}</td>
         <td className="text-textc-muted text-[0.95rem] px-1.5 py-2 border-b border-background-secondary align-middle">{answer.traditional}</td>
         <td className="text-textc-muted text-[0.95rem] px-1.5 py-2 border-b border-background-secondary align-middle">{getCorrectColumn(answer)}</td>
         <td className="text-emerald-500 text-[0.95rem] px-1.5 py-2 border-b border-background-secondary align-middle">{getSubmittedColumn(answer)}</td>
         <td className="text-textc-muted text-[0.95rem] px-1.5 py-2 border-b border-background-secondary align-middle">{answer.english}</td>
       </tr>
      );
    } else {
      return (
       <tr key={answer.characterIndex}>
         <td className="text-textc-muted text-[0.95rem] px-1.5 py-2 border-b border-background-secondary align-middle">{answer.simplified}</td>
         <td className="text-textc-muted text-[0.95rem] px-1.5 py-2 border-b border-background-secondary align-middle">{answer.traditional}</td>
         <td className="text-textc-muted text-[0.95rem] px-1.5 py-2 border-b border-background-secondary align-middle">{answer.correctPinyin}</td>
         <td className="text-rose-500 text-[0.95rem] px-1.5 py-2 border-b border-background-secondary align-middle">{answer.submittedPinyin}</td>
         <td className="text-textc-muted text-[0.95rem] px-1.5 py-2 border-b border-background-secondary align-middle">{answer.english}</td>
       </tr>
      );
    }
  };

  return (
    <div>
      <div onClick={toggleExpanded} className="flex items-center justify-between cursor-pointer py-2 select-none hover:opacity-80">
        <h3 className="m-0 text-[1.1rem] font-semibold text-textc-muted">Incorrect Answers ({incorrectAnswers.length})</h3>
        <span className={`text-[1.2rem] text-textc-muted transition-transform ${isExpanded ? 'rotate-90' : 'rotate-0'}`}>▶</span>
      </div>
      <div data-testid="incorrect-answers-content" className={`overflow-hidden transition-[max-height,opacity] duration-300 py-2 ${isExpanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
        {incorrectAnswers.length === 0 ? (
          <div className="text-center text-secondary-light italic p-5">
            No incorrect answers yet. Keep practicing!
          </div>
        ) : (
          <table className="w-full border-collapse mt-2">
            <thead>
              {getColumnHeaders()}
            </thead>
            <tbody>
              {incorrectAnswers.map(renderTableRow)}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}; 
