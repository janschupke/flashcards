import React from 'react';
import data from '../../data/characters.json';

interface PreviousCharacterProps {
  previousCharacterIndex: number | null;
}

const PLACEHOLDER = '—';

export const PreviousCharacter: React.FC<PreviousCharacterProps> = ({
  previousCharacterIndex,
}) => {
  let character = null;
  if (
    previousCharacterIndex !== null &&
    previousCharacterIndex >= 0 &&
    previousCharacterIndex < data.length
  ) {
    character = data[previousCharacterIndex];
  }

  return (
    <div className="mt-8 p-4 bg-secondary-dark rounded-xl border border-secondary">
      <div className="text-[0.75rem] text-secondary-light mb-2 uppercase tracking-wider">Previous Character</div>
      <div className="flex justify-between items-center gap-4 text-sm text-textc-secondary">
        <div className="flex flex-col items-center flex-1">
          <div className="text-[0.625rem] text-secondary-light mb-1 uppercase tracking-wider">Simplified</div>
          <div className="text-base font-medium text-textc-muted">{character ? character.simplified : PLACEHOLDER}</div>
        </div>
        <div className="flex flex-col items-center flex-1">
          <div className="text-[0.625rem] text-secondary-light mb-1 uppercase tracking-wider">Traditional</div>
          <div className="text-base font-medium text-textc-muted">{character ? character.traditional : PLACEHOLDER}</div>
        </div>
        <div className="flex flex-col items-center flex-1">
          <div className="text-[0.625rem] text-secondary-light mb-1 uppercase tracking-wider">Pinyin</div>
          <div className="text-base font-medium text-textc-muted">{character ? character.pinyin : PLACEHOLDER}</div>
        </div>
        <div className="flex flex-col items-center flex-1">
          <div className="text-[0.625rem] text-secondary-light mb-1 uppercase tracking-wider">English</div>
          <div className="text-base font-medium text-textc-muted">{character ? character.english : PLACEHOLDER}</div>
        </div>
      </div>
    </div>
  );
}; 
