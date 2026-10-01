// @vitest-environment node
import { readFileSync } from 'node:fs';
import { describe, it, expect } from 'vitest';
import {
  AA_TEXT_CONTRAST,
  HOVER_BACKGROUND_MIN_DELTA_E,
  contrastRatio,
  deltaE,
  parseColor,
} from './color';

/**
 * Token-level contrast gate.
 *
 * The browser tests check what renders; this checks the palette itself, so a
 * token edit that breaks a pairing fails `npm test` without a browser. It
 * reads the @theme block directly, so it cannot drift from the CSS.
 */
const css = readFileSync(new URL('../index.css', import.meta.url), 'utf8');

const tokens = new Map(
  [...css.matchAll(/--color-([\w-]+):\s*(#[0-9a-f]{6})\s*;/gi)].map(
    ([, name = '', value = '']) => [name, value] as const
  )
);

const token = (name: string): string => {
  const value = tokens.get(name);
  if (value === undefined) throw new Error(`No hex token --color-${name} in index.css`);
  return value;
};

describe('colour maths', () => {
  it('rates black on white at 21:1 and equal colours at 1:1', () => {
    expect(contrastRatio(parseColor('#000000'), parseColor('#ffffff'))).toBeCloseTo(21, 5);
    expect(contrastRatio(parseColor('#dc2626'), parseColor('#dc2626'))).toBeCloseTo(1, 5);
  });

  it('measures zero distance between identical colours', () => {
    expect(deltaE(parseColor('#f9fafb'), parseColor('rgb(249, 250, 251)'))).toBeCloseTo(0, 6);
  });

  it('parses the alpha forms getComputedStyle returns', () => {
    expect(parseColor('rgba(0, 0, 0, 0.2)').a).toBeCloseTo(0.2);
    expect(parseColor('rgb(0 0 0 / 20%)').a).toBeCloseTo(0.2);
  });
});

describe('design tokens', () => {
  // Neutral text labels the controls, so it must hold on a hovered surface too.
  // Status and link colours only appear outside hoverable controls, on the
  // page and panel surfaces; the browser hover test catches it if that changes.
  const pageSurfaces = ['surface-primary', 'surface-secondary'];
  const neutralTexts = ['text-primary', 'text-secondary', 'text-tertiary'];
  const accentTexts = ['success', 'error', 'warning', 'accent', 'primary', 'primary-hover'];
  const textPairs = [
    ...neutralTexts.flatMap((text) =>
      [...pageSurfaces, 'surface-hover'].map((surface) => [text, surface] as const)
    ),
    ...accentTexts.flatMap((text) => pageSurfaces.map((surface) => [text, surface] as const)),
  ];

  it.each(textPairs)('%s on %s clears AA', (text, surface) => {
    expect(contrastRatio(parseColor(token(text)), parseColor(token(surface)))).toBeGreaterThan(
      AA_TEXT_CONTRAST
    );
  });

  // A disabled control never hovers; its text sits on the page surface only.
  it('text-disabled on surface-primary clears AA', () => {
    expect(
      contrastRatio(parseColor(token('text-disabled')), parseColor(token('surface-primary')))
    ).toBeGreaterThan(AA_TEXT_CONTRAST);
  });

  // Inverse text must hold on a fill in every state, not only at rest.
  const fills = [
    ['text-on-primary', 'primary'],
    ['text-on-primary', 'primary-hover'],
    ['text-on-primary', 'primary-active'],
    ['text-on-error', 'error'],
    ['text-on-error', 'error-hover'],
    ['text-on-error', 'error-active'],
    ['text-on-success', 'success'],
    ['text-on-warning', 'warning'],
  ] as const;

  it.each(fills)('%s on %s clears AA', (text, fill) => {
    expect(contrastRatio(parseColor(token(text)), parseColor(token(fill)))).toBeGreaterThan(
      AA_TEXT_CONTRAST
    );
  });

  // A hover has to be visible, which contrast ratio cannot measure.
  const hovers = [
    ['surface-primary', 'surface-hover'],
    ['surface-secondary', 'surface-hover'],
    ['surface-hover', 'surface-active'],
    ['primary', 'primary-hover'],
    ['error', 'error-hover'],
  ] as const;

  it.each(hovers)('%s -> %s is a visible change', (rest, hover) => {
    expect(deltaE(parseColor(token(rest)), parseColor(token(hover)))).toBeGreaterThan(
      HOVER_BACKGROUND_MIN_DELTA_E
    );
  });
});
