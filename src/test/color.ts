/**
 * Colour maths for the contrast gates.
 *
 * WCAG contrast is a ratio of relative luminance alone, so it cannot say
 * whether a hover differs visibly from rest -- two fills can both pass AA and
 * be indistinguishable. OKLab ΔE measures that second axis. Shared by the
 * token test and the browser interaction-state test.
 */

/** An sRGB colour with channels in 0-255 and alpha in 0-1. */
export interface Rgba {
  r: number;
  g: number;
  b: number;
  a: number;
}

const parseAlpha = (a: string | undefined): number =>
  a === undefined ? 1 : a.endsWith('%') ? parseFloat(a) / 100 : parseFloat(a);

const fromLinear = (c: number): number => {
  const v = c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055;
  return Math.min(255, Math.max(0, v * 255));
};

/** OKLCH -> sRGB, clamped to gamut. */
const fromOklch = (l: number, c: number, h: number, alpha: number): Rgba => {
  const hr = (h * Math.PI) / 180;
  const a = c * Math.cos(hr);
  const b = c * Math.sin(hr);
  const l_ = (l + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m_ = (l - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s_ = (l - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return {
    r: fromLinear(4.0767416621 * l_ - 3.3077115913 * m_ + 0.2309699292 * s_),
    g: fromLinear(-1.2684380046 * l_ + 2.6097574011 * m_ - 0.3413193965 * s_),
    b: fromLinear(-0.0041960863 * l_ - 0.7034186147 * m_ + 1.707614701 * s_),
    a: alpha,
  };
};

/**
 * Parses `#rrggbb` and what getComputedStyle returns: `rgb()`/`rgba()`, and
 * `oklch()`, which Chromium keeps as-is for tokens authored in it.
 */
export const parseColor = (value: string): Rgba => {
  const oklch =
    /^oklch\(\s*([\d.]+)(%?)\s+([\d.]+)\s+([\d.]+|none)(?:\s*\/\s*([\d.]+%?))?\s*\)$/i.exec(
      value.trim()
    );
  if (oklch) {
    const [, l = '0', percent, c = '0', h = '0', a] = oklch;
    const lightness = percent === '%' ? parseFloat(l) / 100 : parseFloat(l);
    return fromOklch(lightness, parseFloat(c), h === 'none' ? 0 : parseFloat(h), parseAlpha(a));
  }
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
    return { r: parseFloat(r), g: parseFloat(g), b: parseFloat(b), a: parseAlpha(a) };
  }
  throw new Error(`Unsupported colour: ${value}`);
};

/** Paints `top` over an opaque `bottom`. */
export const composite = (top: Rgba, bottom: Rgba): Rgba => ({
  r: top.r * top.a + bottom.r * (1 - top.a),
  g: top.g * top.a + bottom.g * (1 - top.a),
  b: top.b * top.a + bottom.b * (1 - top.a),
  a: 1,
});

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
 * Floors for a state change someone can actually see. A background change is
 * the usual hover signal; a text-colour change counts when the element has no
 * fill to change. Calibrated against hovers that read clearly (#f9fafb ->
 * #e5e7eb is 0.057) and ones that do not (#f9fafb -> #f3f4f6 is 0.018).
 */
export const HOVER_BACKGROUND_MIN_DELTA_E = 0.035;
export const HOVER_TEXT_MIN_DELTA_E = 0.05;

/** WCAG AA for normal-size text. */
export const AA_TEXT_CONTRAST = 4.5;
