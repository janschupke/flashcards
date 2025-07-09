import React, { useState } from 'react';
import styled from 'styled-components';
import { IncorrectAnswer } from '../types';

interface IncorrectAnswersProps {
  incorrectAnswers: IncorrectAnswer[];
}

const Container = styled.div`
  margin-top: 0;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  padding: 12px 0;
  user-select: none;
  
  &:hover {
    opacity: 0.8;
  }
`;

const Title = styled.h3`
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #a0aec0;
`;

const ToggleIcon = styled.span<{ $isExpanded: boolean }>`
  font-size: 1.2rem;
  color: #a0aec0;
  transition: transform 0.2s ease;
  transform: rotate(${props => props.$isExpanded ? '90deg' : '0deg'});
`;

const Content = styled.div<{ $isExpanded: boolean }>`
  max-height: ${props => props.$isExpanded ? '500px' : '0'};
  overflow: hidden;
  transition: max-height 0.3s ease, opacity 0.3s ease;
  opacity: ${props => props.$isExpanded ? '1' : '0'};
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 8px;
`;

const Th = styled.th`
  color: #a0aec0;
  font-size: 0.95rem;
  font-weight: 600;
  padding: 8px 6px;
  border-bottom: 1px solid #4a5568;
  text-align: left;
`;

const Td = styled.td`
  color: #a0aec0;
  font-size: 0.95rem;
  padding: 8px 6px;
  border-bottom: 1px solid #2d3748;
  vertical-align: middle;
`;

const SubmittedTd = styled(Td)<{ $isCorrect: boolean }>`
  color: ${props => props.$isCorrect ? '#48bb78' : '#f56565'};
`;

const EmptyMessage = styled.div`
  text-align: center;
  color: #718096;
  font-style: italic;
  padding: 20px;
`;

export const IncorrectAnswers: React.FC<IncorrectAnswersProps> = ({
  incorrectAnswers,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <Container>
      <Header onClick={toggleExpanded}>
        <Title>
          Incorrect Answers ({incorrectAnswers.length})
        </Title>
        <ToggleIcon $isExpanded={isExpanded}>▶</ToggleIcon>
      </Header>
      <Content data-testid="incorrect-answers-content" $isExpanded={isExpanded}>
        {incorrectAnswers.length === 0 ? (
          <EmptyMessage>
            No incorrect answers yet. Keep practicing!
          </EmptyMessage>
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Simplified</Th>
                <Th>Traditional</Th>
                <Th>Pinyin</Th>
                <Th>Submitted</Th>
                <Th>English</Th>
              </tr>
            </thead>
            <tbody>
              {incorrectAnswers.map((answer, index) => (
                <tr key={index}>
                  <Td>{answer.chinese}</Td>
                  <Td>{answer.traditional ?? answer.chinese}</Td>
                  <Td>{answer.correctPinyin}</Td>
                  <SubmittedTd $isCorrect={false}>{answer.submittedPinyin}</SubmittedTd>
                  <Td>{answer.english}</Td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Content>
    </Container>
  );
}; 
