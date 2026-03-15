import { useState } from 'react';

interface AddNotebookOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string) => void;
}

const AddNotebookOverlay = ({
  isOpen,
  onClose,
  onSave
}: AddNotebookOverlayProps) => {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Notebook name is required');
      return;
    }
    onSave(name.trim());
    setName('');
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="overlay">
      <div className="overlay-backdrop" onClick={onClose} />
      <div className="overlay-panel">
        <div className="overlay-header">
          <h2>New Notebook</h2>
          <button type="button" className="overlay-close" onClick={onClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="memo-form">
          <div className="form-group">
            <label htmlFor="notebookName">Notebook Name</label>
            <input
              id="notebookName"
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Enter notebook name..."
            />
          </div>

          {error && <p className="form-error">{error}</p>}

          <button type="submit" className="btn-primary">
            Create Notebook
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddNotebookOverlay;
