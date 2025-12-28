import React, { createContext, useContext, ReactNode } from 'react';
import { useFlashCard } from '../hooks/useFlashCard';
import { FlashCardState, FlashCardActions } from '../types';

interface FlashCardContextValue extends FlashCardState, FlashCardActions {}

const FlashCardContext = createContext<FlashCardContextValue | undefined>(undefined);

interface FlashCardProviderProps {
  children: ReactNode;
  initialCurrent?: number;
}

export const FlashCardProvider: React.FC<FlashCardProviderProps> = ({
  children,
  initialCurrent,
}) => {
  const flashCardState = useFlashCard({ initialCurrent });

  return (
    <FlashCardContext.Provider value={flashCardState}>{children}</FlashCardContext.Provider>
  );
};

export const useFlashCardContext = (): FlashCardContextValue => {
  const context = useContext(FlashCardContext);
  if (context === undefined) {
    throw new Error('useFlashCardContext must be used within a FlashCardProvider');
  }
  return context;
};

