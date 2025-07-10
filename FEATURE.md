# Flashcard Modes Feature Implementation PRP

## Overview
Add three different flashcard modes to the application: (1) current pinyin mode, (2) traditional to simplified mode, and (3) simplified to traditional mode. The modes will be toggled via three buttons at the top of the app, and switching modes will reset statistics.

## Current State Analysis

### Existing Architecture
- **Main Component**: `FlashCards.tsx` - renders the entire flashcard interface
- **State Management**: `useFlashCard.ts` hook manages all flashcard state
- **Data Structure**: `data.json` contains 1500 characters with simplified, traditional, pinyin, and English
- **Character Display**: `CharacterDisplay.tsx` shows both simplified and traditional characters
- **Input Handling**: `PinyinInput.tsx` handles pinyin input with validation via `pinyinUtils.ts`
- **Statistics**: Tracks correct answers, total seen, progress, and incorrect answers
- **Styling**: Uses styled-components with consistent color scheme (red theme)

### Key Findings
- 539 characters have different simplified/traditional forms out of 1500 total
- Current mode: Shows both characters, expects pinyin input
- Input validation: Normalizes pinyin (removes tones, case-insensitive)
- Statistics reset on limit changes but not on mode changes
- Keyboard shortcuts: Enter (next), comma (pinyin hint), period (English hint)

## Implementation Requirements

### 1. Mode System
**New Modes:**
- **拼音 (Pinyin)**: Current mode - shows character, expects pinyin input
- **简体 (Simplified)**: Shows traditional character, expects simplified character input  
- **繁体 (Traditional)**: Shows simplified character, expects traditional character input

**Mode State:**
- Add `mode: 'pinyin' | 'simplified' | 'traditional'` to `FlashCardState`
- Default mode: `'pinyin'`
- Mode switching resets all statistics (like page reload)

### 2. UI Components

#### Mode Toggle Buttons
- **Location**: Top of app, outside main container, same vertical level
- **Layout**: Three buttons side by side, occupying full width of game container
- **Styling**: Follow current color scheme, use styled-components
- **Labels**: 拼音, 简体, 繁体
- **Active State**: Visual indication of current mode
- **Hotkeys**: Use non-letter keys (e.g., F1, F2, F3 or 1, 2, 3)

#### Input Field Updates
- **Pinyin Mode**: Current pinyin input field
- **Simplified Mode**: Character input field expecting simplified character
- **Traditional Mode**: Character input field expecting traditional character
- **Validation**: Real-time validation for character input modes
- **Feedback**: Same visual feedback system (green/red flash)

### 3. Data Filtering
- **Pinyin Mode**: Uses all 1500 characters (current behavior)
- **Simplified/Traditional Modes**: Only use characters where simplified ≠ traditional
- **Character Range**: 50 to maximum available (539 characters)
- **Helper Script**: Create script to generate filtered character lists

### 4. Input Validation

#### Character Input Validation
- **Simplified Mode**: Check if input matches character's simplified form
- **Traditional Mode**: Check if input matches character's traditional form
- **Real-time**: Validate as user types
- **Feedback**: Same visual feedback as pinyin mode

#### New Utility Functions
- `validateCharacterInput(input: string, expected: string): boolean`
- `getFilteredCharacters(mode: string): Character[]`
- `getModeSpecificLimit(mode: string): number`

### 5. Statistics & Tracking
- **Reset on Mode Change**: All statistics reset when mode switches
- **Incorrect Answers**: Track submitted vs expected for each mode
- **Progress**: Recalculate based on mode-specific character limits
- **Previous Character**: Show mode-appropriate information

### 6. Component Updates

#### FlashCardState Interface
```typescript
interface FlashCardState {
  // ... existing fields
  mode: 'pinyin' | 'simplified' | 'traditional';
  characterInput: string; // New field for character modes
  isCharacterCorrect: boolean | null; // New field for character validation
}
```

#### FlashCardActions Interface
```typescript
interface FlashCardActions {
  // ... existing actions
  setMode: (mode: 'pinyin' | 'simplified' | 'traditional') => void;
  setCharacterInput: (input: string) => void;
  validateCharacter: () => void;
}
```

### 7. New Components

#### ModeToggleButtons.tsx
- Three styled buttons for mode switching
- Active state styling
- Keyboard shortcut handling
- Props: `currentMode`, `onModeChange`

#### CharacterInput.tsx
- Character input field for simplified/traditional modes
- Real-time validation
- Visual feedback (same as PinyinInput)
- Props: `value`, `onChange`, `expectedCharacter`, `isCorrect`, `flashResult`

### 8. Updated Components

#### FlashCards.tsx
- Add ModeToggleButtons above main Card
- Conditional rendering of PinyinInput vs CharacterInput
- Pass mode-specific props to components

#### useFlashCard.ts
- Add mode state management
- Add character input handling
- Add mode-specific character filtering
- Add statistics reset on mode change

#### CharacterDisplay.tsx
- Show only relevant character based on mode
- Pinyin mode: show both
- Simplified mode: show only traditional
- Traditional mode: show only simplified

#### IncorrectAnswers.tsx
- Update to handle character input submissions
- Show submitted character instead of pinyin when appropriate
- Maintain same table structure

### 9. Helper Scripts

#### generateModeData.js
```javascript
// Script to generate filtered character lists for each mode
const data = require('./src/data.json');

// Filter characters with different simplified/traditional forms
const differentChars = data.filter(char => char.simplified !== char.traditional);

// Generate mode-specific data files
// - pinyinMode.json (all characters)
// - simplifiedMode.json (only different characters)
// - traditionalMode.json (only different characters)
```

### 10. Testing Strategy

#### Unit Tests
- `ModeToggleButtons.test.tsx`: Button rendering, mode switching, hotkeys
- `CharacterInput.test.tsx`: Input validation, feedback, styling
- `useFlashCard.test.ts`: Mode state management, character filtering
- Updated existing tests for mode-specific behavior

#### Integration Tests
- Mode switching resets statistics
- Character input validation works correctly
- Incorrect answers tracking works for all modes
- Keyboard shortcuts work in all modes

### 11. Implementation Steps

1. **Create Helper Script**
   - Generate filtered character data for each mode
   - Update data structure to support mode-specific limits

2. **Update Types**
   - Add mode-related interfaces and types
   - Update existing interfaces for new functionality

3. **Create New Components**
   - `ModeToggleButtons.tsx`
   - `CharacterInput.tsx`
   - Update styled components

4. **Update Core Logic**
   - Modify `useFlashCard.ts` for mode management
   - Add character validation utilities
   - Update statistics reset logic

5. **Update Existing Components**
   - Modify `FlashCards.tsx` for conditional rendering
   - Update `CharacterDisplay.tsx` for mode-specific display
   - Update `IncorrectAnswers.tsx` for character submissions

6. **Add Comprehensive Tests**
   - Unit tests for all new components
   - Integration tests for mode switching
   - Updated tests for existing components

7. **Update Documentation**
   - Update README.md with new features
   - Document keyboard shortcuts
   - Explain mode differences

### 12. Technical Considerations

#### Performance
- Memoize filtered character lists
- Optimize character validation
- Lazy load mode-specific data

#### Accessibility
- Keyboard navigation for mode buttons
- Screen reader support for mode labels
- Focus management during mode switches

#### Error Handling
- Graceful fallback for invalid character input
- Clear error messages for unsupported characters
- Validation for mode-specific character limits

### 13. UI/UX Guidelines

#### Visual Design
- Maintain current color scheme and styling
- Clear visual distinction between modes
- Consistent button styling and spacing
- Responsive design for mobile devices

#### User Experience
- Smooth transitions between modes
- Clear feedback for mode switches
- Intuitive input field behavior
- Helpful error messages

#### Keyboard Shortcuts
- F1/F2/F3 or 1/2/3 for mode switching
- Maintain existing shortcuts (Enter, comma, period)
- No letter keys to avoid input interference

### 14. Data Validation

#### Character Input Validation
- Exact character matching (no normalization needed)
- Support for copy-paste
- Handle empty input gracefully
- Real-time validation feedback

#### Mode-Specific Limits
- Pinyin mode: 50-1500 characters
- Simplified/Traditional modes: 50-539 characters
- Dynamic limit adjustment based on available characters

### 15. Deployment Considerations

#### Build Process
- Include helper scripts in build
- Generate mode-specific data files
- Clean up temporary files after build

#### Testing
- Verify all modes work in production
- Test character input on different devices
- Validate keyboard shortcuts across browsers

This PRP provides a complete implementation plan that maintains the existing codebase structure while adding the new flashcard modes feature. The implementation follows the established patterns and coding standards while providing comprehensive testing and documentation. 
