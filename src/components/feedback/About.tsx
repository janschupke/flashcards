import React from 'react';
import { Card } from '../common/Card';
import { CardPadding } from '../../types/components';
import { ADAPTIVE_CONFIG } from '../../constants/adaptive';
import { SUCCESS_RATE_THRESHOLDS } from '../../constants';

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
              The app uses a progressive weighted selection algorithm that prioritizes characters
              you&apos;re struggling with or that are new. The system guarantees that 80% of
              selections come from unsuccessful or new characters, with progressive weighting that
              ensures all characters get practice.
            </p>
            <p className="mb-2 font-semibold text-text-primary">Selection Distribution:</p>
            <ul className="list-disc list-inside space-y-1 ml-2 mb-3">
              <li>
                <strong>80% Unsuccessful or New:</strong> Characters with low success rates or that
                are new to your practice range get 80% of all selections
              </li>
              <li>
                <strong>20% Successful:</strong> Characters with higher success rates get the
                remaining 20% of selections
              </li>
            </ul>
            <p className="mb-2 font-semibold text-text-primary">Progressive Weighting:</p>
            <ul className="list-disc list-inside space-y-1 ml-2 mb-3">
              <li>
                <strong>Untested characters:</strong> Highest priority (weight = 1.0) - ensures all
                characters in range get shown
              </li>
              <li>
                <strong>Unsuccessful characters:</strong> Weight = (1 - successRate)² ×
                attempt_penalty
                <ul className="list-disc list-inside space-y-1 ml-4 mt-1">
                  <li>Lower success rate = exponentially higher weight</li>
                  <li>
                    Fewer attempts = higher weight (prioritizes characters needing more practice)
                  </li>
                  <li>Prevents over-showing characters with many failed attempts</li>
                </ul>
              </li>
              <li>
                <strong>Successful characters:</strong> Lower weight, further reduced by high
                success rate and many attempts
                <ul className="list-disc list-inside space-y-1 ml-4 mt-1">
                  <li>Prevents repeatedly showing mastered characters</li>
                  <li>Ensures variety in practice</li>
                </ul>
              </li>
            </ul>
            <p className="mb-2 font-semibold text-text-primary">Priority Categories:</p>
            <ul className="list-disc list-inside space-y-1 ml-2 mb-3">
              <li>
                <strong>
                  Unsuccessful/Untested (&lt;{ADAPTIVE_CONFIG.UNSUCCESSFUL_THRESHOLD * 100}% success
                  or 0 attempts):
                </strong>{' '}
                80% of selections - progressive weighting prioritizes low success and low attempts
              </li>
              <li>
                <strong>
                  Successful (≥{ADAPTIVE_CONFIG.UNSUCCESSFUL_THRESHOLD * 100}% success):
                </strong>{' '}
                20% of selections - reduced weight for high success with many attempts
              </li>
            </ul>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>
                Adaptive selection activates as soon as any character in your range has at least 1
                attempt. If no characters have been attempted yet, selection falls back to random.
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
                Expansion criteria: {ADAPTIVE_CONFIG.SUCCESS_THRESHOLD * 100}% success rate in your
                last {ADAPTIVE_CONFIG.EXPANSION_INTERVAL} answers
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
                Red (&lt;{SUCCESS_RATE_THRESHOLDS.STRUGGLING * 100}%):
              </span>{' '}
              Struggling
            </li>
          </ul>
        </div>
      </Card>
    </div>
  );
};
