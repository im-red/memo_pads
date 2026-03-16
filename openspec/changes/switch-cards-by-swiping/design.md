## Context

The Memo Pads application currently uses "Prev"/"Next" buttons for navigating between memo cards. While functional, this interaction pattern is suboptimal for touch devices, particularly mobile phones where gesture-based navigation is the expected standard.

**Current State:**
- Navigation relies on button clicks
- No touch gesture support
- No visual feedback during navigation
- Works on all platforms but feels clunky on mobile

**Constraints:**
- Must maintain backward compatibility with existing button navigation
- Must support both touch (mobile) and mouse (desktop) interactions
- Must not interfere with text selection on cards
- Must not conflict with explanation toggle functionality
- Should respect accessibility preferences (reduced motion)
- Implementation should be in the `MemoList` component (`src/components/memolist.tsx`)

**Stakeholders:**
- Mobile users who expect gesture-based navigation
- Desktop users who may use mouse drag gestures
- Accessibility users who rely on keyboard navigation

## Goals / Non-Goals

**Goals:**
- Implement intuitive swipe gesture navigation for memo cards
- Provide smooth visual feedback during swipe interactions
- Support both touch and mouse input methods
- Maintain existing button and keyboard navigation
- Ensure text selection and explanation toggle remain functional
- Respect user accessibility preferences

**Non-Goals:**
- Vertical swipe gestures (only horizontal navigation)
- Multi-finger gestures or complex gesture patterns
- Custom gesture library dependencies (use native touch/mouse events)
- Changes to card content or data structure
- Backend or API modifications

## Decisions

### Decision 1: Use native touch and mouse events instead of gesture library

**Choice:** Implement swipe detection using native pointer events (`pointerdown`, `pointermove`, `pointerup`) rather than adding a dependency like `@use-gesture/react`.

**Rationale:**
- The swipe gesture requirements are straightforward (horizontal drag with threshold detection)
- Native pointer events work consistently for both touch and mouse input
- Avoids adding a new dependency for a single feature
- Reduces bundle size and complexity
- Full control over gesture behavior and edge cases

**Alternatives Considered:**
- `@use-gesture/react`: More features but overkill for simple horizontal swipe
- `react-use-gesture`: Similar concerns, adds dependency weight
- Touch events only (`touchstart`, `touchmove`, `touchend`): Would need separate mouse handlers

### Decision 2: Implement swipe state machine in component

**Choice:** Track swipe state (active, direction, distance, cancelled) using React state and refs within the MemoList component.

**Rationale:**
- Keeps gesture logic encapsulated with the component
- Allows React to manage UI updates for visual feedback
- Refs for mutable state (current position) avoid unnecessary re-renders
- State for high-level status (active/inactive) triggers UI changes

**Implementation Approach:**
```typescript
// Refs for performance-critical mutable state
const swipeStartRef = useRef<{ x: number; y: number } | null>(null);
const currentOffsetRef = useRef(0);

// State for UI rendering
const [swipeState, setSwipeState] = useState<'idle' | 'swiping' | 'navigating'>('idle');
```

### Decision 3: Use CSS transforms for visual feedback

**Choice:** Apply CSS `transform: translateX()` for card movement during swipe, with CSS transitions for snap-back and slide animations.

**Rationale:**
- GPU-accelerated, smooth 60fps animations
- No layout recalculation (unlike changing `left`/`margin`)
- Easy to combine with opacity for peeking effect
- Can be controlled via React state or direct DOM manipulation

**Implementation:**
- During drag: Update transform via inline style (direct DOM for performance)
- On release: Apply CSS transition class for snap-back or slide-out
- For reduced motion: Skip transitions or use minimal movement

### Decision 4: Threshold-based navigation trigger

**Choice:** Navigate only when swipe distance exceeds a threshold (e.g., 100px or 30% of card width), otherwise snap back.

**Rationale:**
- Prevents accidental navigation from small movements
- Matches user expectations from other swipe-based interfaces
- Provides clear feedback: drag far enough = commit, otherwise cancel

**Threshold Calculation:**
```typescript
const SWIPE_THRESHOLD = Math.min(100, cardWidth * 0.3);
```

### Decision 5: Text selection detection via selection API

**Choice:** Check if text is selected when drag starts using `window.getSelection()`.

**Rationale:**
- Simple, reliable way to detect active text selection
- Prevents swipe interference when user wants to select/copy text
- Works across all browsers

**Implementation:**
```typescript
const selection = window.getSelection();
if (selection && selection.toString().length > 0) {
  // User is selecting text, ignore swipe
  return;
}
```

### Decision 6: Explanation toggle suppression during swipe

**Choice:** Track if swipe gesture is active and suppress explanation toggle logic when releasing drag on card.

**Rationale:**
- Prevents accidental explanation toggle when completing swipe
- Maintains separation between navigation and content display gestures

**Implementation:**
- Set a `swipeActiveRef.current = true` on pointerdown
- Check this flag in explanation toggle handler
- Reset to false after pointerup with slight delay

### Decision 7: Boundary feedback with bounce effect

**Choice:** At first/last card, allow slight movement but apply elastic resistance and snap back.

**Rationale:**
- Provides feedback that user is at boundary (not broken)
- Better UX than hard stop with no movement
- Common pattern in mobile interfaces (iOS scroll bounce)

**Implementation:**
```typescript
if (atBoundary && swipeDistance !== 0) {
  // Apply reduced movement with elastic factor
  const elasticOffset = swipeDistance * 0.3;
  applyTransform(elasticOffset);
}
```

### Decision 8: Peer card peeking with opacity

**Choice:** Show next/previous card peeking from the edge during swipe, with opacity proportional to swipe progress.

**Rationale:**
- Visual cue about navigation direction and target
- Confirms swipe is working and will trigger navigation
- Enhances sense of direct manipulation

**Implementation:**
- Render adjacent cards in DOM with absolute positioning
- Update opacity based on swipe progress: `opacity = Math.abs(offset) / cardWidth`

## Risks / Trade-offs

**[Risk] Performance issues with React state updates during drag**
→ **Mitigation:** Use refs and direct DOM manipulation for position updates, only use state for high-level UI state changes

**[Risk] Cross-browser pointer event inconsistencies**
→ **Mitigation:** Test on target platforms (Chrome, Firefox, Safari, mobile browsers); add polyfill if needed (unlikely for modern browsers)

**[Risk] Conflict with Capacitor or Android WebView touch handling**
→ **Mitigation:** Use `pointer-events` CSS carefully; test on actual Android device; may need to call `event.preventDefault()` selectively

**[Risk] Accessibility: Users with motor impairments may find swipe difficult**
→ **Mitigation:** Maintain button and keyboard navigation; swipe is enhancement not replacement; test with screen readers

**[Risk] Reduced motion preference implementation complexity**
→ **Mitigation:** Check `prefers-reduced-motion` media query; disable animations but keep functional swipe detection; or disable swipe entirely and rely on buttons

**[Trade-off] Custom implementation vs. gesture library**
→ Custom solution is lighter but requires more code and testing
→ Library would be more robust but adds ~10-20KB bundle size
→ **Decision:** Custom implementation for this focused use case

**[Trade-off] Inline styles vs. CSS classes for transforms**
→ Inline styles allow dynamic values but mix concerns
→ CSS classes are cleaner but need many predefined classes
→ **Decision:** Inline styles for drag (dynamic), CSS classes for animations (snap, slide)

## Migration Plan

**Phase 1: Implementation**
1. Add pointer event handlers to MemoList component
2. Implement swipe detection logic with threshold
3. Add CSS transforms for visual feedback
4. Implement boundary handling and bounce effect
5. Add text selection and explanation toggle safeguards

**Phase 2: Testing**
1. Test on desktop with mouse (Chrome, Firefox, Edge)
2. Test on mobile touch (Android WebView, iOS Safari if possible)
3. Verify keyboard navigation still works
4. Test with text selection scenarios
5. Test reduced motion preference

**Phase 3: Rollout**
1. Deploy behind feature flag if available (optional)
2. Monitor for any gesture conflicts or bugs
3. Gather user feedback on swipe sensitivity

**Rollback Strategy:**
- Simple: Comment out or remove pointer event handlers
- No data migration or schema changes required
- Button navigation remains functional throughout

## Open Questions

1. **Swipe sensitivity tuning:** What's the optimal threshold distance? Should it be fixed (100px) or relative to card width (30%)? May need user testing to calibrate.

2. **Haptic feedback:** Should we add haptic feedback on successful swipe (if device supports it via Capacitor)? This would enhance the mobile experience but requires additional implementation.

3. **Swipe direction customization:** Should left-handed users be able to reverse swipe direction? (Currently: swipe left = next, swipe right = previous)

4. **Animation duration:** What's the ideal duration for snap-back vs. slide-in animations? Standard is 150-300ms, but should test for perceived responsiveness.

5. **Mouse drag on desktop:** Is this expected or superfluous? Some desktop users may find it natural, others may accidentally trigger it. Consider making it optional or threshold higher for mouse.
