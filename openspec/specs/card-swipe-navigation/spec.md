# card-swipe-navigation Specification

## Purpose
TBD - created by archiving change switch-cards-by-swiping. Update Purpose after archive.
## Requirements
### Requirement: Swipe gesture detection
The system SHALL detect horizontal swipe gestures on memo cards to trigger navigation.

#### Scenario: Swipe left to next card
- **WHEN** user swipes left on the memo card content area
- **THEN** the system navigates to the next memo card

#### Scenario: Swipe right to previous card
- **WHEN** user swipes right on the memo card content area
- **THEN** the system navigates to the previous memo card

#### Scenario: Insufficient swipe distance
- **WHEN** user performs a horizontal drag less than the minimum threshold distance
- **THEN** the card snaps back to its original position without navigation

### Requirement: Touch and mouse support
The system SHALL support swipe gestures on both touch devices and desktop with mouse.

#### Scenario: Touch swipe on mobile
- **WHEN** user touches and drags the memo card on a touch device
- **THEN** the system detects the swipe gesture and responds appropriately

#### Scenario: Mouse drag on desktop
- **WHEN** user clicks and drags the memo card with a mouse
- **THEN** the system detects the drag gesture and responds appropriately

### Requirement: Visual feedback during swipe
The system SHALL provide visual feedback during swipe gestures to indicate the navigation direction.

#### Scenario: Card follows finger/cursor during drag
- **WHEN** user drags the memo card horizontally
- **THEN** the card moves with the drag, following the finger or cursor position

#### Scenario: Next/previous card peeks during drag
- **WHEN** user drags the card toward the next or previous card
- **THEN** the target card peeks from the appropriate edge with opacity based on drag distance

#### Scenario: Card slides out on successful swipe
- **WHEN** user completes a swipe exceeding the threshold
- **THEN** the current card animates sliding out in the swipe direction

#### Scenario: Next card slides in from correct direction
- **WHEN** user swipes left to navigate to the next card
- **THEN** the next card slides in from the right side

#### Scenario: Previous card slides in from correct direction
- **WHEN** user swipes right to navigate to the previous card
- **THEN** the previous card slides in from the left side

#### Scenario: Card snaps back on cancelled swipe
- **WHEN** user releases a drag that did not exceed the threshold
- **THEN** the card animates snapping back to its original position

### Requirement: Text selection compatibility
The system SHALL not trigger swipe navigation when the user is selecting text.

#### Scenario: Text selection prevents swipe
- **WHEN** user starts a drag on selected text or creates a text selection
- **THEN** the swipe navigation is not triggered

### Requirement: Explanation toggle compatibility
The system SHALL not toggle explanation display when a swipe gesture is in progress.

#### Scenario: Swipe prevents explanation toggle
- **WHEN** user performs a swipe gesture
- **THEN** the explanation display is not toggled when releasing the drag

### Requirement: Boundary handling
The system SHALL disable swipe navigation when at the first or last card.

#### Scenario: Cannot swipe past first card
- **GIVEN** user is viewing the first memo card
- **WHEN** user attempts to swipe right
- **THEN** the card does not navigate and may show a bounce effect

#### Scenario: Cannot swipe past last card
- **GIVEN** user is viewing the last memo card
- **WHEN** user attempts to swipe left
- **THEN** the card does not navigate and may show a bounce effect

### Requirement: Accessibility support
The system SHALL respect user motion preferences and maintain keyboard navigation.

#### Scenario: Reduced motion preference
- **GIVEN** user has enabled reduced motion preference
- **WHEN** swipe navigation occurs
- **THEN** animations are minimized or disabled

#### Scenario: Keyboard navigation unchanged
- **WHEN** user uses keyboard navigation (Tab, Enter, Arrow keys)
- **THEN** the existing keyboard navigation behavior remains functional

