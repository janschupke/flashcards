import { getTraditionalCharacter, hasTraditionalForm } from './traditionalMapping';

describe('traditionalMapping', () => {
  describe('getTraditionalCharacter', () => {
    it('should return traditional character for simplified character', () => {
      expect(getTraditionalCharacter('爱')).toBe('愛');
      expect(getTraditionalCharacter('车')).toBe('車');
      expect(getTraditionalCharacter('学')).toBe('學');
    });

    it('should return same character if no traditional mapping exists', () => {
      expect(getTraditionalCharacter('我')).toBe('我');
      expect(getTraditionalCharacter('的')).toBe('的');
      expect(getTraditionalCharacter('你')).toBe('你');
    });

    it('should handle empty string', () => {
      expect(getTraditionalCharacter('')).toBe('');
    });
  });

  describe('hasTraditionalForm', () => {
    it('should return true for characters with traditional forms', () => {
      expect(hasTraditionalForm('爱')).toBe(true);
      expect(hasTraditionalForm('车')).toBe(true);
      expect(hasTraditionalForm('学')).toBe(true);
    });

    it('should return false for characters without traditional forms', () => {
      expect(hasTraditionalForm('我')).toBe(false);
      expect(hasTraditionalForm('的')).toBe(false);
      expect(hasTraditionalForm('你')).toBe(false);
    });

    it('should handle empty string', () => {
      expect(hasTraditionalForm('')).toBe(false);
    });
  });
}); 
