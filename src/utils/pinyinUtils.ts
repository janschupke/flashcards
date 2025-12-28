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

  return correctReadings.includes(normalizedInput);
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
