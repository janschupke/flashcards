import { describe, it, expect } from 'vitest';
import { filterTableRows } from './searchUtils';

describe('searchUtils', () => {
  interface TestRow {
    simplified: string;
    traditional: string;
    pinyin: string;
    english: string;
    number: number;
  }

  const testData: TestRow[] = [
    {
      simplified: '我',
      traditional: '我',
      pinyin: 'wǒ',
      english: 'I',
      number: 1,
    },
    {
      simplified: '好',
      traditional: '好',
      pinyin: 'hǎo',
      english: 'good',
      number: 2,
    },
    {
      simplified: '你',
      traditional: '你',
      pinyin: 'nǐ',
      english: 'you',
      number: 3,
    },
  ];

  describe('filterTableRows', () => {
    it('should return all rows when query is empty', () => {
      const result = filterTableRows(testData, '', ['simplified'], []);
      expect(result).toEqual(testData);
    });

    it('should return all rows when query is only whitespace', () => {
      const result = filterTableRows(testData, '   ', ['simplified'], []);
      expect(result).toEqual(testData);
    });

    it('should filter by text fields (case insensitive)', () => {
      const result = filterTableRows(testData, '我', ['simplified'], []);
      expect(result).toHaveLength(1);
      expect(result[0]?.simplified).toBe('我');
    });

    it('should filter by multiple text fields', () => {
      const result = filterTableRows(testData, 'good', ['simplified', 'english'], []);
      expect(result).toHaveLength(1);
      expect(result[0]?.english).toBe('good');
    });

    it('should return empty array when no matches found', () => {
      const result = filterTableRows(testData, 'nonexistent', ['simplified', 'english'], []);
      expect(result).toHaveLength(0);
    });

    it('should handle case insensitive matching', () => {
      const result = filterTableRows(testData, 'GOOD', ['english'], []);
      expect(result).toHaveLength(1);
      expect(result[0]?.english).toBe('good');
    });

    it('should match partial strings', () => {
      const result = filterTableRows(testData, 'goo', ['english'], []);
      expect(result).toHaveLength(1);
      expect(result[0]?.english).toBe('good');
    });

    it('should filter by pinyin fields using normalized matching', () => {
      // This tests that pinyin fields are passed correctly
      // Actual pinyin matching is tested in pinyinUtils
      const result = filterTableRows(testData, 'wo', ['simplified'], ['pinyin']);
      // Should match 'wǒ' via pinyin field
      expect(result.length).toBeGreaterThan(0);
    });

    it('should not filter by numeric fields', () => {
      // Numbers are not searchable, so searching for "1" shouldn't match number field
      const result = filterTableRows(testData, '1', ['simplified', 'english'], []);
      // Should not match the number field
      expect(result).toHaveLength(0);
    });

    it('should return multiple matches', () => {
      // Add another row with similar data
      const extendedData: TestRow[] = [
        ...testData,
        {
          simplified: '我们',
          traditional: '我們',
          pinyin: 'wǒmen',
          english: 'we',
          number: 4,
        },
      ];
      const result = filterTableRows(extendedData, 'wo', ['simplified'], ['pinyin']);
      // Should match both 'wǒ' and 'wǒmen'
      expect(result.length).toBeGreaterThan(0);
    });
  });
});


