import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { CharacterDisplay } from './CharacterDisplay';
import { getCharacterByIndex, getHintText } from '../utils/characterUtils';

vi.mock('../utils/characterUtils');

describe('CharacterDisplay', () => {
  it('displays character correctly', () => {
    vi.mocked(getCharacterByIndex).mockReturnValue({ chinese: '一', pinyin: 'yī', english: 'one' });
    vi.mocked(getHintText).mockReturnValue('Tap a button below to reveal');
    render(<CharacterDisplay currentIndex={0} hintType={0} />);
    expect(screen.getByTestId('main-character')).toHaveTextContent('一');
    expect(screen.getByTestId('hint-text')).toHaveTextContent('Tap a button below to reveal');
  });

  it('displays pinyin hint when active', () => {
    vi.mocked(getCharacterByIndex).mockReturnValue({ chinese: '一', pinyin: 'yī', english: 'one' });
    vi.mocked(getHintText).mockReturnValue('yī');
    render(<CharacterDisplay currentIndex={0} hintType={1} />);
    expect(screen.getByTestId('hint-text')).toHaveTextContent('yī');
  });
}); 
