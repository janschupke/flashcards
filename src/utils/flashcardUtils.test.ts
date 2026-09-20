import { describe, it, expect } from 'vitest';
import { evaluatePinyinAnswer, createAnswer } from './flashcardUtils';
import { Character } from '../types';

const character: Character = {
  item: '1',
  pinyin: 'wǒ',
  english: 'I; me',
  simplified: '我',
  traditional: '我',
};

describe('evaluatePinyinAnswer', () => {
  // Matching is deliberately tone-insensitive: normalizePinyin strips tone
  // numbers and flattens tone marks before comparing. Answering the right
  // syllable with the wrong tone is accepted.
  it.each([
    ['exact match with tone', 'wǒ'],
    ['toneless', 'wo'],
    ['surrounding whitespace', '  wo  '],
    ['different case', 'WO'],
    ['a different tone mark', 'wò'],
    ['a tone number, right or wrong', 'wo4'],
  ])('accepts %s', (_label, input) => {
    expect(evaluatePinyinAnswer(input, character)).toEqual({ isCorrect: true, hasInput: true });
  });

  it('rejects a different syllable', () => {
    expect(evaluatePinyinAnswer('ni', character)).toEqual({ isCorrect: false, hasInput: true });
  });

  it.each([
    ['empty', ''],
    ['whitespace only', '   '],
  ])('treats %s input as an incorrect attempt, not as "no answer"', (_label, input) => {
    // hasInput drives the flash animation; isCorrect drives scoring. An empty
    // answer still counts as an attempt.
    expect(evaluatePinyinAnswer(input, character)).toEqual({ isCorrect: false, hasInput: false });
  });
});

describe('createAnswer', () => {
  it('records the submitted answer alongside the character', () => {
    expect(createAnswer(character, ' wo ', 7, true)).toEqual({
      characterIndex: 7,
      submittedPinyin: 'wo',
      correctPinyin: 'wǒ',
      simplified: '我',
      traditional: '我',
      english: 'I; me',
      isCorrect: true,
    });
  });

  it('marks an empty submission explicitly rather than storing a blank', () => {
    expect(createAnswer(character, '   ', 0, false).submittedPinyin).toBe('(empty)');
  });

  it('trusts the isCorrect it is given rather than re-evaluating', () => {
    // Scoring is decided once, by evaluatePinyinAnswer, and carried through.
    expect(createAnswer(character, 'nonsense', 0, true).isCorrect).toBe(true);
  });
});
