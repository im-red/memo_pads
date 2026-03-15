import { useState, useEffect } from 'react';
import { Memo } from '../types/memo';

interface AddMemoOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (originalText: string, explanation: string) => void;
  onEdit?: (memo: Memo) => void;
  editMemo?: Memo | null;
}

const AddMemoOverlay = ({
  isOpen,
  onClose,
  onSave,
  onEdit,
  editMemo
}: AddMemoOverlayProps) => {
  const [originalText, setOriginalText] = useState('');
  const [explanation, setExplanation] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (editMemo) {
      setOriginalText(editMemo.originalText);
      setExplanation(editMemo.explanation);
    } else {
      setOriginalText('');
      setExplanation('');
    }
    setError('');
  }, [editMemo, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!originalText.trim()) {
      setError('Original text is required');
      return;
    }
    if (!explanation.trim()) {
      setError('Explanation is required');
      return;
    }

    if (editMemo && onEdit) {
      onEdit({ ...editMemo, originalText: originalText.trim(), explanation: explanation.trim() });
    } else {
      onSave(originalText.trim(), explanation.trim());
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="overlay">
      <div className="overlay-backdrop" onClick={onClose} />
      <div className="overlay-panel">
        <div className="overlay-header">
          <h2>{editMemo ? 'Edit Memo' : 'Add New Memo'}</h2>
          <button type="button" className="overlay-close" onClick={onClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="memo-form">
          <div className="form-group">
            <label htmlFor="originalText">Original Text</label>
            <textarea
              id="originalText"
              value={originalText}
              onChange={e => setOriginalText(e.target.value)}
              placeholder="Enter the word or phrase..."
              rows={3}
            />
          </div>

          <div className="form-group">
            <label htmlFor="explanation">Explanation</label>
            <textarea
              id="explanation"
              value={explanation}
              onChange={e => setExplanation(e.target.value)}
              placeholder="Enter the meaning or translation..."
              rows={3}
            />
          </div>

          {error && <p className="form-error">{error}</p>}

          <button type="submit" className="btn-primary">
            {editMemo ? 'Save Changes' : 'Add Memo'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddMemoOverlay;
