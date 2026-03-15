import { Notebook, Memo } from '../types/memo';

export interface ImportPreview {
  notebookCount: number;
  memoCount: number;
  newNotebooks: number;
  updatedNotebooks: number;
  newMemos: number;
  duplicateCount: number;
}

export interface ImportResult {
  newNotebooks: Notebook[];
  updatedNotebooks: Notebook[];
  newMemos: Memo[];
  notebookIdMap: Map<string, string>;
  preview: ImportPreview;
}

export interface NotebookMatchResult {
  newNotebooks: Notebook[];
  updatedNotebooks: Notebook[];
  notebookIdMap: Map<string, string>;
}

export function matchNotebooks(
  selectedNotebooks: Notebook[],
  existingNotebooks: Notebook[]
): NotebookMatchResult {
  const existingNotebookIds = new Set(existingNotebooks.map(n => n.id));
  const existingNotebookNames = new Map(existingNotebooks.map(n => [n.name, n.id]));
  const newNotebooks: Notebook[] = [];
  const updatedNotebooks: Notebook[] = [];
  const notebookIdMap = new Map<string, string>();

  selectedNotebooks.forEach(notebook => {
    if (existingNotebookIds.has(notebook.id)) {
      const existing = existingNotebooks.find(n => n.id === notebook.id);
      if (existing && existing.name !== notebook.name) {
        updatedNotebooks.push({
          ...existing,
          name: notebook.name
        });
      }
      notebookIdMap.set(notebook.id, notebook.id);
    } else {
      const existingId = existingNotebookNames.get(notebook.name);
      if (existingId) {
        notebookIdMap.set(notebook.id, existingId);
      } else {
        const newId = notebook.id || (crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2));
        notebookIdMap.set(notebook.id, newId);
        newNotebooks.push({
          ...notebook,
          id: newId
        });
      }
    }
  });

  return { newNotebooks, updatedNotebooks, notebookIdMap };
}

export function filterDuplicateMemos(
  selectedMemos: Memo[],
  notebookIdMap: Map<string, string>,
  existingMemos: Memo[],
  existingNotebooks: Notebook[]
): { newMemos: Memo[]; duplicateCount: number } {
  const newMemos: Memo[] = [];
  let duplicateCount = 0;

  selectedMemos.forEach(memo => {
    const newNotebookId = notebookIdMap.get(memo.notebookId);
    if (!newNotebookId) return;

    const existingNotebook = existingNotebooks.find(n => n.id === newNotebookId);
    if (existingNotebook) {
      const isDuplicate = existingMemos.some(
        existing =>
          existing.notebookId === newNotebookId &&
          existing.originalText === memo.originalText &&
          existing.explanation === memo.explanation
      );
      if (isDuplicate) {
        duplicateCount++;
        return;
      }
    }

    newMemos.push(memo);
  });

  return { newMemos, duplicateCount };
}

export function computeImportPreview(
  selectedNotebooks: Notebook[],
  selectedMemos: Memo[],
  existingNotebooks: Notebook[],
  existingMemos: Memo[]
): ImportPreview {
  const { newNotebooks, updatedNotebooks, notebookIdMap } = matchNotebooks(
    selectedNotebooks,
    existingNotebooks
  );

  const { newMemos, duplicateCount } = filterDuplicateMemos(
    selectedMemos,
    notebookIdMap,
    existingMemos,
    existingNotebooks
  );

  return {
    notebookCount: selectedNotebooks.length,
    memoCount: selectedMemos.length,
    newNotebooks: newNotebooks.length,
    updatedNotebooks: updatedNotebooks.length,
    newMemos: newMemos.length,
    duplicateCount
  };
}

export function executeImport(
  selectedNotebooks: Notebook[],
  selectedMemos: Memo[],
  existingNotebooks: Notebook[],
  existingMemos: Memo[],
  getNextMemoId: () => number
): ImportResult {
  const { newNotebooks, updatedNotebooks, notebookIdMap } = matchNotebooks(
    selectedNotebooks,
    existingNotebooks
  );

  const { newMemos: filteredMemos, duplicateCount } = filterDuplicateMemos(
    selectedMemos,
    notebookIdMap,
    existingMemos,
    existingNotebooks
  );

  let nextId = getNextMemoId();
  const newMemos = filteredMemos.map(memo => {
    const newNotebookId = notebookIdMap.get(memo.notebookId);
    return {
      ...memo,
      id: nextId++,
      notebookId: newNotebookId || memo.notebookId
    };
  });

  return {
    newNotebooks,
    updatedNotebooks,
    newMemos,
    notebookIdMap,
    preview: {
      notebookCount: selectedNotebooks.length,
      memoCount: selectedMemos.length,
      newNotebooks: newNotebooks.length,
      updatedNotebooks: updatedNotebooks.length,
      newMemos: newMemos.length,
      duplicateCount
    }
  };
}
