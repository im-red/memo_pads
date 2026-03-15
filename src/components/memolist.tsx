import { Memo } from '../types/memo';
import clsx from 'clsx';
import { useState, useRef, useEffect } from 'react';

interface MemoListProps {
  memos: Memo[];
  showExplanation: boolean;
  currentMemoId: number | null;
  onToggleExplanation: () => void;
  onNavigate: (memoId: number) => void;
  onAdd: () => void;
  onEdit: (memo: Memo) => void;
  onDelete: (memoId: number) => void;
}

const MemoList = ({
  memos,
  showExplanation,
  currentMemoId,
  onToggleExplanation,
  onNavigate,
  onAdd,
  onEdit,
  onDelete
}: MemoListProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const currentIndex = memos.findIndex(m => m.id === currentMemoId);
  const currentMemo = memos[currentIndex];
  const canGoPrev = currentIndex > 0;
  const canGoNext = currentIndex < memos.length - 1;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  const handlePointerUp = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    const selection = window.getSelection();
    if (selection && selection.toString().length > 0) {
      return;
    }
    onToggleExplanation();
  };

  const handleEdit = () => {
    setIsMenuOpen(false);
    if (currentMemo) onEdit(currentMemo);
  };

  const handleDelete = () => {
    setIsMenuOpen(false);
    if (currentMemo) onDelete(currentMemo.id);
  };

  if (memos.length === 0) {
    return (
      <div className="memo-view empty">
        <p className="empty-message">No memos in this notebook.</p>
        <button type="button" className="btn-primary" onClick={onAdd}>
          Add Your First Memo
        </button>
      </div>
    );
  }

  return (
    <div className="memo-view">
      <div className="memo-view__progress">
        <span>{currentIndex + 1} / {memos.length}</span>
        <div className="progress-bar">
          <div
            className="progress-bar__fill"
            style={{ width: `${((currentIndex + 1) / memos.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="memo-card">
        <div className="memo-card__header">
          <p className="memo-card__original">{currentMemo?.originalText}</p>
          <div className="memo-card__menu" ref={menuRef}>
            <button
              type="button"
              className="memo-card__menu-btn"
              onClick={() => setIsMenuOpen(v => !v)}
            >
              ⋮
            </button>
            {isMenuOpen && (
              <div className="memo-card__menu-dropdown">
                <button type="button" onClick={handleEdit}>
                  Edit
                </button>
                <button type="button" onClick={handleDelete} className="danger">
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
        <div className="memo-card__content" onPointerUp={handlePointerUp}>
          {showExplanation && (
            <p className="memo-card__explanation">{currentMemo?.explanation}</p>
          )}
        </div>
      </div>

      <div className="memo-view__controls">
        <button
          type="button"
          className={clsx('nav-btn', { disabled: !canGoPrev })}
          onClick={() => canGoPrev && onNavigate(memos[currentIndex - 1].id)}
          disabled={!canGoPrev}
        >
          ← Prev
        </button>

        <button
          type="button"
          className={clsx('toggle-btn', { active: showExplanation })}
          onClick={onToggleExplanation}
        >
          {showExplanation ? 'Hide' : 'Show'} Explanation
        </button>

        <button
          type="button"
          className={clsx('nav-btn', { disabled: !canGoNext })}
          onClick={() => canGoNext && onNavigate(memos[currentIndex + 1].id)}
          disabled={!canGoNext}
        >
          Next →
        </button>
      </div>

      <button type="button" className="add-memo-btn" onClick={onAdd}>
        + Add Memo
      </button>
    </div>
  );
};

export default MemoList;
