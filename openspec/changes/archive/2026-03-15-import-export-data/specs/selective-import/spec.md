## ADDED Requirements

### Requirement: Import file parsing
The system SHALL parse uploaded JSON file and display available notebooks for selection.

#### Scenario: Valid JSON file uploaded
- **WHEN** user uploads a valid JSON file with notebooks and memos
- **THEN** system displays list of notebooks from the file
- **AND** each notebook shows its memo count

#### Scenario: Invalid JSON file uploaded
- **WHEN** user uploads an invalid or corrupted JSON file
- **THEN** system displays error message "Invalid file format"
- **AND** user can try uploading a different file

### Requirement: Import notebook selection
The system SHALL allow users to select which notebooks to import from the uploaded file.

#### Scenario: Select notebooks for import
- **WHEN** user views available notebooks from import file
- **THEN** user can check/uncheck each notebook
- **AND** all notebooks are selected by default

### Requirement: Import merge preview
The system SHALL show a preview of how import will affect existing data before executing.

#### Scenario: Preview new notebooks
- **WHEN** imported notebook does not exist in current data
- **THEN** preview shows notebook will be created as new
- **AND** status badge displays "New"

#### Scenario: Preview existing notebooks
- **WHEN** imported notebook matches existing notebook by ID or name
- **THEN** preview shows notebook will merge with existing
- **AND** status badge displays "Existing"

#### Scenario: Preview notebook rename
- **WHEN** imported notebook has same ID as existing notebook but different name
- **THEN** preview shows notebook will be renamed
- **AND** status badge displays "Update"

### Requirement: Import notebook matching
The system SHALL match imported notebooks to existing notebooks using ID first, then name.

#### Scenario: Match by ID
- **WHEN** imported notebook has same ID as existing notebook
- **THEN** the existing notebook is used for merge
- **AND** if names differ, the existing notebook is renamed to imported name

#### Scenario: Match by name when ID differs
- **WHEN** imported notebook has different ID but same name as existing notebook
- **THEN** the existing notebook is used for merge
- **AND** imported memos are added to existing notebook

#### Scenario: No match
- **WHEN** imported notebook has no matching ID or name
- **THEN** a new notebook is created
- **AND** if imported notebook has non-empty ID, that ID is preserved
- **AND** if imported notebook has empty ID, a new UUID is generated

### Requirement: Import merge execution
The system SHALL merge imported memos with existing data, assigning new IDs to imported memos.

#### Scenario: Merge new notebooks
- **WHEN** user confirms import with new notebooks
- **THEN** new notebooks are created with new UUIDs
- **AND** all memos are assigned new sequential IDs

#### Scenario: Merge into existing notebooks
- **WHEN** user confirms import with existing notebook names
- **THEN** imported memos are added to existing notebooks
- **AND** imported memos receive new sequential IDs
- **AND** existing memos remain unchanged

#### Scenario: Rename existing notebook during import
- **WHEN** user confirms import with notebook that has same ID but different name
- **THEN** existing notebook is renamed to imported name
- **AND** imported memos are added to the notebook
- **AND** existing memos remain unchanged

#### Scenario: Import with no selection
- **WHEN** user clicks "Import" with no notebooks selected
- **THEN** import button is disabled
- **AND** user sees message "Select at least one notebook"

### Requirement: Duplicate memo detection
The system SHALL detect duplicate memos where both originalText and explanation match exactly. Duplicate memos SHALL NOT be imported.

#### Scenario: Skip duplicate memos during import
- **WHEN** imported memo has same originalText AND same explanation as existing memo in the same notebook
- **THEN** the duplicate memo is skipped
- **AND** preview shows count of duplicates that will be skipped

#### Scenario: Import memo with same originalText but different explanation
- **WHEN** imported memo has same originalText but different explanation
- **THEN** the memo is imported as a new memo
- **AND** both memos exist in the notebook

#### Scenario: Import memo with same explanation but different originalText
- **WHEN** imported memo has same explanation but different originalText
- **THEN** the memo is imported as a new memo
- **AND** both memos exist in the notebook
