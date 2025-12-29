/**
 * Utility function for conditionally joining classNames together
 * Similar to clsx but simpler - just handles strings and objects
 * @param classes - Class names to join (strings, objects with boolean values, or arrays)
 * @returns Joined class string
 *
 * @example
 * cn('base-class', condition && 'conditional-class')
 * cn({ 'active': isActive, 'disabled': isDisabled })
 * cn('base', ['array', 'of', 'classes'])
 */
export const cn = (...classes: Array<string | Record<string, boolean> | string[] | undefined | null | false>): string => {
  const result: string[] = [];

  for (const cls of classes) {
    if (!cls) continue;

    if (typeof cls === 'string') {
      result.push(cls);
    } else if (Array.isArray(cls)) {
      result.push(...cls.filter(Boolean));
    } else if (typeof cls === 'object') {
      for (const [key, value] of Object.entries(cls)) {
        if (value) {
          result.push(key);
        }
      }
    }
  }

  return result.join(' ');
};


