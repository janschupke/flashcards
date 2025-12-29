import { matchesPinyinSearch } from './pinyinUtils';

/**
 * Filters table rows based on a search query
 * @param rows - Array of table rows to filter
 * @param query - Search query string
 * @param textFields - Array of field names to search in (simple substring match)
 * @param pinyinFields - Array of field names to search in (pinyin-aware matching)
 * @returns Filtered array of rows
 */
export const filterTableRows = <T>(
  rows: T[],
  query: string,
  textFields: (keyof T)[],
  pinyinFields: (keyof T)[] = []
): T[] => {
  if (!query.trim()) {
    return rows;
  }

  const normalizedQuery = query.toLowerCase().trim();

  return rows.filter((row) => {
    // Text fields: simple substring match
    for (const field of textFields) {
      const value = row[field];
      if (typeof value === 'string' && value.toLowerCase().includes(normalizedQuery)) {
        return true;
      }
    }

    // Pinyin fields: use normalized matching (handles tones, ü/u alternatives)
    for (const field of pinyinFields) {
      const value = row[field];
      if (typeof value === 'string' && matchesPinyinSearch(normalizedQuery, value)) {
        return true;
      }
    }

    return false;
  });
};
