import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { PreviousCharacter } from './PreviousCharacter';

// Mock the data
vi.mock('../data.json', () => ({
  default: [
    { item: '1', chinese: '我', pinyin: 'wǒ', english: 'I ; me' },
    { item: '2', chinese: '好', pinyin: 'hǎo', english: 'good' },
  ]
}));

describe('PreviousCharacter', () => {
  it('renders placeholders when previousCharacterIndex is null', () => {
    render(<PreviousCharacter previousCharacterIndex={null} />);
    expect(screen.getByText('Previous Character')).toBeInTheDocument();
    expect(screen.getAllByText('—')).toHaveLength(4); // All placeholders
  });

  it('renders previous character information when index is provided', () => {
    render(<PreviousCharacter previousCharacterIndex={0} />);
    
    expect(screen.getByText('Previous Character')).toBeInTheDocument();
    expect(screen.getByText('Simplified')).toBeInTheDocument();
    expect(screen.getByText('Traditional')).toBeInTheDocument();
    expect(screen.getByText('Pinyin')).toBeInTheDocument();
    expect(screen.getByText('English')).toBeInTheDocument();
    
    expect(screen.getAllByText('我')).toHaveLength(2); // Simplified and Traditional
    expect(screen.getByText('wǒ')).toBeInTheDocument();
    expect(screen.getByText('I ; me')).toBeInTheDocument();
  });

  it('renders placeholders when character index is out of bounds', () => {
    render(<PreviousCharacter previousCharacterIndex={999} />);
    expect(screen.getByText('Previous Character')).toBeInTheDocument();
    expect(screen.getAllByText('—')).toHaveLength(4); // All placeholders
  });
}); 
