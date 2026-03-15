## Why

Currently, import/export functionality is scattered across the application and operates at the notebook level. This creates confusion and limits user control. Users cannot selectively export specific notebooks, and importing data overwrites existing content rather than merging. Additionally, WeRead notes import should be a notebook-level feature, distinct from the application-level data import/export.

## What Changes

- Move import/export data to application level (main screen menu only)
- Add notebook selection UI for export - users can choose which notebooks to export
- Add notebook selection UI for import - users can choose which notebooks to import
- Merge imported memos instead of overwriting - new memos are appended with new IDs, existing memos are preserved
- Move WeRead notes import to notebook level (available when a notebook is selected)
- **BREAKING**: Remove import/export from notebook-level menu (only WeRead import remains at notebook level)

## Capabilities

### New Capabilities
- `selective-export`: Export selected notebooks with their memos to JSON file
- `selective-import`: Import and merge selected notebooks from JSON file with conflict resolution
- `weread-import`: Import WeRead notes into a specific notebook (notebook-level feature)

### Modified Capabilities
- None (this is new functionality)

## Impact

- **App.tsx**: Refactor import/export handlers to support selective operations
- **New Components**: 
  - `ExportOverlay.tsx` - Notebook selection for export
  - `ImportOverlay.tsx` - Notebook selection for import with merge preview
- **WeReadImportOverlay.tsx**: Move to notebook-level context
- **Menu structure**: 
  - Main menu: Export Data, Import Data
  - Notebook menu: Import WeRead Notes only
