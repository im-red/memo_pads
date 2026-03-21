## Context

`AddMemoOverlay.tsx` is a modal overlay for adding or editing memos. It has two textareas: `originalText` and `explanation`. Currently, users must manually type or paste content into each field.

## Goals / Non-Goals

**Goals:**
- Add a paste button to read clipboard text and auto-fill both fields
- Parse clipboard: first line → originalText, remaining lines → explanation
- Add a swap button to exchange the two field values
- Check for duplicate memos (same originalText + explanation) in current notebook before saving

**Non-Goals:**
- Auto-save on paste (always require user review and confirmation)
- Clipboard monitoring or auto-paste on overlay open
- Duplicate detection across notebooks (only current notebook)

## Decisions

### 1. Clipboard API usage

Use `navigator.clipboard.readText()` for clipboard access. This requires user gesture and shows permission prompt on first use.

**Alternatives considered:**
- `document.execCommand('paste')` - deprecated, not reliable
- Clipboard API is the modern standard and sufficient for this use case

### 2. Paste button placement

Place paste and swap buttons in a button group between the two textarea fields. This provides clear visual grouping and easy access before form submission.

**Alternatives considered:**
- Header buttons - further from input fields, less intuitive workflow
- Footer buttons - less visible, user may miss them

### 3. Duplicate check location

Perform duplicate check in `handleAddMemo` in `app.tsx` before calling `setMemos`. This centralizes memo creation logic and keeps AddMemoOverlay stateless regarding duplicates.

**Alternatives considered:**
- Check inside AddMemoOverlay - would require passing all memos or notebook memos to overlay, increasing prop complexity
- Check on form submit inside overlay - matches chosen approach but duplicates validation logic

### 4. Swap implementation

Swap button exchanges `originalText` and `explanation` state variables directly in the overlay. No backend or persistence impact.

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| Clipboard permission denied | Show error message if clipboard read fails |
| Empty clipboard | Show toast/alert "Clipboard is empty" |
| Single-line clipboard | All content goes to originalText, explanation empty |
| Duplicate detection may false-positive on whitespace | Trim both fields before comparison |
