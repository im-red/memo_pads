import { Notebook } from '../types/memo';
import clsx from 'clsx';

interface NotebookListProps {
  notebooks: Notebook[];
  selectedNotebookId: string | null;
  onSelect: (notebookId: string) => void;
  onAdd: () => void;
  onDelete: (notebookId: string) => void;
  memoCounts: Record<string, number>;
}

const NotebookList = ({
  notebooks,
  selectedNotebookId,
  onSelect,
  onAdd,
  onDelete,
  memoCounts
}: NotebookListProps) => {
  return (
    <div className="notebook-list">
      <div className="notebook-list__header">
        <h2>Notebooks</h2>
        <button
          type="button"
          className="add-notebook-btn"
          onClick={onAdd}
          aria-label="Add notebook"
        >
          +
        </button>
      </div>
      <ul className="notebook-items">
        {notebooks.map(notebook => (
          <li
            key={notebook.id}
            className={clsx('notebook-item', {
              active: selectedNotebookId === notebook.id
            })}
          >
            <button
              type="button"
              className="notebook-item__btn"
              onClick={() => onSelect(notebook.id)}
            >
              <span className="notebook-item__name">{notebook.name}</span>
              <span className="notebook-item__count">
                {memoCounts[notebook.id] || 0} memos
              </span>
            </button>
            {selectedNotebookId === notebook.id && (
              <button
                type="button"
                className="notebook-item__delete"
                onClick={() => onDelete(notebook.id)}
                aria-label="Delete notebook"
              >
                ×
              </button>
            )}
          </li>
        ))}
      </ul>
      {notebooks.length === 0 && (
        <p className="empty-message">No notebooks yet. Create one to get started!</p>
      )}
    </div>
  );
};

export default NotebookList;
