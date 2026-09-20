import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FlashcardStatsPanel } from './FlashcardStatsPanel';
import { ADAPTIVE_CONFIG } from '../../constants/adaptive';
import { Answer } from '../../types';
import { renderWithRouter } from '../../test/test-utils';

const answer = (isCorrect: boolean): Answer => ({
  characterIndex: 0,
  submittedPinyin: 'wo',
  correctPinyin: 'wǒ',
  simplified: '我',
  traditional: '我',
  english: 'I',
  isCorrect,
});

const base = {
  adaptiveRange: ADAPTIVE_CONFIG.INITIAL_RANGE,
  correctAnswers: 0,
  totalSeen: 0,
  allAnswers: [] as Answer[],
};

describe('FlashcardStatsPanel', () => {
  it('shows the answer counter without a rate before anything is answered', () => {
    renderWithRouter(<FlashcardStatsPanel {...base} />);

    expect(screen.getByTestId('stat-answers')).toHaveTextContent('0 / 0');
    expect(screen.getByTestId('stat-recent-success-rate')).toHaveTextContent('-');
  });

  it('shows the overall rate once there are answers', () => {
    renderWithRouter(<FlashcardStatsPanel {...base} correctAnswers={3} totalSeen={4} />);

    expect(screen.getByTestId('stat-answers')).toHaveTextContent('3 / 4');
    expect(screen.getByTestId('stat-answers')).toHaveTextContent('75%');
  });

  it('computes the recent rate from the rolling window only', () => {
    // 20 answers: the first 10 wrong, the last 10 right. Only the last 10
    // count, so the recent rate is 100% while the overall rate is 50%.
    const allAnswers = [
      ...Array.from({ length: 10 }, () => answer(false)),
      ...Array.from({ length: 10 }, () => answer(true)),
    ];

    renderWithRouter(
      <FlashcardStatsPanel {...base} correctAnswers={10} totalSeen={20} allAnswers={allAnswers} />
    );

    expect(screen.getByTestId('stat-recent-success-rate')).toHaveTextContent('100%');
    expect(screen.getByTestId('stat-answers')).toHaveTextContent('50%');
  });

  it('exposes the range as a focusable control with a descriptive name', () => {
    renderWithRouter(<FlashcardStatsPanel {...base} adaptiveRange={140} />);

    expect(screen.getByTestId('adaptive-range')).toHaveTextContent('1-140');
    expect(screen.getByRole('button', { name: /Character range 1 to 140/ })).toBeInTheDocument();
  });

  it('hides the reset button when there is nothing to reset', () => {
    renderWithRouter(<FlashcardStatsPanel {...base} />);

    expect(screen.queryByRole('button', { name: 'Reset' })).not.toBeInTheDocument();
  });

  it('asks for confirmation before resetting, and does not reset on cancel', async () => {
    const user = userEvent.setup();
    const onReset = vi.fn();
    renderWithRouter(<FlashcardStatsPanel {...base} onReset={onReset} />);

    await user.click(screen.getByRole('button', { name: 'Reset' }));
    expect(screen.getByRole('dialog')).toHaveTextContent('Reset Statistics?');

    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(onReset).not.toHaveBeenCalled();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('resets on confirm', async () => {
    const user = userEvent.setup();
    const onReset = vi.fn();
    renderWithRouter(<FlashcardStatsPanel {...base} onReset={onReset} />);

    await user.click(screen.getByRole('button', { name: 'Reset' }));
    await user.click(screen.getByRole('button', { name: 'Confirm Reset' }));

    expect(onReset).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
