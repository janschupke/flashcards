# App Simplification Refactoring Plan

## Overview

This document outlines the plan to simplify the flashcard app by making pinyin input the only input method. Modes will only control what characters are displayed (simplified, traditional, or both), not the input type.

## Current State

### Current Behavior
- **Three modes** that control both input type and display:
  - **Pinyin Mode (F1)**: Shows both characters, input pinyin
  - **Simplified Mode (F2)**: Shows traditional, input simplified character
  - **Traditional Mode (F3)**: Shows simplified, input traditional character

### Current Complexity
- Dual input system: `PinyinInput` and `CharacterInput` components
- Mode-based conditional rendering in `FlashcardPage.tsx`
- Separate validation logic for pinyin vs characters
- Mode determines both input type AND display
- Complex state management with `characterInput`, `isCharacterCorrect`, `setCharacterFlashResult`
- Decision logic scattered across components

## Proposed State

### New Behavior
- **Always input pinyin** - single input method
- **Three display modes** that only control what's shown:
  - **Both (F1)**: Show both simplified and traditional characters
  - **Simplified (F2)**: Show only simplified character
  - **Traditional (F3)**: Show only traditional character

### Benefits
- Simpler mental model: one input method, modes only change display
- Reduced code complexity: remove `CharacterInput`, character validation logic
- Easier to maintain: single input path, no conditional rendering
- Better UX: consistent input method, less confusion
- Cleaner state: remove character input fields and validation

## Refactoring Steps

### Phase 1: Update Types and Constants

#### 1.1 Update `FlashcardMode` enum
**File:** `src/types/index.ts`

**Changes:**
- Rename modes to reflect display-only nature:
  ```typescript
  export enum FlashcardMode {
    BOTH = 'both',           // Show both simplified and traditional
    SIMPLIFIED = 'simplified', // Show only simplified
    TRADITIONAL = 'traditional', // Show only traditional
  }
  ```

#### 1.2 Update mode constants
**File:** `src/constants/modes.ts`

**Changes:**
- Update labels and titles (keep labels in Chinese):
  ```typescript
  export const MODES: { mode: FlashcardMode; label: string; title: string }[] = [
    { mode: FlashcardMode.BOTH, label: '全部 (F1)', title: '显示全部字符 - Show Both Characters (F1)' },
    { mode: FlashcardMode.SIMPLIFIED, label: '简体 (F2)', title: '仅显示简体 - Show Simplified Only (F2)' },
    { mode: FlashcardMode.TRADITIONAL, label: '繁体 (F3)', title: '仅显示繁体 - Show Traditional Only (F3)' },
  ];
  ```

#### 1.3 Update keyboard shortcuts
**File:** `src/types/index.ts`

**Changes:**
- Update shortcut names:
  ```typescript
  export const KEYBOARD_SHORTCUTS = {
    NEXT: 'Enter',
    PINYIN: [','],
    ENGLISH: ['.'],
    MODE_BOTH: 'F1',
    MODE_SIMPLIFIED: 'F2',
    MODE_TRADITIONAL: 'F3',
  } as const;
  ```

#### 1.4 Simplify `FlashCardState` interface
**File:** `src/types/index.ts`

**Remove:**
- `characterInput: string`
- `isCharacterCorrect: boolean | null`

**Keep:**
- `pinyinInput: string`
- `isPinyinCorrect: boolean | null`
- `mode: FlashcardMode` (now only controls display)

#### 1.5 Simplify `FlashCardActions` interface
**File:** `src/types/index.ts`

**Remove:**
- `setCharacterInput: (input: string) => void`
- `validateCharacter: () => void`
- `setCharacterFlashResult: (input: string) => void`

**Keep:**
- `setPinyinInput: (input: string) => void`
- `setPinyinFlashResult: (input: string) => void`
- `setMode: (mode: FlashcardMode) => void` (now only controls display)

#### 1.6 Update `IncorrectAnswer` interface
**File:** `src/types/index.ts`

**Remove:**
- `submittedCharacter?: string`
- `correctCharacter?: string`
- `mode: FlashcardMode` (no longer needed since always pinyin)

**Keep:**
- `submittedPinyin: string`
- `correctPinyin: string`

#### 1.7 Remove `CharacterInputProps` interface
**File:** `src/types/index.ts`

**Action:** Delete the entire interface (no longer needed)

### Phase 2: Update Core Logic

#### 2.1 Simplify `useFlashCard` hook
**File:** `src/hooks/useFlashCard.ts`

**Changes:**
1. Remove `characterInput` state initialization
2. Remove `isCharacterCorrect` state initialization
3. Remove `setCharacterInput` function
4. Remove `validateCharacter` function
5. Remove `setCharacterFlashResult` function
6. Update `getCurrentCharacter` to always return full character (no mode-based filtering)
7. Simplify answer tracking to only use pinyin
8. Update `getNext` to only clear `pinyinInput`
9. Remove all character validation logic
10. Update default mode to `FlashcardMode.BOTH`

**Key simplifications:**
```typescript
// Before: Mode determines input type
const getCurrentCharacter = useCallback(() => {
  return mode === FlashcardMode.PINYIN
    ? (data[current] ?? null)
    : getCharacterAtIndex(current, mode);
}, [current, mode]);

// After: Always return full character
const getCurrentCharacter = useCallback(() => {
  return data[current] ?? null;
}, [current]);
```

#### 2.2 Simplify `characterUtils.ts`
**File:** `src/utils/characterUtils.ts`

**Remove functions:**
- `getExpectedCharacter` (no longer needed)
- `getCharacterAtIndex` (no longer needed for input)

**Update functions:**
- `getDisplayCharacter`: Simplify to only handle display logic based on mode
  ```typescript
  export const getDisplayCharacter = (
    character: Character,
    mode: FlashcardMode
  ): { simplified: string; traditional: string } => {
    switch (mode) {
      case FlashcardMode.BOTH:
        return { simplified: character.simplified, traditional: character.traditional };
      case FlashcardMode.SIMPLIFIED:
        return { simplified: character.simplified, traditional: '' };
      case FlashcardMode.TRADITIONAL:
        return { simplified: '', traditional: character.traditional };
      default:
        return { simplified: character.simplified, traditional: character.traditional };
    }
  };
  ```

#### 2.3 Remove character input utilities
**File:** `src/utils/inputUtils.ts`

**Review and remove:**
- Any character-specific input validation logic
- Keep only pinyin-related utilities if any

### Phase 3: Update Components

#### 3.1 Simplify `FlashcardPage.tsx`
**File:** `src/components/core/FlashcardPage.tsx`

**Changes:**
1. Remove `CharacterInput` import
2. Remove `characterInput`, `isCharacterCorrect`, `setCharacterInput`, `setCharacterFlashResult` from context
3. Remove conditional rendering for input type
4. Always render `PinyinInput`
5. Remove `characterInputRef` and related focus logic
6. Simplify mode change effect to only handle display updates
7. Update `getCurrentCharacter` usage (no mode parameter needed)

**Before:**
```typescript
{mode === FlashcardMode.PINYIN ? (
  <PinyinInput ... />
) : (
  <CharacterInput ... />
)}
```

**After:**
```typescript
<PinyinInput
  ref={pinyinInputRef}
  value={pinyinInput}
  onChange={setPinyinInput}
  currentPinyin={currentCharacter?.pinyin ?? ''}
  onSubmit={setPinyinFlashResult}
  isCorrect={isPinyinCorrect}
  disabled={false}
  flashResult={flashResult}
/>
```

#### 3.2 Update `CharacterDisplay.tsx`
**File:** `src/components/core/CharacterDisplay.tsx`

**Changes:**
1. Update to use new `getDisplayCharacter` function
2. Ensure it properly handles all three display modes
3. Remove any input-related logic

#### 3.3 Update `FlashcardControls.tsx`
**File:** `src/components/controls/FlashcardControls.tsx`

**Changes:**
1. Update button labels to reflect display-only nature
2. Update tooltips/descriptions
3. Ensure mode switching only affects display

#### 3.4 Update mode button components
**Files:**
- `src/components/controls/ModeButtonGroup.tsx`
- `src/components/controls/ModeToggleButtons.tsx`

**Changes:**
1. Update labels and descriptions
2. Update keyboard shortcut handling (F1/F2/F3)
3. Ensure tooltips reflect display-only behavior

#### 3.5 Delete `CharacterInput.tsx`
**File:** `src/components/input/CharacterInput.tsx`

**Action:** Delete entire file (no longer needed)

#### 3.6 Update `FlashCardContext.tsx`
**File:** `src/contexts/FlashCardContext.tsx`

**Changes:**
1. Remove character input related exports from context
2. Update type exports to match simplified interfaces
3. Ensure only pinyin-related actions are exposed

### Phase 4: Update Hooks

#### 4.1 Simplify `useKeyboardShortcuts.ts`
**File:** `src/hooks/useKeyboardShortcuts.ts`

**Changes:**
1. Update F1/F2/F3 handlers to use new mode names
2. Remove any character input related shortcuts
3. Update comments to reflect display-only modes

#### 4.2 Update `useModeNavigation.ts`
**File:** `src/hooks/useModeNavigation.ts`

**Changes:**
1. Update to work with new mode enum values
2. Ensure navigation only affects display
3. Update comments

#### 4.3 Update `useModeToggle.ts`
**File:** `src/hooks/useModeToggle.ts`

**Changes:**
1. Update to work with new mode enum values
2. Remove any input-related logic
3. Update tests if any

### Phase 5: Update Utilities

#### 5.1 Simplify `answerUtils.ts`
**File:** `src/utils/answerUtils.ts`

**Changes:**
1. Remove character input validation logic
2. Simplify answer creation to only use pinyin
3. Update `createAnswer` to not include character fields
4. Remove character comparison logic

#### 5.2 Update `feedbackUtils.ts`
**File:** `src/utils/feedbackUtils.ts`

**Changes:**
1. Remove character-related feedback text
2. Keep only pinyin feedback
3. Simplify hint text generation

#### 5.3 Update `storageUtils.ts`
**File:** `src/utils/storageUtils.ts`

**Changes:**
1. Review storage format - ensure it doesn't store character input data
2. Update if needed to match simplified answer format

### Phase 6: Update Tests

#### 6.1 Update component tests
**Files:**
- `src/components/core/FlashcardPage.test.tsx`
- `src/components/input/CharacterInput.test.tsx` (DELETE)
- `src/components/input/PinyinInput.test.tsx`
- `src/components/controls/ModeButtonGroup.test.tsx`
- `src/components/controls/ModeToggleButtons.test.tsx`

**Changes:**
1. Remove all character input tests
2. Update mode-related tests to reflect display-only behavior
3. Update assertions to only check pinyin input
4. Update mode switching tests

#### 6.2 Update hook tests
**Files:**
- `src/hooks/useFlashCard.test.ts`
- `src/hooks/useModeToggle.test.ts`
- `src/hooks/useKeyboardShortcuts.test.ts` (if exists)

**Changes:**
1. Remove character input state tests
2. Remove character validation tests
3. Update mode tests to reflect display-only behavior
4. Simplify test setup

#### 6.3 Update utility tests
**Files:**
- `src/utils/characterUtils.test.ts`
- `src/utils/answerUtils.test.ts`
- `src/utils/inputUtils.test.ts`

**Changes:**
1. Remove tests for deleted functions
2. Update `getDisplayCharacter` tests for new behavior
3. Simplify answer utility tests

### Phase 7: Update Documentation

#### 7.1 Update README.md
**File:** `README.md`

**Changes:**

1. **Update "Core Learning Features" section:**
   - Change "Three Flashcard Modes" → "Three Display Modes"
   - Update mode descriptions:
     ```markdown
     - **Three Display Modes:**
       - **全部 (Both) - F1:** Show both simplified and traditional characters, type pinyin (default mode)
       - **简体 (Simplified) - F2:** Show only simplified character, type pinyin
       - **繁体 (Traditional) - F3:** Show only traditional character, type pinyin
     ```
   - Remove "Character Input & Evaluation" bullet point
   - Update "Pinyin Input & Evaluation" to clarify it's the only input method

2. **Update "Keyboard Shortcuts" section:**
   - Update F1/F2/F3 descriptions:
     ```markdown
     - **F1:** Switch to Both display mode (show both characters)
     - **F2:** Switch to Simplified display mode (show only simplified)
     - **F3:** Switch to Traditional display mode (show only traditional)
     ```

3. **Update "Adaptive Learning System" section:**
   - Remove any references to character input modes
   - Clarify that all answers are pinyin-based

4. **Update "Data Source" section** (if it mentions input types):
   - Remove any references to character input modes
   - Clarify that all practice is pinyin-based

5. **Update "Getting Started" section** (if it mentions modes):
   - Update any mode descriptions to reflect display-only nature

6. **Review entire README** for any other references to:
   - Character input
   - Multiple input types
   - Mode-based input switching

#### 7.2 Update About.tsx
**File:** `src/components/feedback/About.tsx`

**Changes:**

1. **Update "How to Use" → "Modes" section:**
   - Replace current mode descriptions with:
     ```tsx
     <h4 className="font-semibold text-text-primary mb-1">Display Modes</h4>
     <ul className="list-disc list-inside space-y-1 ml-2">
       <li>
         <strong>全部 (Both) - F1:</strong> Display both simplified and traditional characters.
         Always type the pinyin pronunciation.
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
     ```
   - Add clarification that input is always pinyin regardless of display mode

2. **Update "Navigation" section:**
   - Update F1/F2/F3 description:
     ```tsx
     <li>
       <strong>F1/F2/F3:</strong> Switch between display modes (changes what characters are shown)
     </li>
     ```

3. **Add new "Input" section** (if needed for clarity):
   ```tsx
   <div>
     <h4 className="font-semibold text-text-primary mb-1">Input</h4>
     <ul className="list-disc list-inside space-y-1 ml-2">
       <li>
         <strong>Always type pinyin:</strong> Regardless of which display mode you're in,
         you always type the pinyin pronunciation of the character
       </li>
       <li>
         <strong>Alternative inputs:</strong> You can type 'u' or 'v' instead of 'ü' for convenience
       </li>
     </ul>
   </div>
   ```

4. **Update "Adaptive Learning System" section:**
   - Remove any references to character input modes
   - Clarify that character selection is based on pinyin performance only

5. **Review and update all other sections** for consistency

### Phase 8: Cleanup

#### 8.1 Remove unused imports
**Action:** Search for and remove:
- `CharacterInput` imports
- `getExpectedCharacter` imports
- `getCharacterAtIndex` imports
- Character input related type imports

#### 8.2 Remove unused types
**Action:** Remove from `src/types/index.ts`:
- `CharacterInputProps` interface

#### 8.3 Update comments
**Action:** Update all comments that reference:
- "input modes" → "display modes"
- "character input" → remove or update
- Mode descriptions to clarify display-only

## Migration Checklist

### Types & Constants
- [ ] Update `FlashcardMode` enum
- [ ] Update mode constants in `modes.ts`
- [ ] Update keyboard shortcuts
- [ ] Simplify `FlashCardState` interface
- [ ] Simplify `FlashCardActions` interface
- [ ] Update `IncorrectAnswer` interface
- [ ] Remove `CharacterInputProps` interface

### Core Logic
- [ ] Simplify `useFlashCard` hook
- [ ] Update `characterUtils.ts`
- [ ] Remove character input utilities
- [ ] Update answer tracking logic

### Components
- [ ] Simplify `FlashcardPage.tsx`
- [ ] Update `CharacterDisplay.tsx`
- [ ] Update `FlashcardControls.tsx`
- [ ] Update mode button components
- [ ] Delete `CharacterInput.tsx`
- [ ] Update `FlashCardContext.tsx`

### Hooks
- [ ] Update `useKeyboardShortcuts.ts`
- [ ] Update `useModeNavigation.ts`
- [ ] Update `useModeToggle.ts`

### Utilities
- [ ] Simplify `answerUtils.ts`
- [ ] Update `feedbackUtils.ts`
- [ ] Review `storageUtils.ts`

### Tests
- [ ] Update component tests
- [ ] Delete `CharacterInput.test.tsx`
- [ ] Update hook tests
- [ ] Update utility tests

### Documentation
- [ ] Update README.md
- [ ] Update About.tsx

### Cleanup
- [ ] Remove unused imports
- [ ] Remove unused types
- [ ] Update comments

## Testing Strategy

### Manual Testing
1. Test all three display modes (Both, Simplified, Traditional)
2. Verify pinyin input works in all modes
3. Test keyboard shortcuts (F1/F2/F3)
4. Test mode switching with arrow keys
5. Verify answer tracking only uses pinyin
6. Test statistics and history (should only show pinyin)
7. Test adaptive learning (should work with pinyin-only)

### Automated Testing
1. Run all existing tests
2. Update failing tests to match new behavior
3. Add tests for display-only mode switching
4. Verify no character input tests remain

## Risk Assessment

### Low Risk
- Display logic changes (well-isolated)
- Mode button updates (UI only)
- Documentation updates

### Medium Risk
- State management simplification (core logic)
- Answer tracking updates (data format)
- Test updates (comprehensive changes)

### High Risk
- Storage format changes (if any)
- Context API changes (affects all consumers)
- Hook simplification (core functionality)

## Rollback Plan

If issues arise:
1. Keep backup of current implementation
2. Revert types first (safest)
3. Revert hooks if state issues occur
4. Revert components if UI breaks
5. All changes are in version control for easy rollback

## Success Criteria

- [ ] All tests pass
- [ ] No character input components remain
- [ ] Modes only control display
- [ ] Pinyin input works in all modes
- [ ] Keyboard shortcuts work correctly
- [ ] Statistics and history work correctly
- [ ] Documentation is updated
- [ ] Code is cleaner and simpler
- [ ] No unused code remains

## Estimated Effort

- **Types & Constants**: 1-2 hours
- **Core Logic**: 3-4 hours
- **Components**: 2-3 hours
- **Hooks**: 1-2 hours
- **Utilities**: 1-2 hours
- **Tests**: 3-4 hours
- **Documentation**: 1 hour
- **Cleanup**: 1 hour

**Total**: ~13-19 hours

## Notes

- This is a breaking change to the app's behavior
- Users will need to understand that modes now only control display
- The simplification significantly reduces code complexity
- Consider adding a migration note in the About section if needed
- All character input functionality will be removed

