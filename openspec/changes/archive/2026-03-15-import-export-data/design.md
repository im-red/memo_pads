## Context

The Memo Pads application currently has import/export functionality at the notebook level, which is confusing for users. The data format is JSON containing notebooks, memos, and viewProgress. Currently:
- Export dumps all data without selection
- Import overwrites all existing data
- WeRead import is mixed with general data import

Users need granular control over what data to import/export, and imports should merge rather than replace.

## Goals / Non-Goals

**Goals:**
- Application-level import/export with notebook selection
- Merge import: add new memos, preserve existing ones
- Duplicate detection: skip memos where both originalText and explanation match
- Move WeRead import to notebook level only
- Clear separation between data management (app-level) and notebook-specific features

**Non-Goals:**
- Sync between devices
- Cloud storage integration
- Import from other vocabulary apps (Anki, Quizlet, etc.)

## Decisions

### 1. Export Data Flow
**Decision**: Multi-step overlay with checkbox selection
- Step 1: Show list of all notebooks with checkboxes (all selected by default)
- Step 2: Show preview of what will be exported (notebook count, memo count)
- Step 3: Generate JSON and download/save

**Rationale**: Simple checkbox list is familiar and efficient. Preview prevents accidental partial exports.

**Alternatives considered**:
- Single dialog with checkboxes: Too cramped on mobile
- Drag-and-drop reordering: Unnecessary complexity

### 2. Import Data Flow
**Decision**: Multi-step overlay with merge preview
- Step 1: Parse JSON file, show available notebooks with checkboxes
- Step 2: Show merge preview for each selected notebook:
  - New notebooks will be created
  - Existing notebooks: show how many new memos will be added
  - Renamed notebooks: show when ID matches but name differs
- Step 3: Execute merge with new IDs for imported memos

**Rationale**: Preview helps users understand the impact before committing. New IDs prevent ID conflicts.

**Alternatives considered**:
- Silent merge: Users can't verify what's being imported
- Full replace: Data loss risk too high

### 3. Notebook Matching Priority
**Decision**: Match imported notebooks to existing notebooks using ID first, then name

**Rationale**:
- ID match preserves notebook identity across exports/imports
- Name match provides fallback for notebooks without ID match
- Renaming on ID match keeps data in sync with exported state

**Implementation**:
1. Check if imported notebook ID exists in current notebooks
2. If ID matches and name differs → rename existing notebook
3. If no ID match, check if name exists → merge into existing
4. If neither matches → create new notebook:
   - If imported notebook has non-empty ID → preserve that ID
   - If imported notebook has empty ID → generate new UUID

**Alternatives considered**:
- Name only: Would lose notebook identity when renamed
- ID only: Would create duplicates when same notebook exported from different devices

### 4. ID Generation for Imported Memos
**Decision**: Generate new sequential IDs using `getNextMemoId()` for all imported memos

**Rationale**: Simple, consistent with existing ID generation, no collision risk

**Alternatives considered**:
- UUID: Would work but inconsistent with existing numeric IDs
- Preserve original IDs with prefix: Complex and unnecessary

### 5. WeRead Import Location
**Decision**: Available only in notebook-level menu when a notebook is selected

**Rationale**: WeRead notes are imported into a specific notebook, so the feature belongs where the target notebook context is clear.

**Alternatives considered**:
- Keep in app menu with notebook selector: Extra step for user

### 6. WeRead Import Input Methods
**Decision**: Support both file upload and direct text input for WeRead notes

**Rationale**: 
- File upload: Convenient for users who export notes from WeRead app
- Text input: Useful for quick imports without creating a file, or for mobile users

**Implementation**: 
- Overlay shows two tabs or buttons: "From File" and "From Text"
- Both methods use the same parser and import logic
- Text input uses a textarea for pasting content

**Alternatives considered**:
- File only: Inconvenient for quick imports
- Text only: Inconvenient for large exports

### 7. WeRead Import Unified Logic
**Decision**: Convert WeRead notes to memo structure and apply the same import logic as JSON data

**Rationale**: 
- Reuses existing duplicate detection code
- Consistent user experience across import methods
- Single source of truth for import behavior

**Implementation**:
1. Parse WeRead notes to extract originalText and explanation
2. Trim empty lines from start/end of explanation (preserve inner empty lines)
3. Convert to memo-like objects (without IDs yet)
4. Apply duplicate detection against existing memos in the notebook
5. Show preview with counts (total, duplicates, new)
6. On confirm, assign new IDs and add to notebook

### 8. Duplicate Detection Logic
**Decision**: Two memos are considered duplicates if and only if both `originalText` AND `explanation` match exactly (case-sensitive, whitespace-sensitive)

**Rationale**: 
- A word can have multiple meanings/explanations - same originalText with different explanation should be kept
- Same explanation for different words is valid - different originalText should be kept
- Only exact matches on both fields indicate true duplicates

**Implementation**: During import merge, for each notebook, check if any existing memo has matching originalText AND explanation. Skip if match found.

**Alternatives considered**:
- Match on originalText only: Would lose valid alternate definitions
- Case-insensitive matching: Could merge intentionally different entries
- Fuzzy matching: Too complex and unpredictable

### 9. WeRead Import Default Notebook
**Decision**: Pre-fill the notebook name input with the current notebook name when importing WeRead notes

**Rationale**: 
- Most common use case is importing into the current notebook
- Reduces friction for the primary workflow
- User can still change the notebook name if needed

**Implementation**: Pass `currentNotebookName` prop to WeReadImportOverlay, set as default value for notebook name input when overlay opens.

### 10. Duplicate Count Display
**Decision**: Always show duplicate count during import preview, with visual distinction when duplicates exist

**Rationale**: 
- Users need to know how many notes are being skipped
- Zero duplicates shown in muted color provides confirmation
- Non-zero duplicates shown in warning color draws attention

**Implementation**: 
- Always display "X duplicate notes will be skipped"
- Use muted text color when count is 0
- Use warning/danger color when count > 0

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| Large exports could be slow | Show progress indicator for exports > 1000 memos |
| Import file format mismatch | Validate JSON structure before parsing, show clear error |
| User imports wrong file | Show file name and notebook count before proceeding |
| Duplicate detection misses near-duplicates | Document exact match behavior; user can manually review |

## Migration Plan

1. Add new overlay components (ExportOverlay, ImportOverlay)
2. Update App.tsx to use new handlers
3. Remove import/export from notebook menu, keep only WeRead import
4. No data migration needed - existing data format unchanged

**Rollback**: Revert to previous menu structure if issues arise
