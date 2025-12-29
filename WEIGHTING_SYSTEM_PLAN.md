# Weighting System Refactoring Plan

## Overview

This document outlines the plan to refactor the character selection weighting system to implement a simple, straightforward algorithm that ensures unsuccessful or new characters are selected 50% of the time, while maintaining proper prioritization of struggling characters.

## Goals

1. **Low success characters are highly prioritized** - Characters with low success rates get the highest priority
2. **New/untested characters have increased priority** - Characters that haven't been tested yet get increased priority, but never as high as unsuccessful characters
3. **Successful characters get lower priority** - Characters with high success rates get lower selection probability
4. **50% selection guarantee** - The system should select an unsuccessful or new character 50% of the time
5. **Simple, working algorithm** - Straightforward implementation that actually works in practice

## Current State

### Current Algorithm
The current system uses priority allocation based on success rate categories:

- **Low Success (0-30%)**: 65% allocation (doesn't work in practice)
- **Untested**: 15% allocation
- **Medium Success (30-70%)**: 15% allocation
- **High Success (70-100%)**: 5% allocation

### Current Issues
- The 65% allocation for low success doesn't actually result in 65% selection in practice
- Complex normalization and constraints break the intended distribution
- No explicit guarantee that unsuccessful/new characters get 50% selection
- Algorithm is too complex and doesn't work as intended

## Proposed State

### New Algorithm Design

Simple, straightforward two-phase approach:

1. **Phase 1: Categorize** - Split characters into two groups: unsuccessful/new vs successful
2. **Phase 2: Weight & Normalize** - Calculate weights within each group, then normalize to 50/50 split

### Character Categories

1. **Unsuccessful Characters** (highest priority)
   - Success rate < threshold (e.g., < 50%)
   - These get the highest priority

2. **New/Untested Characters** (medium-high priority)
   - Characters with 0 attempts (untested)
   - OR characters with very few attempts (e.g., ≤ 2 attempts)
   - Priority is higher than successful characters but lower than unsuccessful

3. **Successful Characters** (lower priority)
   - Success rate ≥ threshold (e.g., ≥ 50%)
   - These get lower selection probability

### Selection Probability Distribution

**Target Distribution:**
- **Unsuccessful OR New**: 50% combined
  - Within this 50%:
    - Unsuccessful characters weighted by `(1 - successRate)` (lower success = higher weight)
    - New/untested characters get fixed base weight (lower than unsuccessful max)
- **Successful**: 50%
  - Weighted by `(1 - successRate)` (lower success = higher weight)

### Implementation Strategy

#### Step 1: Simple Categorization

```typescript
interface CharacterGroups {
  unsuccessfulOrNew: number[];  // Low success OR untested
  successful: number[];          // High success rate
}
```

Categorization rules:
- **Untested** (0 attempts) → `unsuccessfulOrNew`
- **Unsuccessful** (success rate < threshold, e.g., < 50%) → `unsuccessfulOrNew`
- **Successful** (success rate ≥ threshold) → `successful`

#### Step 2: Calculate Weights Within Each Group

1. **Unsuccessful/New Group:**
   - For unsuccessful: weight = `(1 - successRate)`
   - For untested: weight = `NEW_CHARACTER_WEIGHT` (fixed, e.g., 0.8)
   - Normalize within group (sum to 1.0)

2. **Successful Group:**
   - Weight = `(1 - successRate)`
   - Normalize within group (sum to 1.0)

#### Step 3: Apply 50/50 Split

1. Multiply all weights in `unsuccessfulOrNew` group by 0.5
2. Multiply all weights in `successful` group by 0.5
3. Combine into final weight array

## Refactoring Steps

### Phase 1: Update Types and Constants

#### 1.1 Update `ADAPTIVE_CONFIG`
**File:** `src/constants/adaptive.ts`

**Replace priority allocation constants with simple selection constants:**
```typescript
export const ADAPTIVE_CONFIG = {
  // Selection algorithm
  MIN_ATTEMPTS_FOR_ADAPTIVE: 3,

  // Success rate threshold for categorization
  UNSUCCESSFUL_THRESHOLD: 0.5,  // <50% = unsuccessful (untested also in this group)

  // Weighting constants
  UNTESTED_WEIGHT: 0.8,  // Weight for untested characters (lower than max unsuccessful)
  SELECTION_SPLIT: 0.5,  // 50% for unsuccessful/untested, 50% for successful

  // Range expansion (unchanged)
  INITIAL_RANGE: 100,
  EXPANSION_INTERVAL: 10,
  EXPANSION_AMOUNT: 10,
  SUCCESS_THRESHOLD: 0.8,
  MIN_ATTEMPTS_FOR_EXPANSION: 10,

  // Storage limits
  MAX_HISTORY_ENTRIES: 100,
} as const;
```

**Remove old constants:**
- `LOW_SUCCESS_PRIORITY`
- `MEDIUM_SUCCESS_PRIORITY`
- `HIGH_SUCCESS_PRIORITY`
- `UNTESTED_PRIORITY`
- `LOW_SUCCESS_THRESHOLD`
- `MEDIUM_SUCCESS_THRESHOLD`
- `WEIGHT_MULTIPLIER`

### Phase 2: Refactor Core Selection Logic

#### 2.1 Add Helper Functions
**File:** `src/utils/adaptiveUtils.ts`

**Add helper functions for readability:**

#### 2.2 Add Helper Functions
**File:** `src/utils/adaptiveUtils.ts`

**Add these helper functions before `calculateCharacterWeights`:**

```typescript
// Helper: Categorize characters into groups
const categorizeCharacters = (
  characters: number[],
  performanceMap: Map<number, CharacterPerformance>
): { unsuccessfulOrUntested: number[]; successful: number[] } => {
  const unsuccessfulOrUntested: number[] = [];
  const successful: number[] = [];

  for (const charIndex of characters) {
    const perf = performanceMap.get(charIndex);
    const isUntested = !perf || perf.total === 0;
    const isUnsuccessful = perf && getSuccessRate(perf) < ADAPTIVE_CONFIG.UNSUCCESSFUL_THRESHOLD;

    if (isUntested || isUnsuccessful) {
      unsuccessfulOrUntested.push(charIndex);
    } else {
      successful.push(charIndex);
    }
  }

  return { unsuccessfulOrUntested, successful };
};

// Helper: Calculate base weight for a character
const getCharacterWeight = (
  perf: CharacterPerformance | undefined,
  isUntested: boolean
): number => {
  if (isUntested || !perf) {
    return ADAPTIVE_CONFIG.UNTESTED_WEIGHT;
  }
  const successRate = getSuccessRate(perf);
  return 1 - successRate;
};

// Helper: Calculate and normalize weights for a group
const calculateGroupWeights = (
  group: number[],
  performanceMap: Map<number, CharacterPerformance>,
  isUntestedGroup: boolean
): Map<number, number> => {
  const weights = new Map<number, number>();

  if (group.length === 0) {
    return weights;
  }

  // Calculate base weights
  const baseWeights = group.map((charIndex) => {
    const perf = performanceMap.get(charIndex);
    const isUntested = !perf || perf.total === 0;
    let weight = getCharacterWeight(perf, isUntested);

    // For successful group, ensure minimum weight
    if (!isUntestedGroup) {
      weight = Math.max(weight, 0.01);
    }

    return weight;
  });

  // Normalize within group
  const sum = baseWeights.reduce((a, b) => a + b, 0);
  const scaleFactor = sum > 0 ? ADAPTIVE_CONFIG.SELECTION_SPLIT / sum : ADAPTIVE_CONFIG.SELECTION_SPLIT / group.length;

  group.forEach((charIndex, index) => {
    const normalizedWeight = sum > 0 ? baseWeights[index]! * scaleFactor : ADAPTIVE_CONFIG.SELECTION_SPLIT / group.length;
    weights.set(charIndex, normalizedWeight);
  });

  return weights;
};

// Helper: Normalize weights to sum to exactly 1.0
const normalizeWeights = (
  weights: Map<number, number>,
  characters: number[]
): number[] => {
  const total = characters.reduce((sum, charIndex) => {
    return sum + (weights.get(charIndex) ?? 0);
  }, 0);

  if (total === 0) {
    // Fallback: equal weights
    const equalWeight = 1.0 / characters.length;
    return characters.map(() => equalWeight);
  }

  // Normalize to sum to exactly 1.0
  return characters.map((charIndex) => {
    return (weights.get(charIndex) ?? 0) / total;
  });
};
```

#### 2.3 Replace `calculateCharacterWeights` Function
**File:** `src/utils/adaptiveUtils.ts`

**Add helper to ensure weights sum to exactly 1.0:**
```typescript
const normalizeWeights = (
  weights: Map<number, number>,
  characters: number[]
): number[] => {
  const total = characters.reduce((sum, charIndex) => {
    return sum + (weights.get(charIndex) ?? 0);
  }, 0);

  if (total === 0) {
    // Fallback: equal weights
    const equalWeight = 1.0 / characters.length;
    return characters.map(() => equalWeight);
  }

  // Normalize to sum to exactly 1.0
  return characters.map((charIndex) => {
    return (weights.get(charIndex) ?? 0) / total;
  });
};
```

#### 2.3 Update `selectAdaptiveCharacter`
**File:** `src/utils/adaptiveUtils.ts`

**Update function to handle edge cases:**
```typescript
export const selectAdaptiveCharacter = (
  characters: number[],
  performance: CharacterPerformance[]
): number => {
  if (characters.length === 0) {
    throw new Error('Cannot select from empty character array');
  }

  // Early return for single character
  if (characters.length === 1) {
    return characters[0] ?? 0;
  }

  // Check if we have enough performance data
  const hasEnoughData = performance.some(
    (p) =>
      characters.includes(p.characterIndex) &&
      (p.total >= ADAPTIVE_CONFIG.MIN_ATTEMPTS_FOR_ADAPTIVE || p.total === 1)
  );

  // Fallback to random if not enough data
  if (!hasEnoughData) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    return characters[randomIndex] ?? characters[0] ?? 0;
  }

  // Calculate weights (normalized to sum to 1.0)
  const weights = calculateCharacterWeights(characters, performance);

  // Select using weighted random
  const random = Math.random();
  let cumulative = 0;

  for (let i = 0; i < characters.length; i++) {
    const weight = weights[i] ?? 0;
    cumulative += weight;
    // For last character, use >= to handle floating point precision
    if (i === characters.length - 1 || random <= cumulative) {
      return characters[i] ?? 0;
    }
  }

  // Fallback to last character (shouldn't happen after normalization)
  return characters[characters.length - 1] ?? 0;
};
```

### Phase 3: Update Tests

#### 3.1 Update `adaptiveUtils.test.ts`
**File:** `src/utils/adaptiveUtils.test.ts`

**New test cases:**
1. Test that unsuccessful or new characters are selected 50% of the time
2. Test that unsuccessful characters have higher weight than untested characters
3. Test that unsuccessful/new characters have higher priority than successful characters
4. Test categorization logic (unsuccessful/new vs successful)
5. Test weight calculation within each group
6. Test 50/50 split is maintained
7. Test edge cases (all unsuccessful, all successful, all untested)

**Example test:**
```typescript
it('should select unsuccessful or new characters 50% of the time', () => {
  const characters = [0, 1, 2, 3, 4, 5];
  const performance: CharacterPerformance[] = [
    { characterIndex: 0, correct: 0, total: 5 }, // 0% - unsuccessful
    { characterIndex: 1, correct: 1, total: 5 }, // 20% - unsuccessful
    { characterIndex: 2, correct: 0, total: 0 }, // 0 attempts - untested
    { characterIndex: 3, correct: 0, total: 0 }, // 0 attempts - untested
    { characterIndex: 4, correct: 8, total: 10 }, // 80% - successful
    { characterIndex: 5, correct: 9, total: 10 }, // 90% - successful
  ];

  const counts = runSelectionTest(characters, performance, TEST_ITERATIONS);
  const percentages = getPercentages(counts, TEST_ITERATIONS);

  // Calculate combined percentage for unsuccessful or new
  const unsuccessfulOrNewPercent =
    (percentages[0] ?? 0) +
    (percentages[1] ?? 0) +
    (percentages[2] ?? 0) +
    (percentages[3] ?? 0);

  // Should be approximately 50% (with tolerance for statistical variance)
  expect(unsuccessfulOrNewPercent).toBeGreaterThan(0.45);
  expect(unsuccessfulOrNewPercent).toBeLessThan(0.55);
});

it('should prioritize unsuccessful over untested characters', () => {
  const characters = [0, 1];
  const performance: CharacterPerformance[] = [
    { characterIndex: 0, correct: 0, total: 5 }, // 0% - unsuccessful
    // Character 1 is untested (no performance data)
  ];

  const counts = runSelectionTest(characters, performance, TEST_ITERATIONS);
  const percentages = getPercentages(counts, TEST_ITERATIONS);

  // Unsuccessful should be selected more often than untested
  expect(percentages[0] ?? 0).toBeGreaterThan(percentages[1] ?? 0);
});
```

#### 3.2 Update existing tests
**File:** `src/utils/adaptiveUtils.test.ts`

**Update tests to:**
- Use new function signatures (add `adaptiveRange` parameter)
- Adjust expectations for new 50/50 distribution
- Update test descriptions to reflect new algorithm

### Phase 4: Update Documentation

#### 4.1 Update README.md
**File:** `README.md`

**Update "Adaptive Learning System Explained" section:**

```markdown
### Character Selection Algorithm

The app uses a simple weighted selection algorithm that ensures characters you're struggling with or that are new get prioritized:

**Selection Distribution:**
- **50% of selections** come from unsuccessful or new characters
  - Unsuccessful characters (low success rate) get highest priority
  - New/untested characters get increased priority (but lower than unsuccessful)
- **50% of selections** come from successful characters
  - Weighted by inverse success rate (lower success = higher weight)

**Character Categories:**
1. **Unsuccessful/Untested Characters** (<50% success OR 0 attempts)
   - 50% of all selections
   - Unsuccessful: weighted by inverse success rate (lower success = higher weight)
   - Untested: fixed weight (0.8, lower than max unsuccessful)
2. **Successful Characters** (≥50% success rate)
   - 50% of all selections
   - Weighted by inverse success rate (lower success = higher weight)

**Configuration:**
- Unsuccessful threshold: <50% success rate
- Selection distribution: 50% unsuccessful/untested, 50% successful
```

#### 4.2 Update About.tsx
**File:** `src/components/feedback/About.tsx`

**Update "Adaptive Learning System" → "Character Selection" section:**

```tsx
<div>
  <h4 className="font-semibold text-text-primary mb-1">Character Selection</h4>
  <p className="mb-2">
    The app uses a weighted selection algorithm that ensures characters you're struggling with
    or that are new get prioritized. The system guarantees that 50% of selections come from
    unsuccessful or new characters.
  </p>
  <p className="mb-2 font-semibold text-text-primary">Selection Distribution:</p>
  <ul className="list-disc list-inside space-y-1 ml-2 mb-3">
    <li>
      <strong>50% Unsuccessful or New:</strong> Characters with low success rates or that are
      new to your practice range get 50% of all selections
    </li>
    <li>
      <strong>50% Successful:</strong> Characters with higher success rates get the remaining
      50% of selections
    </li>
  </ul>
  <p className="mb-2 font-semibold text-text-primary">Priority Categories:</p>
  <ul className="list-disc list-inside space-y-1 ml-2 mb-3">
    <li>
      <strong>Unsuccessful/Untested (&lt;{ADAPTIVE_CONFIG.UNSUCCESSFUL_THRESHOLD * 100}% success or 0 attempts):</strong>{' '}
      50% of selections - weighted by inverse success rate (untested get fixed weight)
    </li>
    <li>
      <strong>Successful (≥{ADAPTIVE_CONFIG.UNSUCCESSFUL_THRESHOLD * 100}% success):</strong>{' '}
      50% of selections - weighted by inverse success rate
    </li>
  </ul>
</div>
```

## Migration Checklist

### Types & Constants
- [ ] Update `ADAPTIVE_CONFIG` - add `UNTESTED_WEIGHT`, `SELECTION_SPLIT` (remove redundant target constants)
- [ ] Remove old priority allocation constants (`LOW_SUCCESS_PRIORITY`, `MEDIUM_SUCCESS_PRIORITY`, etc.)

### Core Logic
- [ ] Add `categorizeCharacters` helper function
- [ ] Add `getCharacterWeight` helper function
- [ ] Add `calculateGroupWeights` helper function
- [ ] Add `normalizeWeights` helper function
- [ ] Replace `calculateCharacterWeights` with refactored readable algorithm
- [ ] Update `selectAdaptiveCharacter` to handle single character and floating point precision

### Tests
- [ ] Add test for 50% selection guarantee
- [ ] Add test for unsuccessful vs new priority
- [ ] Add test for new vs successful priority
- [ ] Add test for categorization logic
- [ ] Add test for weight calculation
- [ ] Add test for normalization
- [ ] **Issue 1 Tests:** Empty groups (all untested, all successful, mixed)
- [ ] **Issue 2 Tests:** Division by zero prevention (empty groups, zero sum fallback)
- [ ] **Issue 3 Tests:** Floating point precision (weights sum to 1.0, all characters selectable, cumulative sum edge cases)
- [ ] **Issue 4 Tests:** Single character edge case (with/without performance data)
- [ ] **Issue 5 Tests:** Same success rate handling (all 0%, all 100%, all 50%, mixed same rates)
- [ ] **Issue 6 Tests:** normalizeWeights helper (normalization, zero total fallback, missing indices, ratio preservation)
- [ ] **Integration Tests:** Comprehensive scenarios combining all edge cases
- [ ] Update existing tests for new signatures
- [ ] Update test expectations for new distribution

### Documentation
- [ ] Update README.md "Adaptive Learning System Explained" section
- [ ] Update About.tsx "Character Selection" section
- [ ] Update any inline code comments

## Testing Strategy

### Unit Tests
1. Test categorization logic with various character states
2. Test weight calculation for each category
3. Test normalization to 50/50 split
4. Test edge cases (all one category, empty categories, etc.)
5. Test statistical distribution over many iterations

### Integration Tests
1. Test full selection flow with real data
2. Test with various adaptive range sizes
3. Test with characters at different stages of learning

### Manual Testing
1. Verify that struggling characters appear more frequently
2. Verify that new characters get reasonable priority
3. Verify that successful characters still appear but less frequently
4. Monitor selection distribution over extended use

## Risk Assessment

### Low Risk
- Adding new constants (non-breaking)
- Creating new helper functions (isolated)
- Documentation updates

### Medium Risk
- Refactoring core selection algorithm (affects all character selection)
- Updating function signatures (requires test updates)
- Weight calculation changes (affects selection distribution)

### High Risk
- Normalization logic (critical for 50/50 guarantee)
- Integration with existing adaptive range system
- Statistical distribution changes (user-visible behavior)

## Rollback Plan

If issues arise:
1. Keep backup of current `adaptiveUtils.ts`
2. Revert function signatures first
3. Revert algorithm changes if selection distribution is wrong
4. All changes are in version control for easy rollback

## Success Criteria

- [ ] Unsuccessful or new characters are selected 50% of the time (within statistical variance)
- [ ] Unsuccessful characters have higher priority than new characters
- [ ] New characters have higher priority than successful characters
- [ ] Successful characters still appear but with lower frequency
- [ ] All existing tests pass (after updates)
- [ ] New tests pass
- [ ] Documentation is updated
- [ ] Code is well-commented and maintainable

## Estimated Effort

- **Types & Constants**: 30 minutes
- **Core Logic**: 2-3 hours
- **Tests**: 3-4 hours (includes comprehensive edge case testing)
- **Documentation**: 1 hour

**Total**: ~6.5-8.5 hours

## Notes

- The 50% target is a statistical guarantee over many selections, not a hard requirement for each individual selection
- Untested characters (0 attempts) are in the same group as unsuccessful characters
- Untested characters get fixed weight from `UNTESTED_WEIGHT` constant (lower than max unsuccessful weight)
- The algorithm is intentionally simple: categorize, weight within groups, normalize each group to target percentage
- All values are properly defined as constants, no hardcoded magic numbers

## Potential Breaking Points & Solutions

### Issue 1: Empty Groups Break 50/50 Split

**Problem:**
- If all characters are untested (no performance data), only `unsuccessfulOrUntested` group has weights
- If all characters are successful (≥50%), only `successful` group has weights
- Result: Weights sum to 0.5 instead of 1.0, breaking the probability distribution

**Solution:**
```typescript
// After calculating weights for both groups, check if one group is empty
const totalWeight = Array.from(weights.values()).reduce((a, b) => a + b, 0);

// If one group is empty, redistribute weights to sum to 1.0
if (totalWeight > 0 && totalWeight !== 1.0) {
  const scaleFactor = 1.0 / totalWeight;
  weights.forEach((weight, charIndex) => {
    weights.set(charIndex, weight * scaleFactor);
  });
}
```

### Issue 2: Division by Zero in Normalization

**Problem:**
- If all weights in a group are 0 (shouldn't happen, but defensive), `sum` would be 0
- Division by zero would cause NaN weights

**Solution:**
```typescript
// Already handled with `if (sum > 0)` check, but ensure fallback
if (sum > 0) {
  // ... normalize
} else {
  // Fallback: equal weights within group
  const equalWeight = ADAPTIVE_CONFIG.SELECTION_SPLIT / group.length;
  group.forEach((charIndex) => {
    weights.set(charIndex, equalWeight);
  });
}
```

### Issue 3: Floating Point Precision in Selection

**Problem:**
- Cumulative sum might not reach exactly 1.0 due to floating point precision
- Last character might be selected more often than intended
- Fallback to last character could be triggered incorrectly

**Solution:**
```typescript
// Normalize weights to ensure they sum to exactly 1.0 before selection
const finalWeights = normalizeWeights(weights, characters);

// In selection loop, use >= instead of <= for last iteration
for (let i = 0; i < characters.length; i++) {
  const weight = finalWeights[i] ?? 0;
  cumulative += weight;
  // For last character, use >= to handle floating point precision
  if (i === characters.length - 1 || random <= cumulative) {
    return characters[i] ?? 0;
  }
}
```

### Issue 4: Edge Case - Single Character

**Problem:**
- If only one character in range, it should get 100% weight, not 50%

**Solution:**
```typescript
// Early return for single character
if (characters.length === 1) {
  return characters[0] ?? 0;
}
```

### Issue 5: All Characters Have Same Success Rate

**Problem:**
- If all unsuccessful characters have the same success rate (e.g., all 0%), they get equal weights
- If all successful characters have the same success rate (e.g., all 100%), `1 - successRate = 0` for all
- This could cause division issues or equal distribution when we want prioritization

**Solution:**
```typescript
// For successful group, if all have same success rate (especially 100%),
// use minimum weight to ensure they still get selected
const minWeight = 0.01; // Minimum weight to prevent zero weights
groupWeights.forEach((weight, index) => {
  if (weight === 0) {
    groupWeights[index] = minWeight;
  }
});
```

### Issue 6: Weight Normalization Helper

**Add helper function to ensure weights always sum to 1.0:**
```typescript
const normalizeWeights = (
  weights: Map<number, number>,
  characters: number[]
): number[] => {
  const total = characters.reduce((sum, charIndex) => {
    return sum + (weights.get(charIndex) ?? 0);
  }, 0);

  if (total === 0) {
    // Fallback: equal weights
    const equalWeight = 1.0 / characters.length;
    return characters.map(() => equalWeight);
  }

  // Normalize to sum to exactly 1.0
  return characters.map((charIndex) => {
    return (weights.get(charIndex) ?? 0) / total;
  });
};
```

## Test Plans for Breaking Points

### Test Plan for Issue 1: Empty Groups Break 50/50 Split

**Test Cases:**

```typescript
describe('Empty groups handling', () => {
  it('should normalize weights to 1.0 when all characters are untested', () => {
    const characters = [0, 1, 2, 3];
    const performance: CharacterPerformance[] = []; // No performance data

    const weights = calculateCharacterWeights(characters, performance);
    const total = weights.reduce((a, b) => a + b, 0);

    // Weights should sum to exactly 1.0
    expect(total).toBeCloseTo(1.0, 10);
    // All characters should have equal weight (all untested)
    weights.forEach((weight) => {
      expect(weight).toBeCloseTo(1.0 / characters.length, 10);
    });
  });

  it('should normalize weights to 1.0 when all characters are successful', () => {
    const characters = [0, 1, 2, 3];
    const performance: CharacterPerformance[] = [
      { characterIndex: 0, correct: 10, total: 10 }, // 100%
      { characterIndex: 1, correct: 9, total: 10 }, // 90%
      { characterIndex: 2, correct: 8, total: 10 }, // 80%
      { characterIndex: 3, correct: 7, total: 10 }, // 70%
    ];

    const weights = calculateCharacterWeights(characters, performance);
    const total = weights.reduce((a, b) => a + b, 0);

    // Weights should sum to exactly 1.0
    expect(total).toBeCloseTo(1.0, 10);
    // All characters should be selected (weights > 0)
    weights.forEach((weight) => {
      expect(weight).toBeGreaterThan(0);
    });
  });

  it('should maintain 50/50 split when both groups have characters', () => {
    const characters = [0, 1, 2, 3];
    const performance: CharacterPerformance[] = [
      { characterIndex: 0, correct: 0, total: 5 }, // 0% - unsuccessful
      { characterIndex: 1, correct: 0, total: 0 }, // untested
      { characterIndex: 2, correct: 8, total: 10 }, // 80% - successful
      { characterIndex: 3, correct: 9, total: 10 }, // 90% - successful
    ];

    const weights = calculateCharacterWeights(characters, performance);
    const total = weights.reduce((a, b) => a + b, 0);

    expect(total).toBeCloseTo(1.0, 10);

    // Verify 50/50 split statistically
    const counts = runSelectionTest(characters, performance, TEST_ITERATIONS);
    const percentages = getPercentages(counts, TEST_ITERATIONS);
    const unsuccessfulOrUntestedPercent = (percentages[0] ?? 0) + (percentages[1] ?? 0);
    expect(unsuccessfulOrUntestedPercent).toBeGreaterThan(0.45);
    expect(unsuccessfulOrUntestedPercent).toBeLessThan(0.55);
  });
});
```

### Test Plan for Issue 2: Division by Zero in Normalization

**Test Cases:**

```typescript
describe('Division by zero prevention', () => {
  it('should handle empty group gracefully', () => {
    const characters = [0, 1];
    const performance: CharacterPerformance[] = [
      { characterIndex: 0, correct: 0, total: 5 }, // unsuccessful
      // Character 1 has no performance data (untested)
    ];

    // Should not throw or produce NaN
    const weights = calculateCharacterWeights(characters, performance);
    weights.forEach((weight) => {
      expect(weight).toBeFinite();
      expect(weight).not.toBeNaN();
      expect(weight).toBeGreaterThanOrEqual(0);
    });
  });

  it('should use equal weights fallback when sum is zero', () => {
    // This test verifies the fallback logic in calculateGroupWeights
    // when all base weights somehow sum to zero (edge case)
    const characters = [0, 1, 2];
    const performance: CharacterPerformance[] = [
      { characterIndex: 0, correct: 0, total: 0 }, // untested
      { characterIndex: 1, correct: 0, total: 0 }, // untested
      { characterIndex: 2, correct: 0, total: 0 }, // untested
    ];

    const weights = calculateCharacterWeights(characters, performance);
    const total = weights.reduce((a, b) => a + b, 0);

    expect(total).toBeCloseTo(1.0, 10);
    // All should have equal weight
    weights.forEach((weight) => {
      expect(weight).toBeCloseTo(1.0 / characters.length, 10);
    });
  });
});
```

### Test Plan for Issue 3: Floating Point Precision in Selection

**Test Cases:**

```typescript
describe('Floating point precision handling', () => {
  it('should ensure weights sum to exactly 1.0', () => {
    const characters = [0, 1, 2, 3, 4, 5];
    const performance: CharacterPerformance[] = [
      { characterIndex: 0, correct: 0, total: 5 },
      { characterIndex: 1, correct: 1, total: 5 },
      { characterIndex: 2, correct: 0, total: 0 },
      { characterIndex: 3, correct: 8, total: 10 },
      { characterIndex: 4, correct: 9, total: 10 },
      { characterIndex: 5, correct: 10, total: 10 },
    ];

    const weights = calculateCharacterWeights(characters, performance);
    const total = weights.reduce((a, b) => a + b, 0);

    // Should sum to exactly 1.0 (within floating point precision)
    expect(total).toBeCloseTo(1.0, 10);
  });

  it('should select all characters without falling back to last', () => {
    const characters = [0, 1, 2, 3, 4];
    const performance: CharacterPerformance[] = [
      { characterIndex: 0, correct: 0, total: 5 },
      { characterIndex: 1, correct: 1, total: 5 },
      { characterIndex: 2, correct: 0, total: 0 },
      { characterIndex: 3, correct: 8, total: 10 },
      { characterIndex: 4, correct: 9, total: 10 },
    ];

    // Run many selections and verify all characters are selected
    const selections = new Set<number>();
    for (let i = 0; i < TEST_ITERATIONS; i++) {
      const selected = selectAdaptiveCharacter(characters, performance);
      selections.add(selected);
    }

    // All characters should be selected at least once
    characters.forEach((charIndex) => {
      expect(selections.has(charIndex)).toBe(true);
    });
  });

  it('should handle cumulative sum edge cases correctly', () => {
    const characters = [0, 1];
    const performance: CharacterPerformance[] = [
      { characterIndex: 0, correct: 0, total: 5 },
      { characterIndex: 1, correct: 9, total: 10 },
    ];

    const weights = calculateCharacterWeights(characters, performance);

    // Test selection with random value at boundaries
    // This tests the >= logic for last character
    const counts: Record<number, number> = {};
    for (let i = 0; i < TEST_ITERATIONS; i++) {
      const selected = selectAdaptiveCharacter(characters, performance);
      counts[selected] = (counts[selected] ?? 0) + 1;
    }

    // Both characters should be selected
    expect(counts[0]).toBeGreaterThan(0);
    expect(counts[1]).toBeGreaterThan(0);
  });
});
```

### Test Plan for Issue 4: Edge Case - Single Character

**Test Cases:**

```typescript
describe('Single character edge case', () => {
  it('should return weight 1.0 for single character', () => {
    const characters = [0];
    const performance: CharacterPerformance[] = [
      { characterIndex: 0, correct: 5, total: 10 },
    ];

    const weights = calculateCharacterWeights(characters, performance);

    expect(weights.length).toBe(1);
    expect(weights[0]).toBe(1.0);
  });

  it('should always select the single character', () => {
    const characters = [0];
    const performance: CharacterPerformance[] = [
      { characterIndex: 0, correct: 0, total: 5 },
    ];

    // Run multiple selections
    for (let i = 0; i < 100; i++) {
      const selected = selectAdaptiveCharacter(characters, performance);
      expect(selected).toBe(0);
    }
  });

  it('should handle single untested character', () => {
    const characters = [0];
    const performance: CharacterPerformance[] = [];

    const weights = calculateCharacterWeights(characters, performance);

    expect(weights.length).toBe(1);
    expect(weights[0]).toBe(1.0);
  });
});
```

### Test Plan for Issue 5: All Characters Have Same Success Rate

**Test Cases:**

```typescript
describe('Same success rate handling', () => {
  it('should handle all unsuccessful characters with 0% success', () => {
    const characters = [0, 1, 2, 3];
    const performance: CharacterPerformance[] = [
      { characterIndex: 0, correct: 0, total: 5 }, // 0%
      { characterIndex: 1, correct: 0, total: 5 }, // 0%
      { characterIndex: 2, correct: 0, total: 5 }, // 0%
      { characterIndex: 3, correct: 0, total: 5 }, // 0%
    ];

    const weights = calculateCharacterWeights(characters, performance);
    const total = weights.reduce((a, b) => a + b, 0);

    expect(total).toBeCloseTo(1.0, 10);
    // All should have equal weight (same success rate)
    weights.forEach((weight) => {
      expect(weight).toBeCloseTo(1.0 / characters.length, 10);
    });
  });

  it('should handle all successful characters with 100% success', () => {
    const characters = [0, 1, 2, 3];
    const performance: CharacterPerformance[] = [
      { characterIndex: 0, correct: 10, total: 10 }, // 100%
      { characterIndex: 1, correct: 10, total: 10 }, // 100%
      { characterIndex: 2, correct: 10, total: 10 }, // 100%
      { characterIndex: 3, correct: 10, total: 10 }, // 100%
    ];

    const weights = calculateCharacterWeights(characters, performance);
    const total = weights.reduce((a, b) => a + b, 0);

    expect(total).toBeCloseTo(1.0, 10);
    // All should have minimum weight (0.01) since 1 - 1.0 = 0
    weights.forEach((weight) => {
      expect(weight).toBeGreaterThanOrEqual(0.01);
      expect(weight).toBeFinite();
    });
  });

  it('should handle all characters with 50% success (threshold boundary)', () => {
    const characters = [0, 1, 2];
    const performance: CharacterPerformance[] = [
      { characterIndex: 0, correct: 5, total: 10 }, // 50% - successful (at threshold)
      { characterIndex: 1, correct: 5, total: 10 }, // 50% - successful
      { characterIndex: 2, correct: 5, total: 10 }, // 50% - successful
    ];

    const weights = calculateCharacterWeights(characters, performance);
    const total = weights.reduce((a, b) => a + b, 0);

    expect(total).toBeCloseTo(1.0, 10);
    // All should have equal weight (same success rate)
    weights.forEach((weight) => {
      expect(weight).toBeCloseTo(1.0 / characters.length, 10);
    });
  });

  it('should handle mixed same success rates in different groups', () => {
    const characters = [0, 1, 2, 3];
    const performance: CharacterPerformance[] = [
      { characterIndex: 0, correct: 0, total: 5 }, // 0% - unsuccessful
      { characterIndex: 1, correct: 0, total: 5 }, // 0% - unsuccessful
      { characterIndex: 2, correct: 10, total: 10 }, // 100% - successful
      { characterIndex: 3, correct: 10, total: 10 }, // 100% - successful
    ];

    const weights = calculateCharacterWeights(characters, performance);
    const total = weights.reduce((a, b) => a + b, 0);

    expect(total).toBeCloseTo(1.0, 10);

    // Verify 50/50 split
    const counts = runSelectionTest(characters, performance, TEST_ITERATIONS);
    const percentages = getPercentages(counts, TEST_ITERATIONS);
    const unsuccessfulPercent = (percentages[0] ?? 0) + (percentages[1] ?? 0);
    expect(unsuccessfulPercent).toBeGreaterThan(0.45);
    expect(unsuccessfulPercent).toBeLessThan(0.55);
  });
});
```

### Test Plan for Issue 6: Weight Normalization Helper

**Test Cases:**

```typescript
describe('normalizeWeights helper function', () => {
  it('should normalize weights to sum to exactly 1.0', () => {
    const weights = new Map<number, number>();
    weights.set(0, 0.3);
    weights.set(1, 0.2);
    weights.set(2, 0.5);
    const characters = [0, 1, 2];

    const normalized = normalizeWeights(weights, characters);
    const total = normalized.reduce((a, b) => a + b, 0);

    expect(total).toBeCloseTo(1.0, 10);
  });

  it('should handle zero total with equal weights fallback', () => {
    const weights = new Map<number, number>();
    weights.set(0, 0);
    weights.set(1, 0);
    weights.set(2, 0);
    const characters = [0, 1, 2];

    const normalized = normalizeWeights(weights, characters);
    const total = normalized.reduce((a, b) => a + b, 0);

    expect(total).toBeCloseTo(1.0, 10);
    // All should have equal weight
    normalized.forEach((weight) => {
      expect(weight).toBeCloseTo(1.0 / characters.length, 10);
    });
  });

  it('should handle missing character indices', () => {
    const weights = new Map<number, number>();
    weights.set(0, 0.5);
    weights.set(1, 0.5);
    const characters = [0, 1, 2]; // Character 2 missing from weights

    const normalized = normalizeWeights(weights, characters);
    const total = normalized.reduce((a, b) => a + b, 0);

    expect(total).toBeCloseTo(1.0, 10);
    expect(normalized[2]).toBe(0); // Missing character gets 0 weight
  });

  it('should preserve relative weights after normalization', () => {
    const weights = new Map<number, number>();
    weights.set(0, 0.6);
    weights.set(1, 0.3);
    weights.set(2, 0.1);
    const characters = [0, 1, 2];

    const normalized = normalizeWeights(weights, characters);

    // Ratios should be preserved
    const ratio1 = normalized[0]! / normalized[1]!;
    const ratio2 = weights.get(0)! / weights.get(1)!;
    expect(ratio1).toBeCloseTo(ratio2, 10);
  });
});
```

### Comprehensive Integration Tests

**Test Cases:**

```typescript
describe('Comprehensive integration tests', () => {
  it('should handle all edge cases in combination', () => {
    // Mix of untested, unsuccessful, and successful
    const characters = [0, 1, 2, 3, 4, 5, 6, 7];
    const performance: CharacterPerformance[] = [
      { characterIndex: 0, correct: 0, total: 0 }, // untested
      { characterIndex: 1, correct: 0, total: 5 }, // 0% - unsuccessful
      { characterIndex: 2, correct: 1, total: 5 }, // 20% - unsuccessful
      { characterIndex: 3, correct: 2, total: 5 }, // 40% - unsuccessful
      { characterIndex: 4, correct: 5, total: 10 }, // 50% - successful (at threshold)
      { characterIndex: 5, correct: 8, total: 10 }, // 80% - successful
      { characterIndex: 6, correct: 9, total: 10 }, // 90% - successful
      { characterIndex: 7, correct: 10, total: 10 }, // 100% - successful
    ];

    const weights = calculateCharacterWeights(characters, performance);
    const total = weights.reduce((a, b) => a + b, 0);

    expect(total).toBeCloseTo(1.0, 10);

    // Verify 50/50 split statistically
    const counts = runSelectionTest(characters, performance, TEST_ITERATIONS);
    const percentages = getPercentages(counts, TEST_ITERATIONS);
    const unsuccessfulOrUntestedPercent =
      (percentages[0] ?? 0) +
      (percentages[1] ?? 0) +
      (percentages[2] ?? 0) +
      (percentages[3] ?? 0);

    expect(unsuccessfulOrUntestedPercent).toBeGreaterThan(0.45);
    expect(unsuccessfulOrUntestedPercent).toBeLessThan(0.55);
  });

  it('should maintain weights sum to 1.0 across all scenarios', () => {
    const scenarios = [
      // All untested
      { characters: [0, 1, 2], performance: [] },
      // All unsuccessful
      { characters: [0, 1, 2], performance: [
        { characterIndex: 0, correct: 0, total: 5 },
        { characterIndex: 1, correct: 1, total: 5 },
        { characterIndex: 2, correct: 2, total: 5 },
      ]},
      // All successful
      { characters: [0, 1, 2], performance: [
        { characterIndex: 0, correct: 8, total: 10 },
        { characterIndex: 1, correct: 9, total: 10 },
        { characterIndex: 2, correct: 10, total: 10 },
      ]},
      // Mixed
      { characters: [0, 1, 2, 3], performance: [
        { characterIndex: 0, correct: 0, total: 0 },
        { characterIndex: 1, correct: 0, total: 5 },
        { characterIndex: 2, correct: 8, total: 10 },
        { characterIndex: 3, correct: 10, total: 10 },
      ]},
    ];

    scenarios.forEach((scenario) => {
      const weights = calculateCharacterWeights(scenario.characters, scenario.performance);
      const total = weights.reduce((a, b) => a + b, 0);
      expect(total).toBeCloseTo(1.0, 10);
    });
  });
});
```

### Refactored Algorithm (Readable)

```typescript
// Helper: Categorize characters into groups
const categorizeCharacters = (
  characters: number[],
  performanceMap: Map<number, CharacterPerformance>
): { unsuccessfulOrUntested: number[]; successful: number[] } => {
  const unsuccessfulOrUntested: number[] = [];
  const successful: number[] = [];

  for (const charIndex of characters) {
    const perf = performanceMap.get(charIndex);
    const isUntested = !perf || perf.total === 0;
    const isUnsuccessful = perf && getSuccessRate(perf) < ADAPTIVE_CONFIG.UNSUCCESSFUL_THRESHOLD;

    if (isUntested || isUnsuccessful) {
      unsuccessfulOrUntested.push(charIndex);
    } else {
      successful.push(charIndex);
    }
  }

  return { unsuccessfulOrUntested, successful };
};

// Helper: Calculate base weight for a character
const getCharacterWeight = (
  perf: CharacterPerformance | undefined,
  isUntested: boolean
): number => {
  if (isUntested) {
    return ADAPTIVE_CONFIG.UNTESTED_WEIGHT;
  }
  if (!perf) {
    return ADAPTIVE_CONFIG.UNTESTED_WEIGHT;
  }
  const successRate = getSuccessRate(perf);
  return 1 - successRate;
};

// Helper: Calculate and normalize weights for a group
const calculateGroupWeights = (
  group: number[],
  performanceMap: Map<number, CharacterPerformance>,
  isUntestedGroup: boolean
): Map<number, number> => {
  const weights = new Map<number, number>();

  if (group.length === 0) {
    return weights;
  }

  // Calculate base weights
  const baseWeights = group.map((charIndex) => {
    const perf = performanceMap.get(charIndex);
    const isUntested = !perf || perf.total === 0;
    let weight = getCharacterWeight(perf, isUntested);

    // For successful group, ensure minimum weight
    if (!isUntestedGroup) {
      weight = Math.max(weight, 0.01);
    }

    return weight;
  });

  // Normalize within group
  const sum = baseWeights.reduce((a, b) => a + b, 0);
  const scaleFactor = sum > 0 ? ADAPTIVE_CONFIG.SELECTION_SPLIT / sum : ADAPTIVE_CONFIG.SELECTION_SPLIT / group.length;

  group.forEach((charIndex, index) => {
    const normalizedWeight = sum > 0 ? baseWeights[index]! * scaleFactor : ADAPTIVE_CONFIG.SELECTION_SPLIT / group.length;
    weights.set(charIndex, normalizedWeight);
  });

  return weights;
};

// Main function: Clean and readable
const calculateCharacterWeights = (
  characters: number[],
  performance: CharacterPerformance[]
): number[] => {
  if (characters.length === 1) {
    return [1.0];
  }

  // Build performance map
  const performanceMap = new Map<number, CharacterPerformance>();
  performance.forEach((p) => performanceMap.set(p.characterIndex, p));

  // Categorize characters
  const { unsuccessfulOrUntested, successful } = categorizeCharacters(characters, performanceMap);

  // Calculate weights for each group
  const weights = new Map<number, number>();
  const unsuccessfulWeights = calculateGroupWeights(unsuccessfulOrUntested, performanceMap, true);
  const successfulWeights = calculateGroupWeights(successful, performanceMap, false);

  // Combine weights
  unsuccessfulWeights.forEach((weight, charIndex) => weights.set(charIndex, weight));
  successfulWeights.forEach((weight, charIndex) => weights.set(charIndex, weight));

  // Normalize to ensure weights sum to exactly 1.0
  return normalizeWeights(weights, characters);
};
```

