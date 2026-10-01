/**
 * Colour maths for the contrast gates.
 *
 * WCAG contrast is a ratio of relative luminance alone, so it cannot say
 * whether a hover differs visibly from rest -- two fills can both pass AA and
 * be indistinguishable. OKLab ΔE measures that second axis. Shared by the
 * token test and the browser interaction-state test.
 */

/** An sRGB colour with channels in 0-255 and alpha in 0-1. */
interface Rgba {
  r: number;
  g: number;
  b: number;
  a: number;
}

/** Parses `#rrggbb` and the `rgb()`/`rgba()` strings getComputedStyle returns. */
export const parseColor = (value: string): Rgba => {
  const hex = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(value.trim());
  if (hex) {
    const [, r = '', g = '', b = ''] = hex;
    return { r: parseInt(r, 16), g: parseInt(g, 16), b: parseInt(b, 16), a: 1 };
  }
  const rgb =
    /^rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:\s*[,/]\s*([\d.]+%?))?\s*\)$/i.exec(
      value.trim()
    );
  if (rgb) {
    const [, r = '0', g = '0', b = '0', a] = rgb;
    const alpha = a === undefined ? 1 : a.endsWith('%') ? parseFloat(a) / 100 : parseFloat(a);
    return { r: parseFloat(r), g: parseFloat(g), b: parseFloat(b), a: alpha };
  }
  throw new Error(`Unsupported colour: ${value}`);
};

const toLinear = (channel: number): number => {
  const c = channel / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
};

const relativeLuminance = ({ r, g, b }: Rgba): number =>
  0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);

/** WCAG 2.x contrast ratio between two opaque colours. */
export const contrastRatio = (a: Rgba, b: Rgba): number => {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
};

const toOklab = ({ r, g, b }: Rgba): [number, number, number] => {
  const lr = toLinear(r);
  const lg = toLinear(g);
  const lb = toLinear(b);
  const l = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb);
  const m = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb);
  const s = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb);
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ];
};

/** Perceptual distance between two opaque colours (OKLab Euclidean ΔE). */
export const deltaE = (a: Rgba, b: Rgba): number => {
  const [l1, a1, b1] = toOklab(a);
  const [l2, a2, b2] = toOklab(b);
  return Math.hypot(l1 - l2, a1 - a2, b1 - b2);
};

/**
 * Floor for a hover background change someone can actually see. Calibrated against hovers that read clearly (#f9fafb ->
 * #e5e7eb is 0.057) and ones that do not (#f9fafb -> #f3f4f6 is 0.018).
 */
export const HOVER_BACKGROUND_MIN_DELTA_E = 0.035;

/** WCAG AA for normal-size text. */
export const AA_TEXT_CONTRAST = 4.5;
