import { Character } from '../types';

// Mock data that matches the test expectations
export const mockCharacters: Character[] = [
  {
    item: '1',
    pinyin: 'yī',
    english: 'one',
    simplified: '一',
    traditional: '一'
  },
  {
    item: '2',
    pinyin: 'èr',
    english: 'two',
    simplified: '二',
    traditional: '二'
  },
  {
    item: '3',
    pinyin: 'sān',
    english: 'three',
    simplified: '三',
    traditional: '三'
  },
  {
    item: '4',
    pinyin: 'sì',
    english: 'four',
    simplified: '四',
    traditional: '四'
  },
  {
    item: '5',
    pinyin: 'wǔ',
    english: 'five',
    simplified: '五',
    traditional: '五'
  },
  {
    item: '6',
    pinyin: 'liù',
    english: 'six',
    simplified: '六',
    traditional: '六'
  },
  // Characters with different simplified/traditional forms for testing
  {
    item: '7',
    pinyin: 'men',
    english: 'plural',
    simplified: '们',
    traditional: '們'
  },
  {
    item: '8',
    pinyin: 'zhè',
    english: 'this',
    simplified: '这',
    traditional: '這'
  },
  {
    item: '9',
    pinyin: 'gè',
    english: 'general measure word',
    simplified: '个',
    traditional: '個'
  }
];

export default mockCharacters; 
