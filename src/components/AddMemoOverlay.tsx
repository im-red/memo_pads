import { useState, useEffect } from 'react';
import { Clipboard } from '@capacitor/clipboard';
import { Memo } from '../types/memo';

interface AddMemoOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (originalText: string, explanation: string) => void;
  onEdit?: (memo: Memo) => void;
  editMemo?: Memo | null;
  openMode?: 'add' | 'paste';
}

const AddMemoOverlay = ({
  isOpen,
  onClose,
  onSave,
  onEdit,
  editMemo,
  openMode = 'add'
}: AddMemoOverlayProps) => {
  const [originalText, setOriginalText] = useState('');
  const [explanation, setExplanation] = useState('');
  const [error, setError] = useState('');

  const handlePaste = async () => {
    try {
      const { value } = await Clipboard.read();
      if (!value || !value.trim()) {
        setError('Clipboard is empty');
        return;
      }
      const lines = value.split('\n');
      setOriginalText(lines[0]);
      setExplanation(lines.slice(1).join('\n'));
      setError('');
    } catch (err) {
      setError('Unable to read clipboard');
    }
  };

  const handleSwap = () => {
    const temp = originalText;
    setOriginalText(explanation);
    setExplanation(temp);
  };

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

  useEffect(() => {
    if (openMode === 'paste' && isOpen && !editMemo) {
      handlePaste();
    }
  }, [openMode, isOpen, editMemo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!originalText.trim()) {
      setError('Original text is required');
      return;
    }
    if (!explanation.trim()) {
      setError('Explanation is required');
      return;
    }

    try {
      if (editMemo && onEdit) {
        onEdit({ ...editMemo, originalText: originalText.trim(), explanation: explanation.trim() });
      } else {
        await onSave(originalText.trim(), explanation.trim());
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save memo');
    }
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

          <button type="button" className="btn-swap" onClick={handleSwap} title="Swap fields">
            ⇅
          </button>

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

          <div className="form-actions">
            <button type="submit" className="btn-primary">
              {editMemo ? 'Save Changes' : 'Add Memo'}
            </button>
            {openMode !== 'paste' && (
              <button type="button" className="btn-icon" onClick={handlePaste} title="Paste from clipboard">
                📋
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddMemoOverlay;
