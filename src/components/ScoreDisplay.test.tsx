import React from 'react';
import { render, screen } from '@testing-library/react';
import { ScoreDisplay } from './ScoreDisplay';

describe('ScoreDisplay', () => {
  it('should render score title', () => {
    render(
      <ScoreDisplay
        correctAnswers={5}
        totalAttempted={10}
        percentage={50}
      />
    );

    expect(screen.getByText('Pinyin Score')).toBeInTheDocument();
  });

  it('should display correct answers count', () => {
    render(
      <ScoreDisplay
        correctAnswers={7}
        totalAttempted={10}
        percentage={70}
      />
    );

    expect(screen.getByText('7')).toBeInTheDocument();
  });

  it('should display total attempted count', () => {
    render(
      <ScoreDisplay
        correctAnswers={5}
        totalAttempted={8}
        percentage={62.5}
      />
    );

    expect(screen.getByText('8')).toBeInTheDocument();
  });

  it('should display percentage with one decimal place', () => {
    render(
      <ScoreDisplay
        correctAnswers={3}
        totalAttempted={4}
        percentage={75}
      />
    );

    expect(screen.getByText('75.0%')).toBeInTheDocument();
  });

  it('should show start message when no attempts made', () => {
    render(
      <ScoreDisplay
        correctAnswers={0}
        totalAttempted={0}
        percentage={0}
      />
    );

    expect(screen.getByText('Start practicing to see your score!')).toBeInTheDocument();
  });

  it('should show excellent message for 90%+ accuracy', () => {
    render(
      <ScoreDisplay
        correctAnswers={9}
        totalAttempted={10}
        percentage={90}
      />
    );

    expect(screen.getByText('Excellent! Keep it up!')).toBeInTheDocument();
  });

  it('should show great job message for 80%+ accuracy', () => {
    render(
      <ScoreDisplay
        correctAnswers={8}
        totalAttempted={10}
        percentage={80}
      />
    );

    expect(screen.getByText('Great job! You\'re doing well!')).toBeInTheDocument();
  });

  it('should show good progress message for 60%+ accuracy', () => {
    render(
      <ScoreDisplay
        correctAnswers={6}
        totalAttempted={10}
        percentage={60}
      />
    );

    expect(screen.getByText('Good progress! Keep practicing!')).toBeInTheDocument();
  });

  it('should show keep practicing message for <60% accuracy', () => {
    render(
      <ScoreDisplay
        correctAnswers={4}
        totalAttempted={10}
        percentage={40}
      />
    );

    expect(screen.getByText('Keep practicing! You\'ll improve!')).toBeInTheDocument();
  });

  it('should display score labels correctly', () => {
    render(
      <ScoreDisplay
        correctAnswers={5}
        totalAttempted={10}
        percentage={50}
      />
    );

    expect(screen.getByText('Correct')).toBeInTheDocument();
    expect(screen.getByText('Attempted')).toBeInTheDocument();
    expect(screen.getByText('Accuracy')).toBeInTheDocument();
  });

  it('should not show percentage bar when no attempts made', () => {
    const { container } = render(
      <ScoreDisplay
        correctAnswers={0}
        totalAttempted={0}
        percentage={0}
      />
    );

    // The percentage bar should not be rendered
    expect(container.querySelector('[style*="width"]')).not.toBeInTheDocument();
  });

  it('should show percentage bar when attempts made', () => {
    render(
      <ScoreDisplay
        correctAnswers={5}
        totalAttempted={10}
        percentage={50}
      />
    );

    // The percentage bar should be rendered
    expect(screen.getByText('Keep practicing! You\'ll improve!')).toBeInTheDocument();
  });
}); 
