## ADDED Requirements

### Requirement: Duplicate memo detection
The system SHALL check if a new memo already exists in the current notebook before saving.

#### Scenario: Detect duplicate memo
- **WHEN** user attempts to save a memo with same originalText and explanation as an existing memo in current notebook
- **THEN** system shows error "This memo already exists in the current notebook"
- **AND** memo is not saved

#### Scenario: Allow non-duplicate memo
- **WHEN** user attempts to save a memo that does not match any memo in current notebook
- **THEN** memo is saved successfully
