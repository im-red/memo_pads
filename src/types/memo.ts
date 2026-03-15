export interface Memo {
  id: number;
  originalText: string;
  explanation: string;
  notebookId: string;
  createdAt: string;
}

export interface Notebook {
  id: string;
  name: string;
  createdAt: string;
}

export interface ViewProgress {
  notebookId: string;
  currentMemoId: number | null;
  showExplanation: boolean;
}

export interface ExerciseResult {
  memoId: number;
  remembered: boolean;
  timestamp: string;
}

export interface ExerciseSession {
  notebookId: string;
  shuffledMemoIds: number[];
  currentIndex: number;
  results: ExerciseResult[];
}
