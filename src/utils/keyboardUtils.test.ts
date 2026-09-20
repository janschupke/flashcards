import { describe, it, expect, afterEach } from 'vitest';
import { isEditableTarget, hasPlatformModifier, PLATFORM_MODIFIER_LABEL } from './keyboardUtils';

const isMac = /Mac|iPhone|iPad|iPod/.test(navigator.userAgent);

describe('isEditableTarget', () => {
  const created: HTMLElement[] = [];

  const make = (tag: string, attrs: Record<string, string> = {}): HTMLElement => {
    const el = document.createElement(tag);
    Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
    document.body.appendChild(el);
    created.push(el);
    return el;
  };

  afterEach(() => {
    created.splice(0).forEach((el) => el.remove());
  });

  it.each(['input', 'textarea', 'select'])('treats <%s> as editable', (tag) => {
    expect(isEditableTarget(make(tag))).toBe(true);
  });

  it('treats a contenteditable element as editable', () => {
    const el = make('div');
    // jsdom does not derive isContentEditable from the attribute.
    Object.defineProperty(el, 'isContentEditable', { value: true });

    expect(isEditableTarget(el)).toBe(true);
  });

  it('treats role="textbox" as editable', () => {
    expect(isEditableTarget(make('div', { role: 'textbox' }))).toBe(true);
  });

  it.each(['div', 'button', 'a', 'span'])('treats <%s> as not editable', (tag) => {
    expect(isEditableTarget(make(tag))).toBe(false);
  });

  it('handles a null target', () => {
    expect(isEditableTarget(null)).toBe(false);
  });

  it('handles a non-element target such as window', () => {
    expect(isEditableTarget(window)).toBe(false);
  });
});

describe('hasPlatformModifier', () => {
  const press = (init: KeyboardEventInit): KeyboardEvent => new KeyboardEvent('keydown', init);

  it('accepts the platform modifier', () => {
    expect(hasPlatformModifier(press(isMac ? { metaKey: true } : { ctrlKey: true }))).toBe(true);
  });

  it('rejects the other platform modifier', () => {
    expect(hasPlatformModifier(press(isMac ? { ctrlKey: true } : { metaKey: true }))).toBe(false);
  });

  it('rejects an unmodified key', () => {
    expect(hasPlatformModifier(press({}))).toBe(false);
  });

  it.each([{ altKey: true }, { shiftKey: true }])('rejects %o alone', (init) => {
    expect(hasPlatformModifier(press(init))).toBe(false);
  });
});

describe('PLATFORM_MODIFIER_LABEL', () => {
  it('matches the modifier the handlers actually check', () => {
    expect(PLATFORM_MODIFIER_LABEL).toBe(isMac ? '⌘' : 'Ctrl+');
  });
});
