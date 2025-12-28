import React from 'react';
import { Card } from '../common/Card';
import { CardPadding } from '../../types/components';
import { ADAPTIVE_CONFIG } from '../../constants/adaptive';

export const About: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card padding={CardPadding.MD}>
        <h2 className="text-2xl font-bold text-text-primary mb-4">About This App</h2>
        <p className="text-text-secondary mb-4">
          This is an adaptive Chinese character learning application that helps you practice Pinyin,
          Simplified, and Traditional Chinese characters through interactive flashcards.
        </p>
        <p className="text-text-secondary">
          The app uses an intelligent adaptive learning system that tracks your performance and
          adjusts the difficulty to help you learn more effectively.
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
                characters. Always type the pinyin pronunciation.
              </li>
              <li>
                <strong>简体 (Simplified) - F2:</strong> Display only the simplified character.
                Always type the pinyin pronunciation.
              </li>
              <li>
                <strong>繁体 (Traditional) - F3:</strong> Display only the traditional character.
                Always type the pinyin pronunciation.
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-text-primary mb-1">Input</h4>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>
                <strong>Always type pinyin:</strong> Regardless of which display mode you&apos;re
                in, you always type the pinyin pronunciation of the character
              </li>
              <li>
                <strong>Alternative inputs:</strong> You can type &apos;u&apos; or &apos;v&apos;
                instead of &apos;ü&apos; for convenience
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-text-primary mb-1">Hints</h4>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>
                <strong>Pinyin Hint (,):</strong> Reveal the Pinyin pronunciation
              </li>
              <li>
                <strong>English Hint (.):</strong> Reveal the English translation
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
              The app uses a priority-based selection algorithm that categorizes characters by their
              success rate and allocates selection probability accordingly. Characters you&apos;re
              struggling with get the highest priority.
            </p>
            <p className="mb-2 font-semibold text-text-primary">Priority Categories:</p>
            <ul className="list-disc list-inside space-y-1 ml-2 mb-3">
              <li>
                <strong>Low Success (0-{ADAPTIVE_CONFIG.LOW_SUCCESS_THRESHOLD * 100}%):</strong>{' '}
                Gets {ADAPTIVE_CONFIG.LOW_SUCCESS_PRIORITY * 100}% of selection probability -
                highest priority for characters you&apos;re struggling with
              </li>
              <li>
                <strong>Untested:</strong> Gets {ADAPTIVE_CONFIG.UNTESTED_PRIORITY * 100}% of
                selection probability - characters you haven&apos;t practiced yet
              </li>
              <li>
                <strong>
                  Medium Success ({ADAPTIVE_CONFIG.LOW_SUCCESS_THRESHOLD * 100}-
                  {ADAPTIVE_CONFIG.MEDIUM_SUCCESS_THRESHOLD * 100}%):
                </strong>{' '}
                Gets {ADAPTIVE_CONFIG.MEDIUM_SUCCESS_PRIORITY * 100}% of selection probability -
                weighted by inverse success rate
              </li>
              <li>
                <strong>
                  High Success ({ADAPTIVE_CONFIG.MEDIUM_SUCCESS_THRESHOLD * 100}-100%):
                </strong>{' '}
                Gets {ADAPTIVE_CONFIG.HIGH_SUCCESS_PRIORITY * 100}% of selection probability -
                lowest priority for characters you&apos;ve mastered
              </li>
            </ul>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Minimum selection probability: {ADAPTIVE_CONFIG.MIN_SELECTION_CHANCE * 100}%</li>
              <li>
                Maximum selection probability: {ADAPTIVE_CONFIG.MAX_SELECTION_CHANCE * 100}% (does
                not apply to low success entries)
              </li>
              <li>
                Adaptive selection activates after {ADAPTIVE_CONFIG.MIN_ATTEMPTS_FOR_ADAPTIVE}{' '}
                attempts, or immediately for characters with low success rates (even with just 1
                attempt)
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
              <li>Expansion check: Every {ADAPTIVE_CONFIG.EXPANSION_INTERVAL} answers</li>
              <li>
                Expansion criteria: {ADAPTIVE_CONFIG.SUCCESS_THRESHOLD * 100}% success rate with at
                least {ADAPTIVE_CONFIG.MIN_ATTEMPTS_FOR_EXPANSION} attempts
              </li>
              <li>
                Expansion amount: +{ADAPTIVE_CONFIG.EXPANSION_AMOUNT} characters per expansion
              </li>
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
              <span className="text-success">Green (≥80%):</span> Mastered
            </li>
            <li>
              <span className="text-warning">Yellow (50-79%):</span> Learning
            </li>
            <li>
              <span className="text-error">Red (&lt;50%):</span> Struggling
            </li>
          </ul>
        </div>
      </Card>

      <Card padding={CardPadding.MD}>
        <h3 className="text-xl font-bold text-text-primary mb-3">Tips for Learning</h3>
        <div className="space-y-2 text-text-secondary">
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Use hints when you&apos;re stuck, but try to answer without them when possible</li>
            <li>Focus on characters marked as &quot;struggling&quot; in the Statistics tab</li>
            <li>Practice regularly to maintain your progress</li>
            <li>Review the History tab to see your recent answers</li>
            <li>Use the Reset button if you want to start fresh (this clears all data)</li>
          </ul>
        </div>
      </Card>
    </div>
  );
};
