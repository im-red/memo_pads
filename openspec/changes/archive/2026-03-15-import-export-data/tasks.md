## 1. Export Overlay Component

- [x] 1.1 Create ExportOverlay.tsx component with notebook checkbox list
- [x] 1.2 Add preview section showing selected notebook count and memo count
- [x] 1.3 Implement export button with disabled state when no selection
- [x] 1.4 Add styles for export overlay to styles.css

## 2. Import Overlay Component

- [x] 2.1 Create ImportOverlay.tsx component with file upload
- [x] 2.2 Add JSON parsing and validation with error handling
- [x] 2.3 Implement notebook checkbox list from parsed file
- [x] 2.4 Add merge preview showing new vs existing notebooks
- [x] 2.5 Implement duplicate detection (match on both originalText AND explanation)
- [x] 2.6 Show duplicate count in preview
- [x] 2.7 Implement merge logic with new ID generation, skipping duplicates
- [x] 2.8 Add styles for import overlay to styles.css

## 3. WeRead Import Overlay Component

- [x] 3.1 Update WeReadImportOverlay.tsx with dual input methods (file + text)
- [x] 3.2 Add tab toggle between "From File" and "From Text" modes
- [x] 3.3 Implement textarea for direct text input
- [x] 3.4 Convert parsed WeRead notes to memo structure
- [x] 3.5 Implement explanation trimming (trim start/end empty lines, preserve inner)
- [x] 3.6 Apply duplicate detection against existing memos in notebook
- [x] 3.7 Show preview with total, duplicates, and new memo counts
- [x] 3.8 Update import logic to skip duplicates and assign new IDs
- [x] 3.9 Add styles for updated WeRead overlay

## 4. Refactor App.tsx

- [x] 4.1 Remove import/export from notebook-level menu
- [x] 4.2 Add ExportOverlay to main screen with state management
- [x] 4.3 Add ImportOverlay to main screen with state management
- [x] 4.4 Keep WeRead import in notebook-level menu only
- [x] 4.5 Update menu structure: main menu has Export/Import, notebook menu has WeRead only

## 5. Testing & Verification

- [x] 5.1 Test export with all notebooks selected
- [x] 5.2 Test export with partial notebook selection
- [x] 5.3 Test import with new notebooks
- [x] 5.4 Test import merge into existing notebooks
- [x] 5.5 Test duplicate detection (same originalText AND explanation)
- [x] 5.6 Test import of memo with same originalText but different explanation
- [x] 5.7 Test WeRead import from file
- [x] 5.8 Test WeRead import from text input
- [x] 5.9 Test WeRead duplicate detection
- [x] 5.10 Test WeRead explanation trimming (start/end trimmed, inner preserved)
- [x] 5.11 Verify WeRead import is not available at app level
- [x] 5.12 Build and sync to Android
