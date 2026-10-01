import type { Result } from 'axe-core';

/**
 * Renders axe violations as a readable failure message. Shared by the jsdom
 * tests and the Playwright specs, so both report in the same shape.
 */
export const formatViolations = (violations: Result[]): string =>
  violations
    .map((violation) => {
      const targets = violation.nodes
        .map((node) => `      ${String(node.target)}`)
        .slice(0, 5)
        .join('\n');
      return `  [${violation.impact ?? 'unknown'}] ${violation.id}: ${violation.help}\n${targets}`;
    })
    .join('\n');
