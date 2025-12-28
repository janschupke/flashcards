/**
 * Centralized logging utility
 * Allows console.error for error logging while maintaining ESLint compliance
 */
export const logger = {
  error: (message: string, error?: unknown): void => {
    console.error(message, error);
  },
};
