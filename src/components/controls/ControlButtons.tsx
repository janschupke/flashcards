import React from 'react';

interface ControlButtonsProps {
  onTogglePinyin: () => void;
  onToggleEnglish: () => void;
  onNext: () => void;
}

export const ControlButtons: React.FC<ControlButtonsProps> = ({
  onTogglePinyin,
  onToggleEnglish,
  onNext,
}) => {
  return (
    <div className="flex gap-3 justify-center flex-wrap">
      <button
        type="button"
        onClick={onTogglePinyin}
        className="btn btn-secondary min-w-[120px]"
      >
        Pinyin (,)
      </button>
      <button
        type="button"
        onClick={onToggleEnglish}
        className="btn btn-secondary min-w-[120px]"
      >
        English (.)
      </button>
      <button
        type="button"
        onClick={onNext}
        className="btn btn-primary min-w-[120px]"
      >
        Next (Enter)
      </button>
    </div>
  );
}; 
