import { Memo } from '../types/memo';
import clsx from 'clsx';

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
  const currentIndex = memos.findIndex(m => m.id === currentMemoId);
  const currentMemo = memos[currentIndex];
  const canGoPrev = currentIndex > 0;
  const canGoNext = currentIndex < memos.length - 1;

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
        <div className="memo-card__content">
          <p className="memo-card__original">{currentMemo?.originalText}</p>
          {showExplanation && (
            <p className="memo-card__explanation">{currentMemo?.explanation}</p>
          )}
        </div>

        <div className="memo-card__actions">
          <button
            type="button"
            className="memo-card__action-btn"
            onClick={() => currentMemo && onEdit(currentMemo)}
          >
            Edit
          </button>
          <button
            type="button"
            className="memo-card__action-btn memo-card__action-btn--danger"
            onClick={() => currentMemo && onDelete(currentMemo.id)}
          >
            Delete
          </button>
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
