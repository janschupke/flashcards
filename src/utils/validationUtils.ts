import { APP_LIMITS, UI_CONSTANTS } from '../constants';

export const validateLimit = (value: string, minAvailable: number, maxAvailable: number): number => {
  const parsed = parseInt(value, 10);
  if (isNaN(parsed) || parsed <= 0) {
    return Math.max(minAvailable, Math.min(UI_CONSTANTS.MIN_WIDTH, maxAvailable));
  }
  return Math.max(minAvailable, Math.min(parsed, maxAvailable));
};

export const getModeSpecificLimit = (mode: 'pinyin' | 'simplified' | 'traditional'): number => {
  return mode === 'pinyin' ? APP_LIMITS.PINYIN_MODE_MAX : APP_LIMITS.SIMPLIFIED_TRADITIONAL_MAX;
}; 
