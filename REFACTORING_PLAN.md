# Code Refactoring Plan: Duplication & Business Logic Extraction

## Overview
This document outlines a comprehensive refactoring plan to eliminate code duplication and extract business logic from components into appropriate hooks and utilities.

---

## 1. Input Components Duplication

### Current State
**Files:** `src/components/input/PinyinInput.tsx`, `src/components/input/CharacterInput.tsx`

**Duplications Identified:**
- Flash animation state management (identical `useState` and `useEffect`)
- Variant calculation logic (`getVariant` function)
- Border class calculation (`borderClass`)
- Feedback class calculation (`feedbackClass`)
- Input wrapper structure (identical JSX)
- Input element attributes (identical className and props)
- Event handlers (`handleChange`, `handleKeyDown`)

**Differences:**
- Placeholder logic (PinyinInput: simple, CharacterInput: mode-based switch)
- Feedback text generation (different error messages)

### Proposed Changes

#### 1.1 Create `useFlashAnimation` Hook
**File:** `src/hooks/useFlashAnimation.ts`

Extract flash animation logic:
```typescript
export const useFlashAnimation = (flashResult: FlashResult | null) => {
  const [isFlashing, setIsFlashing] = useState(false);

  useEffect(() => {
    if (flashResult !== null && flashResult !== undefined) {
      setIsFlashing(true);
      const timer = setTimeout(() => {
        setIsFlashing(false);
      }, ANIMATION_TIMINGS.FLASH_RESULT_DURATION);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [flashResult]);

  return isFlashing;
};
```

**Benefits:**
- Single source of truth for flash animation
- Reusable across components
- Easier to test

#### 1.2 Create `useInputVariant` Hook
**File:** `src/hooks/useInputVariant.ts`

Extract variant and styling logic:
```typescript
export const useInputVariant = (
  isFlashing: boolean,
  flashResult: FlashResult | null,
  isCorrect: boolean | null
) => {
  const variant = useMemo(() => {
    if (isFlashing) {
      return flashResult === FlashResult.CORRECT
        ? InputVariant.SUCCESS
        : InputVariant.ERROR;
    }
    if (isCorrect === true) return InputVariant.SUCCESS;
    if (isCorrect === false) return InputVariant.ERROR;
    return InputVariant.DEFAULT;
  }, [isFlashing, flashResult, isCorrect]);

  const borderClass = useMemo(() => {
    if (variant === InputVariant.SUCCESS) return 'border-success';
    if (variant === InputVariant.ERROR) return 'border-error';
    return 'border-border-secondary';
  }, [variant]);

  const feedbackClass = useMemo(() => {
    if (variant === InputVariant.SUCCESS) return 'text-success';
    if (variant === InputVariant.ERROR) return 'text-error';
    return 'text-text-tertiary';
  }, [variant]);

  return { variant, borderClass, feedbackClass };
};
```

**Benefits:**
- Centralized styling logic
- Consistent behavior across inputs
- Memoized for performance

#### 1.3 Create Unified `FlashcardInput` Component
**File:** `src/components/input/FlashcardInput.tsx`

Create a base input component that both PinyinInput and CharacterInput can use:

```typescript
interface FlashcardInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (value: string) => void;
  placeholder: string;
  feedbackText: string;
  isCorrect: boolean | null;
  flashResult: FlashResult | null;
  disabled?: boolean;
  ref?: React.Ref<HTMLInputElement>;
}
```

**Implementation:**
- Use `useFlashAnimation` hook
- Use `useInputVariant` hook
- Accept `feedbackText` and `placeholder` as props
- Shared input structure and styling

**Refactor PinyinInput and CharacterInput:**
- Keep as thin wrappers that:
  - Calculate placeholder based on mode
  - Calculate feedback text based on mode
  - Pass props to `FlashcardInput`

**Files to Modify:**
- `src/components/input/PinyinInput.tsx` - Refactor to use FlashcardInput
- `src/components/input/CharacterInput.tsx` - Refactor to use FlashcardInput
- `src/components/input/FlashcardInput.tsx` - New unified component
- `src/hooks/useFlashAnimation.ts` - New hook
- `src/hooks/useInputVariant.ts` - New hook

**Testing:**
- Update existing tests for PinyinInput and CharacterInput
- Add tests for new hooks
- Add tests for FlashcardInput component

---

## 2. Color Class Logic Duplication

### Current State
**Files:**
- `src/components/input/PinyinInput.tsx` (lines 56-68)
- `src/components/input/CharacterInput.tsx` (lines 77-89)
- `src/components/feedback/PreviousCharacter.tsx` (lines 19-22)
- `src/components/feedback/IncorrectAnswers.tsx` (line 39)

**Duplications Identified:**
- Success/error color class calculation (`text-success`, `text-error`)
- Border color class calculation (`border-success`, `border-error`)

### Proposed Changes

#### 2.1 Create `getAnswerColorClass` Utility
**File:** `src/utils/styleUtils.ts` (new file)

```typescript
export const getAnswerColorClass = (isCorrect: boolean | null): string => {
  if (isCorrect === null) return 'text-text-secondary';
  return isCorrect ? 'text-success' : 'text-error';
};

export const getBorderColorClass = (variant: InputVariant): string => {
  if (variant === InputVariant.SUCCESS) return 'border-success';
  if (variant === InputVariant.ERROR) return 'border-error';
  return 'border-border-secondary';
};
```

**Files to Modify:**
- `src/utils/styleUtils.ts` - New utility file
- `src/components/feedback/PreviousCharacter.tsx` - Use utility
- `src/components/feedback/IncorrectAnswers.tsx` - Use utility
- `src/components/input/PinyinInput.tsx` - Use utility (or via useInputVariant)
- `src/components/input/CharacterInput.tsx` - Use utility (or via useInputVariant)

**Testing:**
- Add unit tests for style utilities

---

## 3. Submitted Text Extraction Logic

### Current State
**Files:**
- `src/components/feedback/PreviousCharacter.tsx` (lines 11-17)
- `src/components/feedback/IncorrectAnswers.tsx` (lines 11-17, 19-25)

**Duplications Identified:**
- Logic to extract submitted text based on mode
- Logic to extract correct text based on mode

### Proposed Changes

#### 3.1 Create Answer Text Utilities
**File:** `src/utils/answerUtils.ts` (new file)

```typescript
export const getSubmittedText = (answer: Answer): string => {
  if (answer.mode === FlashcardMode.PINYIN) {
    return answer.submittedPinyin || '(empty)';
  }
  return answer.submittedCharacter || '(empty)';
};

export const getCorrectText = (answer: Answer): string => {
  if (answer.mode === FlashcardMode.PINYIN) {
    return answer.correctPinyin;
  }
  return answer.correctCharacter ?? '';
};
```

**Files to Modify:**
- `src/utils/answerUtils.ts` - New utility file
- `src/components/feedback/PreviousCharacter.tsx` - Use utilities
- `src/components/feedback/IncorrectAnswers.tsx` - Use utilities

**Testing:**
- Add unit tests for answer utilities

---

## 4. Mode Toggle Logic Duplication

### Current State
**Files:**
- `src/components/layout/TopControls.tsx` (lines 32-36, 62-76)
- `src/components/controls/ModeToggleButtons.tsx` (lines 20-24, 30-43)

**Duplications Identified:**
- `handleModeChange` function (identical logic)
- Mode button rendering (similar structure)
- `MODES` constant is shared (good)

**Note:** `ModeToggleButtons` component appears to be unused in the main app flow (only used in tests). `TopControls` is the active implementation.

### Proposed Changes

#### 4.1 Extract Mode Toggle Logic to Hook
**File:** `src/hooks/useModeToggle.ts` (new file)

```typescript
export const useModeToggle = (
  currentMode: FlashcardMode,
  onModeChange: (mode: FlashcardMode) => void
) => {
  const handleModeChange = useCallback((mode: FlashcardMode) => {
    if (mode !== currentMode) {
      onModeChange(mode);
    }
  }, [currentMode, onModeChange]);

  return { handleModeChange };
};
```

#### 4.2 Create Reusable `ModeButtonGroup` Component
**File:** `src/components/controls/ModeButtonGroup.tsx` (new file)

Extract the mode button rendering logic:
```typescript
interface ModeButtonGroupProps {
  currentMode: FlashcardMode;
  onModeChange: (mode: FlashcardMode) => void;
  size?: ButtonSize;
  className?: string;
}
```

**Files to Modify:**
- `src/hooks/useModeToggle.ts` - New hook
- `src/components/controls/ModeButtonGroup.tsx` - New component
- `src/components/layout/TopControls.tsx` - Use hook and component
- `src/components/controls/ModeToggleButtons.tsx` - Deprecate or refactor to use new component

**Decision Needed:**
- Should `ModeToggleButtons` be removed (if unused)?
- Or should it be refactored to use `ModeButtonGroup`?

**Testing:**
- Add tests for `useModeToggle` hook
- Add tests for `ModeButtonGroup` component
- Update existing tests

---

## 5. Range Input Logic Duplication

### Current State
**Files:**
- `src/components/layout/TopControls.tsx` (lines 38-56, 104-119)
- `src/components/input/CharacterRangeInput.tsx` (entire component)

**Duplications Identified:**
- Limit change handling (`handleLimitChange`, `handleLimitBlur`)
- Input validation and clamping logic
- Similar input structure

**Note:** `CharacterRangeInput` appears to be unused in the main app flow. `TopControls` contains the active implementation.

### Proposed Changes

#### 5.1 Extract Range Input Logic to Hook
**File:** `src/hooks/useRangeInput.ts` (new file)

```typescript
export const useRangeInput = (
  currentLimit: number,
  minLimit: number,
  maxLimit: number,
  onLimitChange: (newLimit: number) => void
) => {
  const [inputValue, setInputValue] = useState(currentLimit.toString());

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const parsed = parseInt(value, 10);
    if (!isNaN(parsed)) {
      const clamped = Math.max(minLimit, Math.min(maxLimit, parsed));
      setInputValue(clamped.toString());
      onLimitChange(clamped);
    } else {
      setInputValue(value);
    }
  }, [minLimit, maxLimit, onLimitChange]);

  const handleBlur = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (isNaN(value) || value < minLimit) {
      onLimitChange(minLimit);
      setInputValue(minLimit.toString());
    } else if (value > maxLimit) {
      onLimitChange(maxLimit);
      setInputValue(maxLimit.toString());
    } else {
      onLimitChange(value);
      setInputValue(value.toString());
    }
  }, [minLimit, maxLimit, onLimitChange]);

  useEffect(() => {
    setInputValue(currentLimit.toString());
  }, [currentLimit]);

  return { inputValue, handleChange, handleBlur };
};
```

#### 5.2 Create Reusable `RangeInput` Component
**File:** `src/components/input/RangeInput.tsx` (new file)

Extract range input rendering:
```typescript
interface RangeInputProps {
  currentLimit: number;
  minLimit: number;
  maxLimit: number;
  onLimitChange: (newLimit: number) => void;
  label?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}
```

**Files to Modify:**
- `src/hooks/useRangeInput.ts` - New hook
- `src/components/input/RangeInput.tsx` - New component
- `src/components/layout/TopControls.tsx` - Use hook and component
- `src/components/input/CharacterRangeInput.tsx` - Deprecate or refactor

**Decision Needed:**
- Should `CharacterRangeInput` be removed (if unused)?
- Or should it be refactored to use `RangeInput`?

**Testing:**
- Add tests for `useRangeInput` hook
- Add tests for `RangeInput` component
- Update existing tests

---

## 6. Character Display Column Markup Duplication

### Current State
**File:** `src/components/feedback/PreviousCharacter.tsx` (lines 30-61)

**Duplications Identified:**
- Repeated flex column structure for each field (Simplified, Traditional, Pinyin, English, Submitted)
- Identical styling classes for each column
- Only content differs

### Proposed Changes

#### 6.1 Create `CharacterInfoColumn` Component
**File:** `src/components/feedback/CharacterInfoColumn.tsx` (new file)

```typescript
interface CharacterInfoColumnProps {
  label: string;
  value: string;
  valueClassName?: string;
}
```

**Refactor PreviousCharacter:**
- Use `CharacterInfoColumn` for each field
- Reduce markup duplication
- Easier to maintain styling

**Files to Modify:**
- `src/components/feedback/CharacterInfoColumn.tsx` - New component
- `src/components/feedback/PreviousCharacter.tsx` - Use new component

**Testing:**
- Add tests for `CharacterInfoColumn`
- Update `PreviousCharacter` tests

---

## 7. Business Logic in Components

### Current State

#### 7.1 Feedback Text Generation
**Files:**
- `src/components/input/PinyinInput.tsx` (lines 36-44)
- `src/components/input/CharacterInput.tsx` (lines 57-65)

**Issue:** Business logic for generating feedback messages is in components.

**Proposed Changes:**
- Move to utility functions in `src/utils/feedbackUtils.ts`:
  ```typescript
  export const getPinyinFeedbackText = (
    isCorrect: boolean | null,
    correctPinyin: string
  ): string => {
    if (isCorrect === true) return CHINESE_TEXT.FEEDBACK.CORRECT;
    if (isCorrect === false) return CHINESE_TEXT.FEEDBACK.INCORRECT_PINYIN(correctPinyin);
    return '';
  };

  export const getCharacterFeedbackText = (
    isCorrect: boolean | null,
    correctCharacter: string
  ): string => {
    if (isCorrect === true) return CHINESE_TEXT.FEEDBACK.CORRECT;
    if (isCorrect === false) return CHINESE_TEXT.FEEDBACK.INCORRECT_CHARACTER(correctCharacter);
    return '';
  };
  ```

#### 7.2 Placeholder Logic
**Files:**
- `src/components/input/CharacterInput.tsx` (lines 46-55)

**Issue:** Mode-based placeholder selection logic in component.

**Proposed Changes:**
- Move to utility function in `src/utils/inputUtils.ts`:
  ```typescript
  export const getPlaceholder = (mode: FlashcardMode): string => {
    switch (mode) {
      case FlashcardMode.PINYIN:
        return CHINESE_TEXT.MODES.PINYIN.PLACEHOLDER;
      case FlashcardMode.SIMPLIFIED:
        return CHINESE_TEXT.MODES.SIMPLIFIED.PLACEHOLDER;
      case FlashcardMode.TRADITIONAL:
        return CHINESE_TEXT.MODES.TRADITIONAL.PLACEHOLDER;
      default:
        return '输入字符';
    }
  };
  ```

**Files to Modify:**
- `src/utils/feedbackUtils.ts` - New utility file
- `src/utils/inputUtils.ts` - New utility file
- `src/components/input/PinyinInput.tsx` - Use utility
- `src/components/input/CharacterInput.tsx` - Use utility

**Testing:**
- Add unit tests for feedback utilities
- Add unit tests for input utilities

---

## 8. Table Row Generation Logic

### Current State
**File:** `src/components/feedback/IncorrectAnswers.tsx` (lines 36-78)

**Issue:** Complex row generation logic with conditional rendering based on mode.

### Proposed Changes

#### 8.1 Extract Row Generation to Utility
**File:** `src/utils/tableUtils.ts` (new file)

```typescript
export const generateAnswerTableRows = (
  answers: Answer[],
  hasCharacterModes: boolean
): React.ReactNode[][] => {
  return answers.map((answer) => {
    const submitted = getSubmittedText(answer);
    const correct = getCorrectText(answer);
    const submittedColorClass = getAnswerColorClass(answer.isCorrect);

    if (hasCharacterModes) {
      return [
        <span key="simplified">{answer.simplified}</span>,
        <span key="traditional">{answer.traditional}</span>,
        <span key="correct">{correct}</span>,
        <span key="submitted" className={submittedColorClass}>{submitted}</span>,
        <span key="english">{answer.english}</span>,
      ];
    } else {
      return [
        <span key="simplified">{answer.simplified}</span>,
        <span key="traditional">{answer.traditional}</span>,
        <span key="pinyin">{answer.correctPinyin}</span>,
        <span key="submitted" className={submittedColorClass}>{submitted}</span>,
        <span key="english">{answer.english}</span>,
      ];
    }
  });
};
```

**Files to Modify:**
- `src/utils/tableUtils.ts` - New utility file
- `src/components/feedback/IncorrectAnswers.tsx` - Use utility

**Testing:**
- Add unit tests for table utilities
- Update `IncorrectAnswers` tests

---

## 9. Unused Components

### Current State
**Files:**
- `src/components/controls/ModeToggleButtons.tsx` - Appears unused (only in tests)
- `src/components/input/CharacterRangeInput.tsx` - Appears unused

### Proposed Actions

#### 9.1 Audit Component Usage
- Search codebase for imports of these components
- Verify they're not used in production code
- Check if they're needed for future features

#### 9.2 Decision Matrix
- **If unused:** Remove components and their tests
- **If needed for future:** Document why they exist
- **If duplicate:** Refactor to use new shared components

**Action Items:**
1. Search for `ModeToggleButtons` usage
2. Search for `CharacterRangeInput` usage
3. Make decision: remove, refactor, or keep

---

## 10. Implementation Priority

### Phase 1: High-Impact, Low-Risk
1. **Extract flash animation hook** (1.1)
2. **Extract input variant hook** (1.2)
3. **Create unified FlashcardInput** (1.3)
4. **Extract color class utilities** (2.1)
5. **Extract answer text utilities** (3.1)

**Estimated Impact:** Eliminates ~200 lines of duplicate code

### Phase 2: Medium-Impact, Medium-Risk
6. **Extract mode toggle logic** (4.1, 4.2)
7. **Extract range input logic** (5.1, 5.2)
8. **Extract feedback text utilities** (7.1)
9. **Extract placeholder logic** (7.2)

**Estimated Impact:** Eliminates ~150 lines of duplicate code, improves testability

### Phase 3: Low-Impact, Low-Risk
10. **Create CharacterInfoColumn** (6.1)
11. **Extract table row generation** (8.1)
12. **Audit and remove unused components** (9.1, 9.2)

**Estimated Impact:** Improves maintainability, reduces bundle size

---

## 11. Testing Strategy

### For Each Refactoring:
1. **Unit Tests:**
   - Test new hooks in isolation
   - Test new utility functions
   - Test new components

2. **Integration Tests:**
   - Test refactored components still work
   - Test component interactions

3. **Regression Tests:**
   - Run existing test suite
   - Verify no behavior changes

### Test Files to Create/Update:
- `src/hooks/useFlashAnimation.test.ts`
- `src/hooks/useInputVariant.test.ts`
- `src/hooks/useModeToggle.test.ts`
- `src/hooks/useRangeInput.test.ts`
- `src/utils/styleUtils.test.ts`
- `src/utils/answerUtils.test.ts`
- `src/utils/feedbackUtils.test.ts`
- `src/utils/inputUtils.test.ts`
- `src/utils/tableUtils.test.ts`
- `src/components/input/FlashcardInput.test.tsx`
- `src/components/controls/ModeButtonGroup.test.tsx`
- `src/components/input/RangeInput.test.tsx`
- `src/components/feedback/CharacterInfoColumn.test.tsx`

---

## 12. Migration Checklist

For each refactoring item:
- [ ] Create new hook/utility/component
- [ ] Write tests for new code
- [ ] Update existing components to use new code
- [ ] Update existing tests
- [ ] Run full test suite
- [ ] Verify no TypeScript errors
- [ ] Verify no runtime errors
- [ ] Manual testing in browser
- [ ] Remove old duplicate code
- [ ] Update documentation if needed

---

## 13. Estimated Benefits

### Code Reduction
- **Eliminated Duplication:** ~400-500 lines
- **Improved Maintainability:** Single source of truth for shared logic
- **Better Testability:** Business logic in testable utilities/hooks

### Performance
- **Memoization:** Hooks can use `useMemo` for expensive calculations
- **Bundle Size:** Reduced duplicate code = smaller bundle

### Developer Experience
- **Consistency:** Shared components ensure UI consistency
- **Reusability:** New features can use existing hooks/components
- **Easier Debugging:** Centralized logic easier to debug

---

## 14. Risks and Mitigation

### Risk 1: Breaking Changes
**Mitigation:**
- Comprehensive test coverage
- Incremental refactoring
- Keep old code until new code is verified

### Risk 2: Over-Abstraction
**Mitigation:**
- Only extract truly duplicated code
- Keep components simple and focused
- Review abstractions with team

### Risk 3: Performance Regression
**Mitigation:**
- Use React DevTools Profiler
- Memoize expensive calculations
- Benchmark before/after

---

## 15. Notes

- This refactoring should be done incrementally
- Each phase should be fully tested before moving to next
- Consider feature freeze during major refactoring
- Document any deviations from this plan

---

**Document Version:** 1.0
**Last Updated:** 2024
**Status:** Draft - Ready for Review
