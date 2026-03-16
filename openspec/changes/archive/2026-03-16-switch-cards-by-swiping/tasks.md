## 1. Setup and Preparation

- [x] 1.1 Review MemoList component structure and identify where to add swipe handlers
- [x] 1.2 Add CSS custom properties for swipe animation durations and thresholds
- [x] 1.3 Create refs for swipe state management (swipeStartRef, currentOffsetRef, swipeActiveRef)
- [x] 1.4 Add state for swipe status tracking (idle, swiping, navigating)

## 2. Pointer Event Handlers

- [x] 2.1 Add onPointerDown handler to memo card container
- [x] 2.2 Add onPointerMove handler for tracking drag movement
- [x] 2.3 Add onPointerUp handler for completing swipe gesture
- [x] 2.4 Add onPointerCancel handler for handling interrupted gestures
- [x] 2.5 Implement pointer capture to track movement outside card bounds

## 3. Swipe Detection Logic

- [x] 3.1 Record initial pointer position on pointer down
- [x] 3.2 Calculate horizontal and vertical movement deltas on pointer move
- [x] 3.3 Implement threshold detection (100px or 30% of card width)
- [x] 3.4 Determine swipe direction (left = next, right = previous)
- [x] 3.5 Add window.getSelection() check to detect text selection
- [x] 3.6 Implement boundary detection for first/last card

## 4. Visual Feedback - Card Movement

- [x] 4.1 Apply inline transform: translateX() during drag using refs
- [x] 4.2 Implement elastic resistance at boundaries (0.3 factor)
- [x] 4.3 Add CSS transition class for snap-back animation
- [x] 4.4 Add CSS transition class for slide-out animation
- [x] 4.5 Implement snap-back when swipe distance < threshold
- [x] 4.6 Implement slide-out when swipe distance >= threshold

## 5. Adjacent Card Peeking

- [ ] 5.1 Render previous and next cards in DOM with absolute positioning
- [ ] 5.2 Calculate opacity based on swipe progress (abs(offset) / cardWidth)
- [ ] 5.3 Apply opacity to adjacent cards during swipe
- [ ] 5.4 Position next card to peek from right edge
- [ ] 5.5 Position previous card to peek from left edge

## 6. Navigation Integration

- [x] 6.1 Call existing navigation function on successful swipe left (next card)
- [x] 6.2 Call existing navigation function on successful swipe right (previous card)
- [x] 6.3 Add slide-in animation for incoming card from correct direction
- [x] 6.4 Reset swipe state after navigation completes
- [x] 6.5 Prevent multiple rapid swipes during animation

## 7. Text Selection and Explanation Toggle Safeguards

- [x] 7.1 Check window.getSelection() on pointer down
- [x] 7.2 Skip swipe detection if text is selected
- [x] 7.3 Set swipeActiveRef.current = true on pointer down
- [x] 7.4 Add swipeActiveRef check to explanation toggle handler
- [x] 7.5 Reset swipeActiveRef after pointer up with small delay (50ms)

## 8. Accessibility and Motion Preferences

- [x] 8.1 Add prefers-reduced-motion media query detection
- [x] 8.2 Disable or minimize animations when reduced motion is enabled
- [x] 8.3 Verify keyboard navigation (Tab, Enter, Arrow keys) still works
- [ ] 8.4 Test with screen reader to ensure announcements are correct
- [x] 8.5 Ensure button navigation remains functional as fallback

## 9. CSS Styling

- [x] 9.1 Add swipe-related CSS classes to memolist styles
- [x] 9.2 Define animation durations (150-300ms range)
- [x] 9.3 Add transition classes for snap-back and slide animations
- [ ] 9.4 Style adjacent card positioning for peeking effect
- [x] 9.5 Add will-change: transform for GPU acceleration
- [x] 9.6 Ensure pointer-events don't interfere with card interactions

## 10. Testing and Calibration

- [x] 10.1 Test on desktop with mouse (Chrome, Firefox, Edge)
- [ ] 10.2 Test on mobile touch (Android WebView)
- [x] 10.3 Test text selection scenarios (ensure no false triggers)
- [x] 10.4 Test explanation toggle during swipe
- [x] 10.5 Test boundary behavior at first/last card
- [x] 10.6 Test with reduced motion preference enabled
- [ ] 10.7 Calibrate swipe threshold based on user testing feedback
- [x] 10.8 Test keyboard navigation compatibility
- [x] 10.9 Test rapid successive swipes
- [x] 10.10 Verify no conflicts with Capacitor touch handling

## 11. Optional Enhancements

- [ ] 11.1 Add haptic feedback on successful swipe (via Capacitor Haptics API)
- [ ] 11.2 Consider adding configuration option for swipe sensitivity
- [ ] 11.3 Document swipe gesture in user help/onboarding
- [ ] 11.4 Add analytics to track swipe vs button usage (if analytics enabled)
