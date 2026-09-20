/**
 * Shared guards for global (window-level) keyboard handlers.
 *
 * The flashcard page keeps the pinyin input focused at all times, so any
 * unmodified global binding would steal characters the user is trying to type.
 * Every window listener must therefore either require a modifier or skip
 * events that originate inside an editable element.
 */

/**
 * True when the event originated inside a field the user can type into.
 *
 * Covers the native editable elements plus contenteditable regions and
 * anything exposing an ARIA textbox role.
 */
export const isEditableTarget = (target: EventTarget | null): boolean => {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  if (target.isContentEditable) {
    return true;
  }

  if (target.getAttribute('role') === 'textbox') {
    return true;
  }

  return ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName);
};

/**
 * True when the event originated inside an open dialog.
 *
 * A dialog owns the keyboard while it is open. Without this, Enter on the
 * reset dialog's confirm button would also reach the window listener and
 * advance the flashcard behind it.
 */
export const isInsideDialog = (target: EventTarget | null): boolean =>
  target instanceof HTMLElement && target.closest('[role="dialog"]') !== null;

/**
 * Whether the platform's primary modifier is held: Cmd on macOS, Ctrl elsewhere.
 *
 * Resolved once at module scope rather than per keystroke. `userAgent` is used
 * instead of the deprecated `navigator.platform`.
 */
const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad|iPod/.test(navigator.userAgent);

export const hasPlatformModifier = (event: KeyboardEvent): boolean =>
  isMac ? event.metaKey : event.ctrlKey;

/**
 * Human-readable name of that modifier, for button labels and help text.
 */
export const PLATFORM_MODIFIER_LABEL = isMac ? '⌘' : 'Ctrl+';
