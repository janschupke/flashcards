# Feature Overhaul Plan: Adaptive Learning System

## Overview
This document outlines a comprehensive feature overhaul to transform the flashcard application into an adaptive learning system that tracks user performance, adjusts difficulty dynamically, and provides detailed statistics. The system will use local storage for persistence and implement intelligent character selection algorithms.

---

## 1. Adaptive Character Set

### Current State
- Fixed character range input (50-1500)
- User manually selects how many characters to practice
- No tracking of which characters need more practice

### Proposed Changes

#### 1.1 Remove Range Input
**Files to Remove:**
- `src/components/input/RangeInput.tsx` - Delete file
- `src/hooks/useRangeInput.ts` - Delete file
- `src/hooks/useRangeNavigation.ts` - Delete file

**Files to Modify:**
- `src/components/layout/TopControls.tsx` - Remove RangeInput component usage

**Changes:**
- Remove range input UI element from TopControls
- Remove range-related props from component chain (AppLayout → Navigation → TopControls)
- Remove range-related state from useFlashCard hook
- Update types to remove range-related properties

**Benefits:**
- Simpler UI
- Focus on adaptive learning rather than manual selection
- Less cognitive load for users

---

## 2. Reset Statistics Button

### Current State
- Answer counter displays correct/total
- No way to reset statistics
- Statistics reset on mode change

### Proposed Changes

#### 2.1 Add Reset Button
**File:** `src/components/layout/TopControls.tsx`

**Implementation:**
- Add reset button next to answers counter
- Button should be small, secondary variant
- Text: "Reset"
- Position: Between range input location and answers counter

**Functionality:**
- Wipes all local storage data (character performance, history, counters, previous answer, adaptive range)
- Shows confirmation modal (custom component, not browser confirm)
- Modal should have:
  - Title: "Reset Statistics?"
  - Message: "This will permanently delete all your progress, statistics, and history. This action cannot be undone."
  - Buttons: "Cancel" and "Confirm Reset"
  - Confirm button should be destructive (red/error variant)
- After confirmation, clear all storage and reset in-memory state
- Does NOT reset current character or mode (user continues with current card)

**Files to Create:**
- `src/components/common/ConfirmModal.tsx` - Reusable confirmation modal component

**Files to Modify:**
- `src/components/layout/TopControls.tsx` - Add reset button with modal
- `src/utils/storageUtils.ts` - Add clearAllStorage function
- `src/hooks/useFlashCard.ts` - Add resetStatistics function

**Testing:**
- Test reset button opens confirmation modal
- Test cancel button closes modal without action
- Test confirm button clears all local storage
- Test reset button clears in-memory statistics
- Test reset button does not affect current character
- Test reset button does not affect current mode
- Test modal accessibility (keyboard navigation, focus management)

---

## 3. Character Performance Tracking in Local Storage

### Current State
- No persistent storage of character performance
- Statistics reset on page refresh
- No per-character tracking

### Proposed Changes

#### 3.1 Create Storage Utilities
**File:** `src/utils/storageUtils.ts` (new file)

**Data Structure:**
```typescript
interface CharacterPerformance {
  characterIndex: number;
  correct: number;
  total: number;
  lastSeen?: number; // timestamp
}

interface StorageData {
  characterPerformance: CharacterPerformance[];
  // Other storage data (history, etc.)
}
```

**Functions:**
- `getCharacterPerformance(characterIndex: number): CharacterPerformance | null`
- `updateCharacterPerformance(characterIndex: number, isCorrect: boolean): void`
- `getAllCharacterPerformance(): CharacterPerformance[]`
- `clearCharacterPerformance(): void`
- `getStorageData(): StorageData`
- `saveStorageData(data: StorageData): void`

**Storage Key:** `flashcard-performance`

**Implementation Details:**
- Store as single array of objects
- Only store characters that have been answered (have a score)
- Update on every answer submission
- Local storage is source of truth (always up-to-date)
- Use JSON.stringify/parse for storage

**Files to Create:**
- `src/utils/storageUtils.ts` - Storage utility functions
- `src/types/storage.ts` - Storage-related types

**Files to Modify:**
- `src/hooks/useFlashCard.ts` - Integrate storage updates
- `src/components/core/FlashCards.tsx` - Initialize from storage on mount

**Testing:**
- Test storing character performance
- Test retrieving character performance
- Test updating existing character performance
- Test clearing character performance
- Test persistence across page refreshes
- Test handling corrupted/invalid storage data

---

## 4. Adaptive Character Selection Algorithm

### Current State
- Random selection from character pool
- No consideration of user performance
- All characters have equal probability

### Proposed Changes

#### 4.1 Create Adaptive Selection Algorithm
**File:** `src/utils/adaptiveUtils.ts` (new file)

**Algorithm Logic:**
1. Calculate success rate for each character in the current range
2. Identify characters with lower success rates (need more practice)
3. Weight selection probability based on success rate
4. Ensure no character has >50% selection probability
5. Fallback to random if no performance data exists

**Configuration Constants:**
```typescript
export const ADAPTIVE_CONFIG = {
  MIN_SELECTION_CHANCE: 0.1, // Minimum 10% chance for any character
  MAX_SELECTION_CHANCE: 0.5, // Maximum 50% chance (never over 50%)
  WEIGHT_MULTIPLIER: 2.0, // How much to weight struggling characters
  MIN_ATTEMPTS_FOR_ADAPTIVE: 3, // Need at least 3 attempts before adaptive kicks in
} as const;
```

**Algorithm Steps:**
1. Get all characters in current adaptive range
2. For each character, get performance data (or default to 0 correct, 0 total)
3. Calculate success rate: `correct / total` (or 1.0 if no attempts)
4. Calculate weight: `1 - successRate` (lower success = higher weight)
5. Normalize weights so sum = 1
6. Apply min/max constraints (no character <10% or >50%)
7. Select character using weighted random

**Functions:**
- `calculateCharacterWeights(characters: number[], performance: CharacterPerformance[]): number[]`
- `selectAdaptiveCharacter(characters: number[], performance: CharacterPerformance[]): number`
- `getSuccessRate(performance: CharacterPerformance | null): number`

**Files to Create:**
- `src/utils/adaptiveUtils.ts` - Adaptive selection algorithm
- `src/constants/adaptive.ts` - Adaptive configuration constants

**Files to Modify:**
- `src/hooks/useFlashCard.ts` - Use adaptive selection instead of random
- `src/utils/characterUtils.ts` - Update getRandomCharacterIndex or create new function
- `src/components/core/FlashCards.tsx` - Show adaptive range on main page

**Testing:**
- Test weighted selection favors struggling characters
- Test max 50% probability constraint
- Test min 10% probability constraint
- Test fallback to random when no data
- Test algorithm with various performance scenarios
- Test edge cases (all perfect, all failing, mixed)

---

## 5. Adaptive Range Expansion

### Current State
- Fixed character range
- User manually controls range

### Proposed Changes

#### 5.1 Implement Progressive Range Expansion
**Configuration Constants:**
```typescript
export const ADAPTIVE_RANGE_CONFIG = {
  INITIAL_RANGE: 100, // Start with first 100 characters
  EXPANSION_INTERVAL: 10, // Check every 10 answers
  EXPANSION_AMOUNT: 10, // Add 10 characters when expanding
  SUCCESS_THRESHOLD: 0.8, // 80% success rate required
  MIN_ATTEMPTS_FOR_EXPANSION: 10, // Need at least 10 attempts before checking
} as const;
```

**Logic:**
1. Start with first `INITIAL_RANGE` characters (100)
2. Track answer count since last expansion check
3. Every `EXPANSION_INTERVAL` answers (10), check success rate
4. Calculate success rate for current range: `totalCorrect / totalAttempted`
5. If success rate >= `SUCCESS_THRESHOLD` (80%) and attempts >= `MIN_ATTEMPTS_FOR_EXPANSION`:
   - Expand range by `EXPANSION_AMOUNT` (10 characters)
   - Reset expansion check counter
6. Store current adaptive range in local storage
7. Restore adaptive range on app load

**State Management:**
- Add `adaptiveRange: number` to FlashCardState
- Add `answersSinceLastCheck: number` to track interval
- Store adaptive range in local storage

**Files to Create:**
- `src/constants/adaptive.ts` - Adaptive range configuration

**Files to Modify:**
- `src/hooks/useFlashCard.ts` - Add adaptive range logic
- `src/types/index.ts` - Add adaptiveRange to state
- `src/utils/storageUtils.ts` - Store/retrieve adaptive range
- `src/components/core/FlashCards.tsx` - Display current adaptive range on main page
- `src/components/layout/TopControls.tsx` - Show adaptive range indicator

**Testing:**
- Test initial range is 100
- Test expansion after 10 answers with >80% success
- Test no expansion if success rate <80%
- Test no expansion if attempts <10
- Test range persists across page refresh
- Test expansion happens incrementally (100 → 110 → 120, etc.)
- Test expansion stops at maximum available characters (1500)

---

## 6. Local Storage for History and Statistics

### Current State
- History (allAnswers) stored only in memory
- Previous character stored only in memory
- Answer counters stored only in memory
- All data lost on page refresh

### Proposed Changes

#### 6.1 Store History in Local Storage
**Data Structure:**
```typescript
interface StoredHistory {
  answers: Answer[];
  maxEntries: number; // 100
  lastUpdated: number; // timestamp
}
```

**Implementation:**
- Store last 100 answer entries
- Use FIFO (First In, First Out) when limit reached
- Update on every answer submission
- Load on app initialization
- Local storage is source of truth (always up-to-date)

**Storage Key:** `flashcard-history`

#### 6.2 Store Answer Counters
**Data Structure:**
```typescript
interface StoredCounters {
  correctAnswers: number;
  totalSeen: number;
  totalAttempted: number;
  lastUpdated: number;
}
```

**Implementation:**
- Store current answer counters
- Update on every answer submission
- Load on app initialization
- Local storage is source of truth (always up-to-date)

**Storage Key:** `flashcard-counters`

#### 6.3 Store Previous Answer
**Data Structure:**
- Store the most recent previousAnswer
- Update when new answer is submitted
- Load on app initialization

**Storage Key:** `flashcard-previous-answer`

**Files to Modify:**
- `src/utils/storageUtils.ts` - Add history, counters, previous answer functions
- `src/hooks/useFlashCard.ts` - Save to storage on updates, load on init
- `src/components/core/FlashCards.tsx` - Initialize from storage

**Functions to Add:**
- `saveHistory(answers: Answer[]): void`
- `loadHistory(): Answer[]`
- `saveCounters(counters: StoredCounters): void`
- `loadCounters(): StoredCounters | null`
- `savePreviousAnswer(answer: Answer | null): void`
- `loadPreviousAnswer(): Answer | null`

**Testing:**
- Test history persists across page refresh
- Test history limited to 100 entries
- Test FIFO behavior when limit reached
- Test counters persist across page refresh
- Test previous answer persists
- Test handling corrupted storage data
- Test performance with large history arrays

---

## 7. Statistics Tab/Section

### Current State
- History tab shows all answers in table format
- No per-character statistics
- No overview of learning progress

### Proposed Changes

#### 7.1 Create Statistics Component
**File:** `src/components/feedback/Statistics.tsx` (new or update existing)

**Display:**
- Table or list of encountered characters
- For each character:
  - Character display (simplified/traditional)
  - Pinyin
  - English
  - Correct count
  - Total attempts
  - Success rate (percentage)
  - Color coding (green for >80%, yellow for 50-80%, red for <50%)

**Features:**
- Sortable columns (by success rate, attempts, character, etc.)
- Filterable (show all, show struggling, show mastered)
- Search functionality
- Export statistics (optional)

**Data Source:**
- Load from local storage (characterPerformance)
- Local storage is always kept up-to-date (no merging needed)
- Display reflects current state from storage

**Layout:**
- Add as new tab or section within existing tabs
- Consider adding to History tab as a subsection
- Or create separate "Statistics" tab

**Files to Create/Modify:**
- `src/components/feedback/Statistics.tsx` - Statistics display component
- `src/components/core/FlashCards.tsx` - Add statistics tab/section
- `src/types/layout.ts` - Add Statistics tab if needed

**Testing:**
- Test statistics display all encountered characters
- Test statistics show correct counts
- Test statistics show success rates
- Test color coding based on success rate
- Test sorting functionality
- Test filtering functionality
- Test real-time updates

---

## 8. Configuration Constants

### Current State
- Some magic numbers scattered in code
- Hardcoded values in algorithms

### Proposed Changes

#### 8.1 Create Adaptive Configuration File
**File:** `src/constants/adaptive.ts` (new file)

**Constants to Define:**
```typescript
export const ADAPTIVE_CONFIG = {
  // Selection algorithm
  MIN_SELECTION_CHANCE: 0.1, // 10% minimum
  MAX_SELECTION_CHANCE: 0.5, // 50% maximum
  WEIGHT_MULTIPLIER: 2.0,
  MIN_ATTEMPTS_FOR_ADAPTIVE: 3,

  // Range expansion
  INITIAL_RANGE: 100,
  EXPANSION_INTERVAL: 10, // answers
  EXPANSION_AMOUNT: 10, // characters
  SUCCESS_THRESHOLD: 0.8, // 80%
  MIN_ATTEMPTS_FOR_EXPANSION: 10,

  // Storage limits
  MAX_HISTORY_ENTRIES: 100,
} as const;
```

**Files to Create:**
- `src/constants/adaptive.ts` - All adaptive learning constants

**Files to Modify:**
- Replace all hardcoded numbers with constants
- Update all files using adaptive logic to import from constants

**Testing:**
- Test constants are used throughout codebase
- Test no hardcoded numbers remain
- Test constants can be easily adjusted

---

## 9. Implementation Phases

### Phase 1: Foundation (Storage & Tracking)
1. Create storage utilities (`storageUtils.ts`)
2. Create storage types (`types/storage.ts`)
3. Implement character performance tracking
4. Store/load character performance from local storage
5. Update useFlashCard to save performance on each answer

**Estimated Impact:** Enables all future features, no UI changes yet

### Phase 2: Remove Range Input
1. Delete RangeInput component file
2. Delete useRangeInput hook file
3. Delete useRangeNavigation hook file
4. Remove RangeInput from TopControls
5. Remove range-related props from component chain
6. Remove range-related state from useFlashCard
7. Update types to remove range properties

**Estimated Impact:** Simpler UI, prepares for adaptive range

### Phase 3: Adaptive Range Expansion
1. Create adaptive range constants
2. Implement range expansion logic
3. Add adaptiveRange to state
4. Store/load adaptive range from storage
5. Display current range on main page
6. Create toast notification component
7. Show toast when range expands

**Estimated Impact:** Automatic progression through character set with user feedback

### Phase 4: Adaptive Selection Algorithm
1. Create adaptive utilities (`adaptiveUtils.ts`)
2. Implement weighted selection algorithm
3. Integrate with useFlashCard
4. Test algorithm with various scenarios

**Estimated Impact:** Characters needing practice shown more often

### Phase 5: History & Counters Persistence
1. Implement history storage (last 100 entries)
2. Implement counters storage
3. Implement previous answer storage
4. Load all data on app initialization
5. Local storage is source of truth (always up-to-date, no merging needed)

**Estimated Impact:** Data persists across sessions

### Phase 6: Reset Button & Confirm Modal
1. Create ConfirmModal component
2. Add reset button to TopControls
3. Implement reset functionality with modal
4. Clear all statistics and storage on confirm
5. Test modal accessibility

**Estimated Impact:** Users can start fresh with confirmation

### Phase 7: Statistics Display
1. Create/update Statistics component
2. Load data from storage (always up-to-date, no merging)
3. Display character performance table
4. Add sorting and filtering
5. Add to navigation/tabs

**Estimated Impact:** Users can see detailed progress

### Phase 8: About Section
1. Create About component
2. Add app introduction
3. Document usage instructions
4. Explain adaptive algorithm
5. Add to navigation/tabs

**Estimated Impact:** Users understand how the app works

### Phase 9: Documentation Update
1. Update README.md with complete feature list
2. Document all current features after overhaul
3. Include usage instructions
4. Include algorithm explanation
5. Update screenshots if needed

**Estimated Impact:** Complete documentation of app state

---

## 10. Data Flow

### Answer Submission Flow:
1. User submits answer
2. Evaluate answer (correct/incorrect)
3. Create Answer object
4. Update in-memory state (allAnswers, previousAnswer, counters)
5. Update character performance in storage
6. Update history in storage (FIFO if >100)
7. Update counters in storage
8. Update previous answer in storage
9. Check if expansion interval reached
10. If yes, check success rate and expand range if needed
11. Select next character using adaptive algorithm

### App Initialization Flow:
1. Load character performance from storage
2. Load history from storage
3. Load counters from storage
4. Load previous answer from storage
5. Load adaptive range from storage (or use initial)
6. Initialize flashcard state with loaded data (storage is source of truth)
7. If storage is empty, use default initial values

---

## 11. Storage Schema

### Local Storage Keys:
- `flashcard-performance` - Array of CharacterPerformance objects
- `flashcard-history` - Array of Answer objects (max 100)
- `flashcard-counters` - StoredCounters object
- `flashcard-previous-answer` - Answer object or null
- `flashcard-adaptive-range` - number (current adaptive range)

### Data Migration:
- Consider versioning storage data
- Handle migration from old format if needed
- Provide clear error handling for corrupted data

---

## 12. User Experience Considerations

### Progressive Disclosure:
- Start simple (first 100 characters)
- Automatically expand as user improves
- No manual configuration needed

### Feedback:
- Show current adaptive range on main page (always visible)
- Show toast notification when range expands (top center)
- Statistics tab shows detailed progress

### Performance:
- Local storage operations should be fast
- Debounce storage writes if needed
- Optimize storage reads/writes for efficiency

### Privacy:
- All data stored locally
- No server communication
- User can clear all data with reset button

### About Section:
- Add "About" section/tab introducing the app
- Explain usage and how to use the app
- Explain the adaptive algorithm and how it works
- Include information about:
  - How character selection works
  - How range expansion works
  - What statistics are tracked
  - How to interpret success rates

---

## 13. Testing Strategy

### Comprehensive Testing Plan

#### 13.1 Unit Tests

**Storage Utilities:**
- `saveCharacterPerformance` - saves performance data
- `loadCharacterPerformance` - loads performance data
- `updateCharacterPerformance` - updates existing performance
- `clearCharacterPerformance` - clears all performance data
- `saveHistory` - saves answer history (FIFO when >100)
- `loadHistory` - loads answer history
- `saveCounters` - saves answer counters
- `loadCounters` - loads answer counters
- `savePreviousAnswer` - saves previous answer
- `loadPreviousAnswer` - loads previous answer
- `saveAdaptiveRange` - saves current range
- `loadAdaptiveRange` - loads current range
- `clearAllStorage` - clears all storage data
- Handle corrupted/invalid JSON
- Handle missing storage keys
- Handle storage quota exceeded

**Adaptive Algorithm:**
- `calculateCharacterWeights` - calculates selection weights
- `selectAdaptiveCharacter` - selects character using weights
- `getSuccessRate` - calculates success rate
- Test min/max probability constraints
- Test fallback to random when no data
- Test with various performance scenarios
- Test edge cases (all perfect, all failing, mixed)

**Range Expansion:**
- `checkRangeExpansion` - checks if range should expand
- `expandRange` - expands range by configured amount
- Test expansion after interval
- Test no expansion if success rate too low
- Test no expansion if attempts too few
- Test expansion stops at max characters

**Toast Component:**
- Renders toast message
- Auto-dismisses after timeout
- Handles multiple toasts
- Positioned top center

**Confirm Modal:**
- Renders modal with message
- Handles cancel action
- Handles confirm action
- Keyboard navigation (Escape to cancel, Enter to confirm)
- Focus management

#### 13.2 Integration Tests

**Answer Submission Flow:**
- Submit answer → update performance → save to storage
- Submit answer → update history → save to storage (FIFO)
- Submit answer → update counters → save to storage
- Submit answer → update previous answer → save to storage
- Submit answer → check expansion interval → expand if needed
- Submit answer → show toast on expansion

**App Initialization:**
- Load all data from storage on mount
- Initialize state with loaded data
- Handle empty storage (first time user)
- Handle partial storage (some keys missing)

**Adaptive Selection:**
- Select character using adaptive algorithm
- Verify struggling characters appear more often
- Verify no character exceeds 50% probability
- Verify fallback to random when appropriate

**Range Expansion Scenarios:**
- Expand after 10 answers with >80% success
- No expansion with <80% success
- No expansion with <10 attempts
- Multiple expansions (100 → 110 → 120)
- Expansion stops at 1500

**Reset Functionality:**
- Open reset modal
- Cancel reset (no changes)
- Confirm reset (clears all storage)
- Verify state resets but current character/mode preserved

**Statistics Display:**
- Load statistics from storage
- Display all encountered characters
- Show correct/total counts
- Show success rates
- Color coding based on success rate
- Sorting functionality
- Filtering functionality

#### 13.3 End-to-End Tests

**Complete User Flow:**
1. First time user (empty storage)
2. Answer 10 questions
3. Verify performance tracking
4. Verify range expansion (if >80% success)
5. Verify adaptive selection favors struggling characters
6. Refresh page → verify data persists
7. View statistics → verify data displayed
8. Reset statistics → verify all cleared
9. Continue practicing → verify fresh start

**Edge Cases:**
- Empty storage (first time user)
- Corrupted storage data (invalid JSON)
- Storage quota exceeded
- All characters mastered (>80% success)
- All characters failing (<50% success)
- Mixed performance (some good, some bad)
- Rapid answer submissions
- Browser storage disabled
- Very large history (>100 entries, test FIFO)
- Maximum range reached (1500 characters)

#### 13.4 Performance Tests

- Storage write performance (should be <10ms)
- Storage read performance (should be <5ms)
- Adaptive selection algorithm performance
- Statistics rendering with many characters
- Toast notification performance

#### 13.5 Accessibility Tests

- Confirm modal keyboard navigation
- Toast announcements for screen readers
- Statistics table accessibility
- Reset button accessibility
- About section readability

#### 13.6 Test Files to Create/Update

**New Test Files:**
- `src/utils/storageUtils.test.ts`
- `src/utils/adaptiveUtils.test.ts`
- `src/components/common/ConfirmModal.test.tsx`
- `src/components/common/Toast.test.tsx`
- `src/components/feedback/Statistics.test.tsx` (update existing)
- `src/components/feedback/About.test.tsx`

**Update Existing Test Files:**
- `src/hooks/useFlashCard.test.ts` - Add adaptive selection tests
- `src/components/core/FlashCards.test.tsx` - Add storage initialization tests
- `src/components/layout/TopControls.test.tsx` - Add reset button tests

#### 13.7 Test Coverage Goals

- **Storage utilities:** 100% coverage
- **Adaptive algorithm:** 100% coverage
- **Range expansion:** 100% coverage
- **Components:** >90% coverage
- **Hooks:** >90% coverage
- **Edge cases:** All identified edge cases tested

---

## 14. Migration Checklist

For each feature:
- [ ] Create new files (utilities, types, constants)
- [ ] Write unit tests
- [ ] Update existing components/hooks
- [ ] Update types
- [ ] Test storage persistence
- [ ] Test edge cases
- [ ] Update documentation
- [ ] Manual testing in browser
- [ ] Verify no regressions

---

## 15. Configuration Reference

### All Configurable Values:

```typescript
// src/constants/adaptive.ts

export const ADAPTIVE_CONFIG = {
  // Character Selection
  MIN_SELECTION_CHANCE: 0.1,        // Minimum probability for any character
  MAX_SELECTION_CHANCE: 0.5,        // Maximum probability (never over 50%)
  WEIGHT_MULTIPLIER: 2.0,           // How much to favor struggling characters
  MIN_ATTEMPTS_FOR_ADAPTIVE: 3,     // Attempts needed before adaptive kicks in

  // Range Expansion
  INITIAL_RANGE: 100,                // Starting character count
  EXPANSION_INTERVAL: 10,            // Check every N answers
  EXPANSION_AMOUNT: 10,              // Add N characters when expanding
  SUCCESS_THRESHOLD: 0.8,            // 80% success rate required
  MIN_ATTEMPTS_FOR_EXPANSION: 10,    // Minimum attempts before checking

  // Storage
  MAX_HISTORY_ENTRIES: 100,          // Maximum history entries to store
} as const;
```

---

## 16. Benefits

### User Benefits:
- **Personalized Learning:** System adapts to individual performance
- **Efficient Practice:** More time on challenging characters
- **Progress Tracking:** Detailed statistics and history
- **Automatic Progression:** No manual range selection needed
- **Data Persistence:** Progress saved across sessions

### Technical Benefits:
- **Maintainable:** All configuration in constants
- **Testable:** Clear separation of concerns
- **Extensible:** Easy to add new adaptive features
- **Performant:** Local storage, no server needed

---

## 17. Risks and Mitigation

### Risk 1: Storage Quota Exceeded
**Mitigation:**
- Limit history to 100 entries
- Only store characters with scores
- Implement cleanup of old data
- Handle storage errors gracefully

### Risk 2: Algorithm Complexity
**Mitigation:**
- Keep algorithm simple and well-documented
- Test with various scenarios
- Allow fallback to random selection
- Make weights configurable

### Risk 3: Performance Issues
**Mitigation:**
- Debounce storage writes
- Use efficient data structures
- Profile storage operations
- Optimize storage reads/writes for efficiency

### Risk 4: User Confusion
**Mitigation:**
- Clear UI indicators
- About section with full explanations
- Simple default behavior
- Easy reset option
- Toast notifications for important events

---

## 18. Toast Notification Component

### Current State
- No notification system
- No feedback when range expands

### Proposed Changes

#### 18.1 Create Toast Component
**File:** `src/components/common/Toast.tsx` (new file)

**Features:**
- Display message at top center of screen
- Auto-dismiss after configured timeout (e.g., 3 seconds)
- Support for different variants (success, info, warning)
- Smooth slide-in/slide-out animation
- Stack multiple toasts if needed
- Accessible (ARIA live region)

**Usage:**
- Show toast when adaptive range expands
- Message: "Range expanded! Now practicing characters 1-110"
- Success variant (green)

**Files to Create:**
- `src/components/common/Toast.tsx` - Toast component
- `src/components/common/ToastContainer.tsx` - Container for managing toasts
- `src/hooks/useToast.ts` - Hook for showing toasts

**Files to Modify:**
- `src/components/core/FlashCards.tsx` - Use toast on range expansion
- `src/components/layout/AppLayout.tsx` - Add ToastContainer

**Testing:**
- Test toast appears on range expansion
- Test toast auto-dismisses
- Test toast positioning (top center)
- Test multiple toasts stacking
- Test accessibility announcements

---

## 19. About Section

### Current State
- No documentation within app
- Users may not understand adaptive algorithm
- No usage instructions

### Proposed Changes

#### 19.1 Create About Component
**File:** `src/components/feedback/About.tsx` (new file)

**Content Sections:**

1. **App Introduction**
   - What the app does
   - Learning goals
   - Key features overview

2. **How to Use**
   - Basic usage instructions
   - Mode selection (Pinyin, Simplified, Traditional)
   - Hint buttons
   - Keyboard shortcuts
   - Navigation

3. **Adaptive Algorithm Explained**
   - How character selection works
   - Weighted selection favoring struggling characters
   - Probability constraints (10%-50%)
   - Why this helps learning

4. **Range Expansion**
   - Starting range (100 characters)
   - Expansion criteria (80% success, 10 attempts)
   - Expansion amount (10 characters)
   - Check interval (every 10 answers)

5. **Statistics**
   - What is tracked
   - How to interpret success rates
   - Color coding explanation

6. **Tips for Learning**
   - Best practices
   - How to use hints effectively
   - Understanding your progress

**Layout:**
- Add as new tab "About" in navigation
- Or add as section within existing tabs
- Scrollable content with clear sections
- Use cards or sections for organization

**Files to Create:**
- `src/components/feedback/About.tsx` - About component
- `src/types/layout.ts` - Add About tab if needed

**Files to Modify:**
- `src/components/core/FlashCards.tsx` - Add About tab/section
- `src/components/layout/Navigation.tsx` - Add About tab

**Testing:**
- Test About section renders
- Test all sections are present
- Test content is readable
- Test navigation to About tab

---

## 20. README Update

### Current State
- README may be outdated
- Doesn't reflect new adaptive features
- Missing usage instructions

### Proposed Changes

#### 20.1 Comprehensive README Update
**File:** `README.md`

**Sections to Include:**

1. **Project Overview**
   - What the app is
   - Main features
   - Technology stack

2. **Features**
   - Complete list of all features after overhaul:
     - Adaptive character selection
     - Progressive range expansion
     - Performance tracking
     - Statistics display
     - History tracking
     - Local storage persistence
     - Reset functionality
     - Toast notifications
     - About section

3. **Getting Started**
   - Installation instructions
   - Development setup
   - Running the app

4. **Usage**
   - How to use the app
   - Mode selection
   - Keyboard shortcuts
   - Understanding statistics
   - Using the reset function

5. **Adaptive Learning System**
   - How the algorithm works
   - Range expansion explained
   - Character selection logic
   - Configuration options

6. **Development**
   - Project structure
   - Key files and folders
   - Testing
   - Building

7. **Configuration**
   - All configurable constants
   - How to adjust adaptive behavior

**Files to Modify:**
- `README.md` - Complete rewrite/update

**Testing:**
- Verify all features documented
- Verify instructions are clear
- Verify examples work
- Verify links are valid

---

## 21. Notes

- This overhaul significantly changes the app's behavior
- Consider feature flag for gradual rollout
- Maintain backward compatibility where possible
- Document breaking changes
- Update user documentation

---

**Document Version:** 1.0
**Last Updated:** 2024
**Status:** Draft - Ready for Implementation Planning

