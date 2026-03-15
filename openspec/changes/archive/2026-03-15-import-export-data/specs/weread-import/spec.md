## ADDED Requirements

### Requirement: WeRead import location
The system SHALL provide WeRead notes import only at the notebook level, accessible when a notebook is selected.

#### Scenario: Access WeRead import from notebook
- **WHEN** user has a notebook selected
- **THEN** menu shows "Import WeRead Notes" option
- **AND** imported notes are added to the selected notebook

#### Scenario: WeRead import not available at app level
- **WHEN** user is on the main screen (no notebook selected)
- **THEN** menu does NOT show "Import WeRead Notes" option

### Requirement: WeRead input methods
The system SHALL accept WeRead notes through either file upload or direct text input.

#### Scenario: Import WeRead notes from file
- **WHEN** user selects "Import from File" option
- **THEN** file picker opens for text file selection
- **AND** system parses the file content for WeRead notes

#### Scenario: Import WeRead notes from text input
- **WHEN** user selects "Import from Text" option
- **THEN** text input area is displayed
- **AND** user can paste WeRead notes directly
- **AND** system parses the text content for WeRead notes

### Requirement: WeRead notes parsing
The system SHALL parse WeRead notes using the pattern: `◆ <DATE>发表想法` as start, `原文：<text>` as end marker.

#### Scenario: Parse valid WeRead notes
- **WHEN** user provides content with valid WeRead note format
- **THEN** system extracts each note's original text and explanation
- **AND** shows count of notes found

#### Scenario: Parse content with no valid notes
- **WHEN** user provides content with no matching note patterns
- **THEN** system shows "No WeRead notes found"

### Requirement: WeRead data conversion
The system SHALL convert WeRead notes to the same data structure as exported memos before import.

#### Scenario: Convert WeRead notes to memo structure
- **WHEN** WeRead notes are parsed successfully
- **THEN** each note is converted to a memo with:
  - originalText: the text after "原文："
  - explanation: the user's thought between start marker and "原文："
- **AND** converted memos follow the same structure as JSON import data

### Requirement: WeRead explanation text trimming
The system SHALL trim empty lines from the start and end of explanation text, while preserving inner empty lines.

#### Scenario: Trim leading empty lines from explanation
- **WHEN** parsed explanation has empty lines at the beginning
- **THEN** leading empty lines are removed
- **AND** explanation starts with the first non-empty line

#### Scenario: Trim trailing empty lines from explanation
- **WHEN** parsed explanation has empty lines at the end
- **THEN** trailing empty lines are removed
- **AND** explanation ends with the last non-empty line

#### Scenario: Preserve inner empty lines in explanation
- **WHEN** parsed explanation has empty lines between content
- **THEN** inner empty lines are preserved
- **AND** paragraph structure is maintained

### Requirement: WeRead import with merge logic
The system SHALL apply the same import logic as JSON data import, including duplicate detection and preview.

#### Scenario: Show WeRead import preview
- **WHEN** WeRead notes are converted to memos
- **THEN** system shows preview with:
  - Total notes found
  - Duplicates detected (same originalText AND explanation)
  - New memos to be added
- **AND** duplicate count is always displayed

#### Scenario: Skip duplicate WeRead notes
- **WHEN** converted memo has same originalText AND same explanation as existing memo in the notebook
- **THEN** the duplicate memo is skipped
- **AND** preview shows count of duplicates that will be skipped

#### Scenario: Import WeRead notes to selected notebook
- **WHEN** user confirms WeRead import
- **THEN** non-duplicate memos are added to the selected notebook
- **AND** all new memos are assigned new sequential IDs
- **AND** existing memos are preserved

### Requirement: WeRead import default notebook
The system SHALL pre-fill the notebook name with the current notebook name when the import overlay opens.

#### Scenario: Default notebook name from current selection
- **WHEN** user opens WeRead import overlay from a notebook
- **THEN** notebook name input is pre-filled with current notebook name
- **AND** user can modify the notebook name if needed

### Requirement: WeRead import duplicate count display
The system SHALL always display the duplicate count with visual distinction based on value.

#### Scenario: Display zero duplicates
- **WHEN** no duplicate notes are found
- **THEN** duplicate count shows "0 duplicate notes will be skipped"
- **AND** text is displayed in muted color

#### Scenario: Display non-zero duplicates
- **WHEN** duplicate notes are found
- **THEN** duplicate count shows actual count
- **AND** text is displayed in warning/danger color
