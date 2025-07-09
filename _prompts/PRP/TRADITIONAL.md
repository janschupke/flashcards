# Traditional Chinese Character Feature Implementation Plan

## Overview
This document outlines the detailed implementation plan for extending the Chinese flashcards application to support traditional characters, character display toggles, pinyin input evaluation, and scoring functionality.

## 1. Data Structure Extension

### 1.1 Traditional Character Data Source
**Source**: Use the CC-CEDICT (Chinese-English Dictionary) dataset or similar comprehensive mapping sources.

**Implementation Strategy**:
- Download traditional character mappings from reliable sources (Unicode Consortium, CC-CEDICT)
- Create a mapping table between simplified and traditional characters
- Focus on the 3000 most common characters to avoid resource constraints
- Store traditional characters in the existing data structure

### 1.2 Data Structure Updates
**Current Structure**:
```json
{
  "item": "1",
  "chinese": "我", 
  "pinyin": "wǒ",
  "english": "I ; me"
}
```

**Extended Structure**:
```json
{
  "item": "1",
  "chinese": "我",
  "traditional": "我", // Add traditional field
  "pinyin": "wǒ", 
  "english": "I ; me"
}
```

**Note**: Many characters are identical in simplified and traditional forms. Only characters that differ need separate traditional entries.

### 1.3 Data Processing Steps
1. **Source Data Collection**: Download traditional character mappings
2. **Mapping Creation**: Create simplified-to-traditional character mapping
3. **Data Integration**: Extend existing data.json with traditional field
4. **Validation**: Ensure all 3000 characters have proper mappings

## 2. UI Component Extensions

### 2.1 Character Display Toggle Component
**New Component**: `CharacterDisplayToggle`

**Features**:
- Toggle between "Simplified", "Traditional", and "Both" modes
- Radio button or dropdown selection
- Immediate visual feedback when switching modes

**Props**:
```typescript
interface CharacterDisplayToggleProps {
  displayMode: 'simplified' | 'traditional' | 'both';
  onModeChange: (mode: 'simplified' | 'traditional' | 'both') => void;
}
```

### 2.2 Pinyin Input Component
**New Component**: `PinyinInput`

**Features**:
- Text input field for pinyin entry
- Case-insensitive input handling
- Tone notation removal for comparison
- Real-time validation feedback
- Submit button or Enter key submission

**Props**:
```typescript
interface PinyinInputProps {
  currentPinyin: string; // Correct pinyin for current character
  onSubmit: (input: string) => void;
  isCorrect: boolean | null; // null = not evaluated, true/false = result
  disabled?: boolean;
}
```

### 2.3 Score Display Component
**New Component**: `ScoreDisplay`

**Features**:
- Display correct answers count
- Show total attempted count
- Calculate and display percentage
- Visual indicators for performance

**Props**:
```typescript
interface ScoreDisplayProps {
  correctAnswers: number;
  totalAttempted: number;
  percentage: number;
}
```

## 3. State Management Extensions

### 3.1 Extended FlashCard State
**Current State**:
```typescript
interface FlashCardState {
  current: number;
  limit: number;
  hint: HintType;
  totalSeen: number;
  progress: number;
}
```

**Extended State**:
```typescript
interface FlashCardState {
  current: number;
  limit: number;
  hint: HintType;
  totalSeen: number;
  progress: number;
  // New fields
  displayMode: 'simplified' | 'traditional' | 'both';
  pinyinInput: string;
  isPinyinCorrect: boolean | null;
  correctAnswers: number;
  totalAttempted: number;
}
```

### 3.2 New Actions
```typescript
interface FlashCardActions {
  // Existing actions
  getNext: () => void;
  toggleHint: (hintType: HintType) => void;
  updateLimit: (newLimit: number) => void;
  reset: () => void;
  
  // New actions
  setDisplayMode: (mode: 'simplified' | 'traditional' | 'both') => void;
  setPinyinInput: (input: string) => void;
  evaluatePinyin: () => void;
  resetScore: () => void;
}
```

## 4. Pinyin Evaluation Logic

### 4.1 Evaluation Rules
**Implementation Strategy**:
1. **Case Insensitive**: Convert input to lowercase
2. **Tone Removal**: Strip tone numbers (1-4) and neutral tone (5)
3. **Whitespace Handling**: Trim leading/trailing spaces
4. **Multiple Pinyin Support**: Handle characters with multiple pinyin readings

**Example Transformations**:
- Input: "Wǒ" → "wo" (correct)
- Input: "nǐ" → "ni" (correct) 
- Input: "shì" → "shi" (correct)
- Input: "lǚ" → "lü" (correct)

### 4.2 Pinyin Normalization Function
```typescript
function normalizePinyin(pinyin: string): string {
  return pinyin
    .toLowerCase()
    .replace(/[1-5]/g, '') // Remove tone numbers
    .replace(/ǖ/g, 'ü')
    .replace(/ǘ/g, 'ü') 
    .replace(/ǚ/g, 'ü')
    .replace(/ǜ/g, 'ü')
    .trim();
}
```

### 4.3 Evaluation Function
```typescript
function evaluatePinyinInput(userInput: string, correctPinyin: string): boolean {
  const normalizedInput = normalizePinyin(userInput);
  const normalizedCorrect = normalizePinyin(correctPinyin);
  
  // Handle multiple pinyin readings (separated by semicolons)
  const correctReadings = normalizedCorrect.split(';').map(r => r.trim());
  
  return correctReadings.includes(normalizedInput);
}
```

## 5. Component Integration

### 5.1 Main FlashCards Component Updates
**Layout Changes**:
1. Add CharacterDisplayToggle below the header
2. Add PinyinInput between CharacterDisplay and ControlButtons
3. Add ScoreDisplay below Statistics
4. Update spacing and layout for new components

### 5.2 CharacterDisplay Component Updates
**New Props**:
```typescript
interface CharacterDisplayProps {
  currentIndex: number;
  hintType: HintType;
  displayMode: 'simplified' | 'traditional' | 'both';
}
```

**Display Logic**:
- **Simplified**: Show only simplified character
- **Traditional**: Show only traditional character  
- **Both**: Show both characters side by side with labels

### 5.3 ControlButtons Component Updates
**New Features**:
- Add "Submit Pinyin" button when pinyin input is active
- Disable "Next" button until pinyin is evaluated
- Show evaluation feedback (correct/incorrect)

## 6. Data Processing Implementation

### 6.1 Traditional Character Mapping Process
**Steps**:
1. **Source Identification**: Use CC-CEDICT or Unicode mapping tables
2. **Data Download**: Fetch traditional character mappings
3. **Mapping Creation**: Create simplified-to-traditional lookup table
4. **Data Integration**: Extend existing data.json with traditional field
5. **Validation**: Ensure all characters have proper mappings

**Mapping Sources**:
- CC-CEDICT (Chinese-English Dictionary)
- Unicode Consortium mapping tables
- Open-source Chinese character datasets

### 6.2 Data Validation
**Validation Rules**:
- All characters must have traditional mappings
- Traditional characters should be valid Unicode
- Maintain data integrity with existing structure
- Handle edge cases (identical simplified/traditional characters)

## 7. Testing Strategy

### 7.1 Unit Tests
**Components to Test**:
- `CharacterDisplayToggle`
- `PinyinInput` 
- `ScoreDisplay`
- Updated `CharacterDisplay`
- Pinyin evaluation functions

**Test Cases**:
- Display mode switching
- Pinyin input validation
- Score calculation accuracy
- Edge cases in pinyin evaluation

### 7.2 Integration Tests
**Test Scenarios**:
- Complete flashcard flow with pinyin evaluation
- Score tracking across multiple cards
- Display mode persistence
- Keyboard shortcut integration

## 8. Implementation Order

### Phase 1: Data Preparation
1. Research and download traditional character mappings
2. Create simplified-to-traditional mapping table
3. Extend data.json with traditional field
4. Validate data integrity

### Phase 2: Core Logic
1. Implement pinyin evaluation functions
2. Extend useFlashCard hook with new state and actions
3. Create new component interfaces and types

### Phase 3: UI Components
1. Implement CharacterDisplayToggle component
2. Implement PinyinInput component
3. Implement ScoreDisplay component
4. Update CharacterDisplay for traditional support

### Phase 4: Integration
1. Integrate new components into main FlashCards component
2. Update styling and layout
3. Add keyboard shortcuts for new features
4. Implement comprehensive testing

### Phase 5: Polish
1. Add visual feedback and animations
2. Optimize performance
3. Update documentation
4. Final testing and bug fixes

## 9. Technical Considerations

### 9.1 Performance
- Lazy load traditional character data if needed
- Optimize pinyin evaluation for speed
- Minimize re-renders with proper memoization

### 9.2 Accessibility
- Add ARIA labels for new components
- Ensure keyboard navigation works with new features
- Provide screen reader support for pinyin input

### 9.3 Error Handling
- Handle invalid pinyin input gracefully
- Provide clear feedback for evaluation results
- Handle edge cases in character display

## 10. Success Criteria

### 10.1 Functional Requirements
- [ ] Traditional character data integrated
- [ ] Display mode toggle working
- [ ] Pinyin input and evaluation functional
- [ ] Score tracking accurate
- [ ] All existing functionality preserved

### 10.2 Quality Requirements
- [ ] All new components tested
- [ ] Performance maintained
- [ ] Accessibility standards met
- [ ] Code follows project conventions
- [ ] Documentation updated

This PRP provides a comprehensive roadmap for implementing the traditional Chinese character feature with pinyin evaluation and scoring functionality while maintaining the existing application's quality and user experience.
