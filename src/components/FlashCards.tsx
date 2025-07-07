import React, { useState } from 'react';
import styled from "styled-components";
import data from '../output.json';

const StyledContainer = styled.div`
  font-size: 24px;
  text-align: center;
`;

const StyledBig = styled.div`
  font-size: 64px;
`;

export const FlashCards = () => {
  const [limit, setLimit] = useState(50);
  const [current, setCurrent] = useState(0);
  const [hint, setHint] = useState(0);

  const getNext = () => {
    const min = 0;
    const next = Math.floor(Math.random() * (limit - min + 1) + min);
    setCurrent(next);
    toggleHint(0);
  };

  const toggleHint = (newHint: number) => {
    const result = hint === newHint ? 0 : newHint;
    setHint(result);
  }

  const adjustSetup = (limit: string) => {
    // TODO: number type check
    setLimit(+limit);
  }

  return (
    <StyledContainer>
      <div>
        <input value={limit} onChange={e => adjustSetup(e.target.value)} placeholder="Limit" />
      </div>
      <div>
        <StyledBig>
          {data[current].chinese}
        </StyledBig>
        <div>
          {hint === 0 && '-'}
          {hint === 1 && data[current].pinyin}
          {hint === 2 && data[current].english}
        </div>
      </div>
      <div>
        <button onClick={() => toggleHint(1)}>Pinyin</button>
        <button onClick={() => toggleHint(2)}>English</button>
        <button onClick={getNext}>Next</button>
      </div>
    </StyledContainer>
  );
};
