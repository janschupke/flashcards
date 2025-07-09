import React from 'react';
import { ScoreDisplayProps } from '../types';
import styled from 'styled-components';

const ScoreContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 1rem 0;
  padding: 1rem;
  background-color: #f8f9fa;
  border-radius: 0.5rem;
  border: 1px solid #e9ecef;
`;

const ScoreTitle = styled.h3`
  margin: 0 0 0.5rem 0;
  font-size: 1.125rem;
  color: #495057;
  text-align: center;
`;

const ScoreGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  width: 100%;
  max-width: 300px;
`;

const ScoreItem = styled.div`
  text-align: center;
  padding: 0.5rem;
  background-color: white;
  border-radius: 0.375rem;
  border: 1px solid #dee2e6;
`;

const ScoreLabel = styled.div`
  font-size: 0.75rem;
  color: #6c757d;
  text-transform: uppercase;
  font-weight: 600;
  margin-bottom: 0.25rem;
`;

const ScoreValue = styled.div<{ highlight?: boolean }>`
  font-size: 1.25rem;
  font-weight: 700;
  color: ${props => props.highlight ? '#28a745' : '#495057'};
`;

const PercentageBar = styled.div`
  width: 100%;
  height: 0.5rem;
  background-color: #e9ecef;
  border-radius: 0.25rem;
  overflow: hidden;
  margin-top: 0.5rem;
`;

const PercentageFill = styled.div<{ percentage: number }>`
  height: 100%;
  background-color: ${props => {
    if (props.percentage >= 80) return '#28a745';
    if (props.percentage >= 60) return '#ffc107';
    return '#dc3545';
  }};
  width: ${props => Math.min(props.percentage, 100)}%;
  transition: width 0.3s ease-in-out;
`;

const PerformanceMessage = styled.div<{ percentage: number }>`
  font-size: 0.875rem;
  color: ${props => {
    if (props.percentage >= 80) return '#28a745';
    if (props.percentage >= 60) return '#856404';
    return '#dc3545';
  }};
  text-align: center;
  margin-top: 0.5rem;
  font-weight: 500;
`;

export const ScoreDisplay: React.FC<ScoreDisplayProps> = ({
  correctAnswers,
  totalAttempted,
  percentage,
}) => {
  const getPerformanceMessage = () => {
    if (totalAttempted === 0) return 'Start practicing to see your score!';
    if (percentage >= 90) return 'Excellent! Keep it up!';
    if (percentage >= 80) return 'Great job! You\'re doing well!';
    if (percentage >= 60) return 'Good progress! Keep practicing!';
    return 'Keep practicing! You\'ll improve!';
  };

  return (
    <ScoreContainer>
      <ScoreTitle>Pinyin Score</ScoreTitle>
      <ScoreGrid>
        <ScoreItem>
          <ScoreLabel>Correct</ScoreLabel>
          <ScoreValue highlight>{correctAnswers}</ScoreValue>
        </ScoreItem>
        <ScoreItem>
          <ScoreLabel>Attempted</ScoreLabel>
          <ScoreValue>{totalAttempted}</ScoreValue>
        </ScoreItem>
        <ScoreItem>
          <ScoreLabel>Accuracy</ScoreLabel>
          <ScoreValue>{percentage.toFixed(1)}%</ScoreValue>
        </ScoreItem>
      </ScoreGrid>
      {totalAttempted > 0 ? (
        <>
          <PercentageBar>
            <PercentageFill percentage={percentage} />
          </PercentageBar>
          <PerformanceMessage percentage={percentage}>
            {getPerformanceMessage()}
          </PerformanceMessage>
        </>
      ) : (
        <PerformanceMessage percentage={percentage}>
          {getPerformanceMessage()}
        </PerformanceMessage>
      )}
    </ScoreContainer>
  );
}; 
