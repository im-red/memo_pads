## 1. AddMemoOverlay Enhancements

- [x] 1.1 Add clipboard-paste utility function using navigator.clipboard.readText()
- [x] 1.2 Add paste button between originalText and explanation fields
- [x] 1.3 Implement clipboard parsing: first line → originalText, rest → explanation
- [x] 1.4 Add swap button next to paste button
- [x] 1.5 Implement swap functionality to exchange originalText and explanation
- [x] 1.6 Add error state for empty clipboard
- [x] 1.7 Add error state for clipboard permission denied

## 2. Duplicate Detection in App

- [x] 2.1 Modify handleAddMemo to check for duplicates before adding
- [x] 2.2 Compare trimmed originalText and explanation against existing notebook memos
- [x] 2.3 Show error "This memo already exists in the current notebook" for duplicates

## 3. Styling

- [x] 3.1 Add CSS styles for paste and swap buttons (button group between fields)
