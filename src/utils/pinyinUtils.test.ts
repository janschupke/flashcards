import { normalizePinyin, evaluatePinyinInput, getPinyinReadings, formatPinyinForDisplay } from './pinyinUtils';

describe('pinyinUtils', () => {
  describe('normalizePinyin', () => {
    it('should convert to lowercase', () => {
      expect(normalizePinyin('Wǒ')).toBe('wo');
      expect(normalizePinyin('Nǐ')).toBe('ni');
    });

    it('should remove tone numbers', () => {
      expect(normalizePinyin('wǒ')).toBe('wo');
      expect(normalizePinyin('nǐ')).toBe('ni');
      expect(normalizePinyin('shì')).toBe('shi');
      expect(normalizePinyin('lǚ')).toBe('lü');
    });

    it('should handle ü with different tones', () => {
      expect(normalizePinyin('lǖ')).toBe('lü');
      expect(normalizePinyin('lǘ')).toBe('lü');
      expect(normalizePinyin('lǚ')).toBe('lü');
      expect(normalizePinyin('lǜ')).toBe('lü');
    });

    it('should trim whitespace', () => {
      expect(normalizePinyin('  wǒ  ')).toBe('wo');
      expect(normalizePinyin('nǐ ')).toBe('ni');
    });

    it('should handle empty string', () => {
      expect(normalizePinyin('')).toBe('');
    });
  });

  describe('evaluatePinyinInput', () => {
    it('should return true for correct pinyin', () => {
      expect(evaluatePinyinInput('wo', 'wǒ')).toBe(true);
      expect(evaluatePinyinInput('ni', 'nǐ')).toBe(true);
      expect(evaluatePinyinInput('shi', 'shì')).toBe(true);
    });

    it('should return false for incorrect pinyin', () => {
      expect(evaluatePinyinInput('wa', 'wǒ')).toBe(false);
      expect(evaluatePinyinInput('ne', 'nǐ')).toBe(false);
    });

    it('should handle multiple pinyin readings', () => {
      expect(evaluatePinyinInput('shui', 'shuí/shéi')).toBe(true);
      expect(evaluatePinyinInput('shei', 'shuí/shéi')).toBe(true);
    });

    it('should be case insensitive', () => {
      expect(evaluatePinyinInput('WO', 'wǒ')).toBe(true);
      expect(evaluatePinyinInput('Wo', 'wǒ')).toBe(true);
    });

    it('should handle empty input', () => {
      expect(evaluatePinyinInput('', 'wǒ')).toBe(false);
    });
  });

  describe('getPinyinReadings', () => {
    it('should return array of normalized readings', () => {
      expect(getPinyinReadings('wǒ')).toEqual(['wo']);
      expect(getPinyinReadings('shuí/shéi')).toEqual(['shui', 'shei']);
    });

    it('should filter out empty readings', () => {
      expect(getPinyinReadings('wǒ;;shì')).toEqual(['wo', 'shi']);
    });

    it('should handle empty string', () => {
      expect(getPinyinReadings('')).toEqual([]);
    });
  });

  describe('formatPinyinForDisplay', () => {
    it('should trim pinyin for display', () => {
      expect(formatPinyinForDisplay('  wǒ  ')).toBe('wǒ');
      expect(formatPinyinForDisplay('nǐ ')).toBe('nǐ');
    });

    it('should handle empty string', () => {
      expect(formatPinyinForDisplay('')).toBe('');
    });
  });
}); 
