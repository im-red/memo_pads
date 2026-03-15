## ADDED Requirements

### Requirement: Export notebook selection
The system SHALL display a list of all notebooks with checkboxes for selection when user initiates export. All notebooks SHALL be selected by default.

#### Scenario: Export with all notebooks selected
- **WHEN** user opens export dialog
- **THEN** all notebooks are shown with checkboxes checked
- **AND** total memo count is displayed

#### Scenario: Export with partial selection
- **WHEN** user unchecks some notebooks
- **THEN** only checked notebooks will be included in export
- **AND** updated memo count reflects selection

### Requirement: Export file generation
The system SHALL generate a JSON file containing selected notebooks and their memos when user confirms export.

#### Scenario: Successful export to file
- **WHEN** user clicks "Export" button with notebooks selected
- **THEN** a JSON file is generated with structure `{ notebooks: [], memos: [] }`
- **AND** file is saved to device storage or downloaded

#### Scenario: Export with no selection
- **WHEN** user clicks "Export" with no notebooks selected
- **THEN** export button is disabled
- **AND** user sees message "Select at least one notebook"

### Requirement: Export preview
The system SHALL show a preview of export contents before generating the file.

#### Scenario: Preview shows export summary
- **WHEN** user has selected notebooks for export
- **THEN** preview shows number of notebooks and total memos to be exported
