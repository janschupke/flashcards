/**
 * Normalize pinyin by removing tones and converting to lowercase
 * @param pinyin - The pinyin string to normalize
 * @returns Normalized pinyin without tones
 */
export function normalizePinyin(pinyin: string): string {
  return pinyin
    .toLowerCase()
    .replace(/[1-5]/g, '') // Remove tone numbers
    .replace(/ǎ/g, 'a')
    .replace(/ā/g, 'a')
    .replace(/á/g, 'a')
    .replace(/à/g, 'a')
    .replace(/ē/g, 'e')
    .replace(/é/g, 'e')
    .replace(/ě/g, 'e')
    .replace(/è/g, 'e')
    .replace(/ī/g, 'i')
    .replace(/í/g, 'i')
    .replace(/ǐ/g, 'i')
    .replace(/ì/g, 'i')
    .replace(/ō/g, 'o')
    .replace(/ó/g, 'o')
    .replace(/ǒ/g, 'o')
    .replace(/ò/g, 'o')
    .replace(/ū/g, 'u')
    .replace(/ú/g, 'u')
    .replace(/ǔ/g, 'u')
    .replace(/ù/g, 'u')
    .replace(/ǖ/g, 'ü')
    .replace(/ǘ/g, 'ü')
    .replace(/ǚ/g, 'ü')
    .replace(/ǜ/g, 'ü')
    .replace(/v/g, 'ü') // Convert 'v' to 'ü' (common alternative input for ü)
    .replace(/ń/g, 'n')
    .replace(/ň/g, 'n')
    .replace(/ḿ/g, 'm')
    .trim();
}

/**
 * Evaluate pinyin input against correct pinyin
 * @param userInput - User's pinyin input
 * @param correctPinyin - Correct pinyin for the character
 * @returns True if the input matches the correct pinyin
 */
export function evaluatePinyinInput(userInput: string, correctPinyin: string): boolean {
  const normalizedInput = normalizePinyin(userInput);
  const normalizedCorrect = normalizePinyin(correctPinyin);

  // Handle multiple pinyin readings (separated by semicolons or slashes)
  const correctReadings = normalizedCorrect.split(/[;/]/).map((r) => r.trim());

  // Check direct match first
  if (correctReadings.includes(normalizedInput)) {
    return true;
  }

  // Handle ü/u alternatives: accept 'u' when correct has 'ü' (keyboard convenience)
  // Note: 'v' → 'ü' is already handled in normalizePinyin, but 'u' → 'ü' is not
  // because 'u' and 'ü' are different sounds. We only accept 'u' as alternative
  // when the correct answer specifically has 'ü'.
  for (const reading of correctReadings) {
    if (reading.includes('ü')) {
      const alternativeReading = reading.replace(/ü/g, 'u');
      if (normalizedInput === alternativeReading) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Get all possible pinyin readings for a character
 * @param pinyin - The pinyin string (may contain multiple readings)
 * @returns Array of normalized pinyin readings
 */
export function getPinyinReadings(pinyin: string): string[] {
  const normalized = normalizePinyin(pinyin);
  return normalized
    .split(/[;/]/)
    .map((r) => r.trim())
    .filter((r) => r.length > 0);
}

/**
 * Format pinyin for display (with tones)
 * @param pinyin - The pinyin string
 * @returns Formatted pinyin for display
 */
export function formatPinyinForDisplay(pinyin: string): string {
  return pinyin.trim();
}

/**
 * Check if a search query matches pinyin text (handles normalization and ü/u alternatives)
 * @param searchQuery - The search query (normalized)
 * @param pinyinText - The pinyin text to search in
 * @returns True if the query matches the pinyin text
 */
export function matchesPinyinSearch(searchQuery: string, pinyinText: string): boolean {
  const normalizedQuery = normalizePinyin(searchQuery);
  const normalizedText = normalizePinyin(pinyinText);

  // Empty query should not match
  if (!normalizedQuery) {
    return false;
  }

  // Direct match
  if (normalizedText.includes(normalizedQuery)) {
    return true;
  }

  // Handle ü/u alternatives: if query has 'u' and text has 'ü', check if they match
  if (normalizedQuery.includes('u') && normalizedText.includes('ü')) {
    const textWithU = normalizedText.replace(/ü/g, 'u');
    if (textWithU.includes(normalizedQuery)) {
      return true;
    }
  }

  // Handle ü/u alternatives: if query has 'ü' and text has 'u', check if they match
  // (less common, but handle for completeness)
  if (normalizedQuery.includes('ü') && normalizedText.includes('u')) {
    const queryWithU = normalizedQuery.replace(/ü/g, 'u');
    if (normalizedText.includes(queryWithU)) {
      return true;
    }
  }

  return false;
}

/**
 * Generate Purple Culture dictionary URL for a Chinese character
 * @param character - The Chinese character (simplified or traditional)
 * @returns URL to Purple Culture dictionary page for the character
 */
export function getPurpleCultureUrl(character: string): string {
  const encoded = encodeURIComponent(character);
  return `https://www.purpleculture.net/dictionary-details/?word=${encoded}`;
}
