## Why

Users often need to quickly add memos from existing text content (e.g., from a document, web page, or other app). Currently, they must manually type or copy-paste into each field separately. Adding a clipboard paste feature streamlines this workflow, reducing friction for memo creation.

## What Changes

- **Add paste button** in `AddMemoOverlay` to paste clipboard text as memo content
- **Clipboard parsing**: Use first line of clipboard as original text, remaining lines as explanation
- **Add swap button** to swap original text and explanation fields
- **Duplicate memo detection**: Check if the new memo (originalText + explanation) already exists in the current notebook before saving

## Capabilities

### New Capabilities
- `clipboard-paste`: Paste button in AddMemoOverlay that reads clipboard content, parses it into originalText (first line) and explanation (remaining lines), and pre-fills the form fields for review before saving
- `memo-swap`: Swap button to exchange originalText and explanation values
- `memo-duplicate-check`: Before saving a new memo, verify it does not already exist in the current notebook (match on both originalText and explanation)

## Impact

- **Component**: `AddMemoOverlay.tsx` - add paste and swap buttons, clipboard parsing logic, duplicate checking
- **API**: Uses Clipboard API (`navigator.clipboard.readText()`)
- **State**: `handleAddMemo` in `app.tsx` - add duplicate check before adding memo
- **No changes** to existing `Memo` type or data model
