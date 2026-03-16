## Why

Currently, users must click the "Prev"/"Next" buttons to navigate between memo cards. On touch devices (especially mobile), this is cumbersome and unintuitive. Adding swipe gestures will provide a more natural, fluid navigation experience that matches user expectations from modern mobile apps.

## What Changes

- Add horizontal swipe gesture detection to memo cards
- Swipe left → Next card, Swipe right → Previous card
- Add smooth slide animations during swipe for intuitive feedback
- Ensure swipe doesn't conflict with text selection on the card
- Support both touch (mobile) and mouse drag (desktop) interactions
- Maintain existing button navigation as a fallback

## Capabilities

### New Capabilities
- `card-swipe-navigation`: Touch and mouse swipe gestures for switching memo cards with intuitive slide animations

### Modified Capabilities
- (none - this is a pure UI/UX enhancement without changing spec-level behavior)

## Impact

- **Affected Components**: `MemoList` component (`src/components/memolist.tsx`)
- **New Dependencies**: May need a gesture library (e.g., `@use-gesture/react` or native touch events)
- **CSS Changes**: Add swipe animation styles, transform transitions
- **Accessibility**: Ensure keyboard navigation still works; consider reduced-motion preference
