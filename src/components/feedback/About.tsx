import React from 'react';
import { Card } from '../common/Card';
import { CardPadding } from '../../types/components';
import { ADAPTIVE_CONFIG } from '../../constants/adaptive';
import { SUCCESS_RATE_THRESHOLDS } from '../../constants';
import { KEYBOARD_SHORTCUTS } from '../../types';
import { PLATFORM_MODIFIER_LABEL } from '../../utils/keyboardUtils';

export const About: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card padding={CardPadding.MD}>
        <h2 className="text-2xl font-bold text-text-primary mb-4">About This App</h2>
        <p className="text-text-secondary mb-4">
          This is an adaptive Chinese character learning application that helps you practice Pinyin,
          Simplified, and Traditional Chinese characters through interactive flashcards.
        </p>
        <p className="text-text-secondary mb-4">
          The app uses an intelligent adaptive learning system that tracks your performance and
          adjusts the difficulty to help you learn more effectively.
        </p>
        <p className="text-text-secondary">
          <a
            href="https://github.com/janschupke/flashcards"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:text-primary-hover underline"
          >
            View on GitHub
          </a>
        </p>
      </Card>

      <Card padding={CardPadding.MD}>
        <h3 className="text-xl font-bold text-text-primary mb-3">How to Use</h3>
        <div className="space-y-3 text-text-secondary">
          <div>
            <h4 className="font-semibold text-text-primary mb-1">Display Modes</h4>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>
                <strong>全部 (Both) - F1:</strong> Display both simplified and traditional
                characters.
              </li>
              <li>
                <strong>简体 (Simplified) - F2:</strong> Display only the simplified character.
              </li>
              <li>
                <strong>繁体 (Traditional) - F3:</strong> Display only the traditional character.
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-text-primary mb-1">Hints</h4>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>
                <strong>
                  Pinyin Hint ({PLATFORM_MODIFIER_LABEL}
                  {KEYBOARD_SHORTCUTS.PINYIN}):
                </strong>{' '}
                Reveal the Pinyin pronunciation
              </li>
              <li>
                <strong>
                  English Hint ({PLATFORM_MODIFIER_LABEL}
                  {KEYBOARD_SHORTCUTS.ENGLISH}):
                </strong>{' '}
                Reveal the English translation
              </li>
              <li>
                The hints use a modifier so that <strong>.</strong> and <strong>/</strong> stay
                typable — the answer field keeps focus at all times.
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-text-primary mb-1">Navigation</h4>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>
                <strong>Enter:</strong> Submit your answer and move to the next character
              </li>
              <li>
                <strong>F1/F2/F3:</strong> Switch between display modes (changes what characters are
                shown)
              </li>
              <li>
                <strong>Left/Right Arrow:</strong> Step to the previous or next display mode. Does
                not wrap around, and is ignored while a text field has focus so the arrows still
                move the caret.
              </li>
            </ul>
          </div>
        </div>
      </Card>

      <Card padding={CardPadding.MD}>
        <h3 className="text-xl font-bold text-text-primary mb-3">Adaptive Learning System</h3>
        <div className="space-y-3 text-text-secondary">
          <div>
            <h4 className="font-semibold text-text-primary mb-1">Character Selection</h4>
            <p className="mb-2">
              Every character in your range falls into one of three tiers, and each tier gets a
              fixed share of the draws. Characters you are struggling with rank above ones you have
              never seen, which in turn rank above ones you have mastered.
            </p>
            <p className="mb-2 font-semibold text-text-primary">Tiers and their share of draws:</p>
            <ul className="list-disc list-inside space-y-1 ml-2 mb-3">
              <li>
                <strong>Struggling ({ADAPTIVE_CONFIG.TIER_SHARES.STRUGGLING * 100}%):</strong> below{' '}
                {ADAPTIVE_CONFIG.UNSUCCESSFUL_THRESHOLD * 100}% success, with at least one attempt
              </li>
              <li>
                <strong>Untested ({ADAPTIVE_CONFIG.TIER_SHARES.UNTESTED * 100}%):</strong> never
                attempted
              </li>
              <li>
                <strong>Mastered ({ADAPTIVE_CONFIG.TIER_SHARES.MASTERED * 100}%):</strong>{' '}
                {ADAPTIVE_CONFIG.UNSUCCESSFUL_THRESHOLD * 100}% success or better
              </li>
            </ul>
            <p className="mb-2 font-semibold text-text-primary">Within a tier:</p>
            <ul className="list-disc list-inside space-y-1 ml-2 mb-3">
              <li>
                Attempted characters are weighted by (1 − successRate)
                <sup>{ADAPTIVE_CONFIG.SUCCESS_PENALTY_EXPONENT}</sup> ÷ (1 +{' '}
                {ADAPTIVE_CONFIG.ATTEMPT_PENALTY_FACTOR} × attempts), so a worse and less-practised
                character ranks higher than a worse but heavily-drilled one.
              </li>
              <li>Untested characters are drawn uniformly.</li>
              <li>
                {ADAPTIVE_CONFIG.TIER_UNIFORM_BLEND * 100}% of each tier&apos;s share is spread
                evenly across its members, so no single character can take over its tier.
              </li>
            </ul>
            <p className="mb-2 font-semibold text-text-primary">Things worth knowing:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>
                The shares are a budget, not a guarantee. When a tier is empty its share is split
                across the tiers that are not — so once every character in range is mastered,
                mastered characters get 100% of the draws.
              </li>
              <li>
                The character you just answered is never shown twice in a row, as long as there is
                anything else in range.
              </li>
              <li>
                Adaptive selection activates as soon as any character in your range has at least 1
                attempt. Before that, selection is uniformly random.
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-text-primary mb-1">Range Expansion</h4>
            <p className="mb-2">
              The app starts with the first {ADAPTIVE_CONFIG.INITIAL_RANGE} characters and
              automatically expands your practice range as you improve.
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Starting range: {ADAPTIVE_CONFIG.INITIAL_RANGE} characters</li>
              <li>
                Expansion criteria: {ADAPTIVE_CONFIG.SUCCESS_THRESHOLD * 100}% success across your
                last {ADAPTIVE_CONFIG.EXPANSION_INTERVAL} answers
              </li>
              <li>
                Expansion check: after every answer, once you have{' '}
                {ADAPTIVE_CONFIG.EXPANSION_INTERVAL} of them — it is a rolling window, not a
                milestone. The window restarts after each expansion.
              </li>
              <li>
                Expansion amount: +{ADAPTIVE_CONFIG.EXPANSION_AMOUNT} characters per expansion, up
                to all 1,500
              </li>
              <li>
                The range only ever grows. Dropping below {ADAPTIVE_CONFIG.SUCCESS_THRESHOLD * 100}%
                will not shrink it back.
              </li>
              <li>Your progress toward the next expansion survives a page reload.</li>
            </ul>
          </div>
        </div>
      </Card>

      <Card padding={CardPadding.MD}>
        <h3 className="text-xl font-bold text-text-primary mb-3">Statistics</h3>
        <div className="space-y-2 text-text-secondary">
          <p>The app tracks your performance for each character, including:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Number of correct answers</li>
            <li>Total attempts</li>
            <li>Success rate percentage</li>
          </ul>
          <p className="mt-2">Statistics are color-coded:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>
              <span className="text-success">
                Green (≥{SUCCESS_RATE_THRESHOLDS.MASTERED * 100}%):
              </span>{' '}
              Mastered
            </li>
            <li>
              <span className="text-warning">
                Yellow ({SUCCESS_RATE_THRESHOLDS.LEARNING * 100}-
                {SUCCESS_RATE_THRESHOLDS.MASTERED * 100 - 1}%):
              </span>{' '}
              Learning
            </li>
            <li>
              <span className="text-error">
                Red (&lt;{SUCCESS_RATE_THRESHOLDS.LEARNING * 100}%):
              </span>{' '}
              Struggling
            </li>
          </ul>
        </div>
      </Card>
    </div>
  );
};
