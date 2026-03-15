import { useState, useMemo, useRef, useEffect } from 'react';
import { Memo } from '../types/memo';
import { parseWeReadNotes, WeReadNote } from '../utils/wereadParser';

interface WeReadImportOverlayProps {
  isOpen: boolean;
  currentNotebookName: string;
  existingMemos: Memo[];
  getNextMemoId: () => number;
  onClose: () => void;
  onImport: (newMemos: Memo[], notebookName: string) => void;
}

type InputMode = 'file' | 'text';

const WeReadImportOverlay = ({
  isOpen,
  currentNotebookName,
  existingMemos,
  getNextMemoId,
  onClose,
  onImport
}: WeReadImportOverlayProps) => {
  const [inputMode, setInputMode] = useState<InputMode>('file');
  const [textContent, setTextContent] = useState('');
  const [notes, setNotes] = useState<WeReadNote[]>([]);
  const [notebookName, setNotebookName] = useState('');
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && currentNotebookName) {
      setNotebookName(currentNotebookName);
    }
  }, [isOpen, currentNotebookName]);

  const preview = useMemo(() => {
    if (notes.length === 0) return null;

    let duplicateCount = 0;
    const newMemos: Array<{ originalText: string; explanation: string }> = [];

    notes.forEach(note => {
      const isDuplicate = existingMemos.some(
        existing =>
          existing.originalText === note.originalText &&
          existing.explanation === note.explanation
      );
      if (isDuplicate) {
        duplicateCount++;
      } else {
        newMemos.push({
          originalText: note.originalText,
          explanation: note.explanation
        });
      }
    });

    return {
      total: notes.length,
      duplicates: duplicateCount,
      newMemos: newMemos.length
    };
  }, [notes, existingMemos]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = e => {
      try {
        const content = e.target?.result as string;
        const parsed = parseWeReadNotes(content);
        if (parsed.length === 0) {
          setError('No WeRead notes found in this file.');
          setNotes([]);
        } else {
          setNotes(parsed);
          setError('');
        }
      } catch (err) {
        setError('Failed to parse WeRead notes.');
        setNotes([]);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleTextSubmit = () => {
    if (!textContent.trim()) {
      setError('Please paste WeRead notes content.');
      return;
    }

    try {
      const parsed = parseWeReadNotes(textContent);
      if (parsed.length === 0) {
        setError('No WeRead notes found in the content.');
        setNotes([]);
      } else {
        setNotes(parsed);
        setError('');
      }
    } catch (err) {
      setError('Failed to parse WeRead notes.');
      setNotes([]);
    }
  };

  const handleConfirm = () => {
    if (notes.length === 0) return;
    if (!notebookName.trim()) {
      setError('Notebook name is required');
      return;
    }

    let nextId = getNextMemoId();
    const newMemos: Memo[] = [];

    notes.forEach(note => {
      const isDuplicate = existingMemos.some(
        existing =>
          existing.originalText === note.originalText &&
          existing.explanation === note.explanation
      );
      if (!isDuplicate) {
        newMemos.push({
          id: nextId++,
          originalText: note.originalText,
          explanation: note.explanation,
          notebookId: '',
          createdAt: new Date().toISOString()
        });
      }
    });

    onImport(newMemos, notebookName.trim());
    resetState();
  };

  const resetState = () => {
    setNotes([]);
    setTextContent('');
    setNotebookName('');
    setError('');
    setInputMode('file');
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="overlay">
      <div className="overlay-backdrop" onClick={handleClose} />
      <div className="overlay-panel">
        <div className="overlay-header">
          <h2>Import WeRead Notes</h2>
          <button type="button" className="overlay-close" onClick={handleClose}>
            ×
          </button>
        </div>

        {notes.length === 0 ? (
          <>
            <div className="weread-tabs">
              <button
                type="button"
                className={`weread-tab ${inputMode === 'file' ? 'active' : ''}`}
                onClick={() => setInputMode('file')}
              >
                From File
              </button>
              <button
                type="button"
                className={`weread-tab ${inputMode === 'text' ? 'active' : ''}`}
                onClick={() => setInputMode('text')}
              >
                From Text
              </button>
            </div>

            {inputMode === 'file' ? (
              <div className="import-file-section">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".txt,text/plain"
                  style={{ display: 'none' }}
                  onChange={handleFileChange}
                />
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Select WeRead Notes File
                </button>
                <p className="weread-hint">
                  Select a text file exported from WeRead containing your notes.
                </p>
              </div>
            ) : (
              <div className="weread-text-input">
                <textarea
                  value={textContent}
                  onChange={e => setTextContent(e.target.value)}
                  placeholder="Paste WeRead notes here..."
                  rows={8}
                />
                <button
                  type="button"
                  className="btn-primary"
                  onClick={handleTextSubmit}
                  disabled={!textContent.trim()}
                >
                  Parse Notes
                </button>
              </div>
            )}

            {error && <p className="form-error">{error}</p>}
          </>
        ) : (
          <>
            <div className="weread-import-info">
              <p className="weread-import-count">
                Found <strong>{preview?.total || 0}</strong> notes
              </p>
              <p className={`import-duplicates ${preview?.duplicates ? 'has-duplicates' : ''}`}>
                <strong>{preview?.duplicates || 0}</strong> duplicate notes will be skipped
              </p>
              <p className="weread-import-hint">
                {preview?.newMemos || 0} notes will be imported as memos.
              </p>
            </div>

            <form onSubmit={e => { e.preventDefault(); handleConfirm(); }} className="memo-form">
              <div className="form-group">
                <label htmlFor="notebookName">Import to Notebook</label>
                <input
                  id="notebookName"
                  type="text"
                  value={notebookName}
                  onChange={e => setNotebookName(e.target.value)}
                  placeholder="Enter notebook name..."
                  autoFocus
                />
              </div>

              {error && <p className="form-error">{error}</p>}

              <div className="weread-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={resetState}
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={preview?.newMemos === 0}
                >
                  Import {preview?.newMemos || 0} Notes
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default WeReadImportOverlay;
