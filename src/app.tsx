import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { App as CapacitorApp } from '@capacitor/app';
import type { PluginListenerHandle } from '@capacitor/core';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';
import clsx from 'clsx';
import { Memo, Notebook, ViewProgress, ExerciseResult } from './types/memo';
import useLocalStorageState from './hooks/useLocalStorageState';
import NotebookList from './components/NotebookList';
import MemoList from './components/MemoList';
import AddMemoOverlay from './components/AddMemoOverlay';
import AddNotebookOverlay from './components/AddNotebookOverlay';
import ExerciseOverlay from './components/ExerciseOverlay';
import ExportOverlay from './components/ExportOverlay';
import ImportOverlay from './components/ImportOverlay';
import WeReadImportOverlay from './components/WeReadImportOverlay';

const NOTEBOOKS_KEY = 'memo-pads:notebooks';
const MEMOS_KEY = 'memo-pads:memos';
const PROGRESS_KEY = 'memo-pads:progress';

type AppMode = 'view' | 'exercise';

const App = () => {
  const [notebooks, setNotebooks] = useLocalStorageState<Notebook[]>(NOTEBOOKS_KEY, []);
  const [memos, setMemos] = useLocalStorageState<Memo[]>(MEMOS_KEY, []);
  const [viewProgress, setViewProgress] = useLocalStorageState<Record<string, ViewProgress>>(PROGRESS_KEY, {});

  const [selectedNotebookId, setSelectedNotebookId] = useState<string | null>(null);
  const [appMode, setAppMode] = useState<AppMode>('view');
  const [isAddMemoOpen, setIsAddMemoOpen] = useState(false);
  const [isAddNotebookOpen, setIsAddNotebookOpen] = useState(false);
  const [isExerciseOpen, setIsExerciseOpen] = useState(false);
  const [editMemo, setEditMemo] = useState<Memo | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isWeReadImportOpen, setIsWeReadImportOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const currentProgress = selectedNotebookId ? viewProgress[selectedNotebookId] : null;
  const showExplanation = currentProgress?.showExplanation ?? false;
  const currentMemoId = currentProgress?.currentMemoId ?? null;

  const notebookMemos = useMemo(() => {
    if (!selectedNotebookId) return [];
    return memos
      .filter(m => m.notebookId === selectedNotebookId)
      .sort((a, b) => a.id - b.id);
  }, [memos, selectedNotebookId]);

  const memoCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    memos.forEach(m => {
      counts[m.notebookId] = (counts[m.notebookId] || 0) + 1;
    });
    return counts;
  }, [memos]);

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

  useEffect(() => {
    let listener: PluginListenerHandle | undefined;
    let cancelled = false;

    const setup = async () => {
      const handle = await CapacitorApp.addListener('backButton', ({ canGoBack }) => {
        if (isAddMemoOpen) {
          setIsAddMemoOpen(false);
          setEditMemo(null);
          return;
        }
        if (isAddNotebookOpen) {
          setIsAddNotebookOpen(false);
          return;
        }
        if (isExerciseOpen) {
          setIsExerciseOpen(false);
          return;
        }
        if (isExportOpen) {
          setIsExportOpen(false);
          return;
        }
        if (isImportOpen) {
          setIsImportOpen(false);
          return;
        }
        if (isWeReadImportOpen) {
          setIsWeReadImportOpen(false);
          return;
        }
        if (selectedNotebookId) {
          setSelectedNotebookId(null);
          return;
        }
        if (canGoBack) {
          window.history.back();
        } else {
          CapacitorApp.exitApp();
        }
      });

      if (cancelled) {
        handle.remove();
      } else {
        listener = handle;
      }
    };

    setup();

    return () => {
      cancelled = true;
      if (listener) {
        listener.remove();
      }
    };
  }, [isAddMemoOpen, isAddNotebookOpen, isExerciseOpen, isExportOpen, isImportOpen, isWeReadImportOpen, selectedNotebookId]);

  const updateProgress = useCallback((notebookId: string, updates: Partial<ViewProgress>) => {
    setViewProgress(prev => ({
      ...prev,
      [notebookId]: {
        notebookId,
        currentMemoId: null,
        showExplanation: false,
        ...(prev[notebookId] || {}),
        ...updates
      }
    }));
  }, [setViewProgress]);

  const handleSelectNotebook = useCallback((notebookId: string) => {
    setSelectedNotebookId(notebookId);
    setAppMode('view');
  }, []);

  const handleAddNotebook = useCallback(async (name: string) => {
    const newNotebook: Notebook = {
      id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2),
      name,
      createdAt: new Date().toISOString()
    };
    setNotebooks(prev => [...prev, newNotebook]);
    try {
      await Haptics.impact({ style: ImpactStyle.Medium });
    } catch (error) {
      console.warn('Unable to trigger haptic feedback', error);
    }
  }, [setNotebooks]);

  const handleDeleteNotebook = useCallback(async (notebookId: string) => {
    if (!confirm('Delete this notebook and all its memos?')) return;

    setNotebooks(prev => prev.filter(n => n.id !== notebookId));
    setMemos(prev => prev.filter(m => m.notebookId !== notebookId));
    setViewProgress(prev => {
      const next = { ...prev };
      delete next[notebookId];
      return next;
    });
    setSelectedNotebookId(null);

    try {
      await Haptics.impact({ style: ImpactStyle.Heavy });
    } catch (error) {
      console.warn('Unable to trigger haptic feedback', error);
    }
  }, [setNotebooks, setMemos, setViewProgress]);

  const getNextMemoId = useCallback(() => {
    const maxId = memos.reduce((max, m) => Math.max(max, m.id), 0);
    return maxId + 1;
  }, [memos]);

  const handleAddMemo = useCallback(async (originalText: string, explanation: string) => {
    if (!selectedNotebookId) return;

    const newMemo: Memo = {
      id: getNextMemoId(),
      originalText,
      explanation,
      notebookId: selectedNotebookId,
      createdAt: new Date().toISOString()
    };
    setMemos(prev => [...prev, newMemo]);

    if (!currentMemoId) {
      updateProgress(selectedNotebookId, { currentMemoId: newMemo.id });
    }

    try {
      await Haptics.impact({ style: ImpactStyle.Medium });
    } catch (error) {
      console.warn('Unable to trigger haptic feedback', error);
    }
  }, [selectedNotebookId, getNextMemoId, setMemos, currentMemoId, updateProgress]);

  const handleEditMemo = useCallback(async (updatedMemo: Memo) => {
    setMemos(prev => prev.map(m => m.id === updatedMemo.id ? updatedMemo : m));
    setEditMemo(null);

    try {
      await Haptics.impact({ style: ImpactStyle.Light });
    } catch (error) {
      console.warn('Unable to trigger haptic feedback', error);
    }
  }, [setMemos]);

  const handleDeleteMemo = useCallback(async (memoId: number) => {
    if (!confirm('Delete this memo?')) return;

    setMemos(prev => prev.filter(m => m.id !== memoId));

    if (selectedNotebookId) {
      const remainingMemos = notebookMemos.filter(m => m.id !== memoId);
      if (remainingMemos.length > 0) {
        const currentIndex = notebookMemos.findIndex(m => m.id === memoId);
        const newIndex = Math.min(currentIndex, remainingMemos.length - 1);
        updateProgress(selectedNotebookId, { currentMemoId: remainingMemos[newIndex].id });
      } else {
        updateProgress(selectedNotebookId, { currentMemoId: null });
      }
    }

    try {
      await Haptics.impact({ style: ImpactStyle.Heavy });
    } catch (error) {
      console.warn('Unable to trigger haptic feedback', error);
    }
  }, [setMemos, selectedNotebookId, notebookMemos, updateProgress]);

  const handleToggleExplanation = useCallback(() => {
    if (selectedNotebookId) {
      updateProgress(selectedNotebookId, { showExplanation: !showExplanation });
    }
  }, [selectedNotebookId, showExplanation, updateProgress]);

  const handleNavigateMemo = useCallback((memoId: number) => {
    if (selectedNotebookId) {
      updateProgress(selectedNotebookId, { currentMemoId: memoId });
    }
  }, [selectedNotebookId, updateProgress]);

  const handleStartExercise = useCallback(() => {
    setIsExerciseOpen(true);
  }, []);

  const handleExerciseComplete = useCallback((results: ExerciseResult[]) => {
    console.log('Exercise results:', results);
    setIsExerciseOpen(false);
  }, []);

  const handleExport = useCallback(async (selectedNotebookIds: string[]) => {
    const selectedNotebooks = notebooks.filter(n => selectedNotebookIds.includes(n.id));
    const selectedMemos = memos.filter(m => selectedNotebookIds.includes(m.notebookId));
    const selectedProgress: Record<string, ViewProgress> = {};
    selectedNotebookIds.forEach(id => {
      if (viewProgress[id]) {
        selectedProgress[id] = viewProgress[id];
      }
    });

    const data = {
      notebooks: selectedNotebooks,
      memos: selectedMemos,
      viewProgress: selectedProgress
    };
    const dataStr = JSON.stringify(data, null, 2);

    if (Capacitor.isNativePlatform()) {
      try {
        const fileName = `memo-pads-${Date.now()}.json`;
        await Filesystem.writeFile({
          path: fileName,
          data: dataStr,
          directory: Directory.Documents,
          encoding: Encoding.UTF8
        });
        alert(`Data exported to Documents/${fileName}`);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        alert('Failed to export data: ' + message);
      }
    } else {
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'memo-pads.json';
      a.click();
      URL.revokeObjectURL(url);
    }
    setIsExportOpen(false);
    setIsMenuOpen(false);
  }, [notebooks, memos, viewProgress]);

  const handleImport = useCallback((newNotebooks: Notebook[], newMemos: Memo[], updatedNotebooks: Notebook[]) => {
    if (updatedNotebooks.length > 0) {
      setNotebooks(prev => prev.map(n => {
        const updated = updatedNotebooks.find(u => u.id === n.id);
        return updated || n;
      }));
    }
    if (newNotebooks.length > 0) {
      setNotebooks(prev => [...prev, ...newNotebooks]);
    }
    if (newMemos.length > 0) {
      setMemos(prev => [...prev, ...newMemos]);
    }
    setIsImportOpen(false);
    setIsMenuOpen(false);
    const totalNotebooks = newNotebooks.length + updatedNotebooks.length;
    alert(`Imported ${totalNotebooks} notebooks and ${newMemos.length} memos.`);
  }, [setNotebooks, setMemos]);

  const handleWeReadImport = useCallback((newMemos: Memo[], notebookName: string) => {
    let targetNotebook = notebooks.find(n => n.name === notebookName);
    let targetNotebookId: string;

    if (targetNotebook) {
      targetNotebookId = targetNotebook.id;
    } else {
      targetNotebookId = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2);
      const newNotebook: Notebook = {
        id: targetNotebookId,
        name: notebookName,
        createdAt: new Date().toISOString()
      };
      setNotebooks(prev => [...prev, newNotebook]);
    }

    const memosWithNotebookId = newMemos.map(m => ({
      ...m,
      notebookId: targetNotebookId
    }));

    setMemos(prev => [...prev, ...memosWithNotebookId]);
    setIsWeReadImportOpen(false);
    setIsMenuOpen(false);
    alert(`Imported ${newMemos.length} notes to "${notebookName}".`);
  }, [notebooks, setNotebooks, setMemos]);

  const handleOpenAddMemo = () => {
    setEditMemo(null);
    setIsAddMemoOpen(true);
  };

  const handleOpenEditMemo = (memo: Memo) => {
    setEditMemo(memo);
    setIsAddMemoOpen(true);
  };

  const initialMemoId = useMemo(() => {
    if (notebookMemos.length === 0) return null;
    if (currentMemoId && notebookMemos.some(m => m.id === currentMemoId)) {
      return currentMemoId;
    }
    return notebookMemos[0].id;
  }, [notebookMemos, currentMemoId]);

  useEffect(() => {
    if (selectedNotebookId && initialMemoId !== currentMemoId) {
      updateProgress(selectedNotebookId, { currentMemoId: initialMemoId });
    }
  }, [selectedNotebookId, initialMemoId, currentMemoId, updateProgress]);

  if (!selectedNotebookId) {
    return (
      <div className="app-shell">
        <header className="app-header">
          <div>
            <p className="eyebrow">Vocabulary Book</p>
            <h1>Memo Pads</h1>
            <p className="subtitle">
              Organize your vocabulary with notebooks. Learn and review with exercise mode.
            </p>
          </div>
          <div className="header-menu">
            <button
              type="button"
              className="menu-btn"
              onClick={() => setIsMenuOpen(v => !v)}
            >
              ⋮
            </button>
            {isMenuOpen && (
              <div ref={menuRef} className="menu-dropdown">
                <button type="button" onClick={() => { setIsExportOpen(true); setIsMenuOpen(false); }}>
                  Export Data
                </button>
                <button type="button" onClick={() => { setIsImportOpen(true); setIsMenuOpen(false); }}>
                  Import Data
                </button>
              </div>
            )}
          </div>
        </header>

        <main>
          <section className="container">
            <NotebookList
              notebooks={notebooks}
              selectedNotebookId={selectedNotebookId}
              onSelect={handleSelectNotebook}
              onAdd={() => setIsAddNotebookOpen(true)}
              onDelete={handleDeleteNotebook}
              memoCounts={memoCounts}
            />
          </section>
        </main>

        <AddNotebookOverlay
          isOpen={isAddNotebookOpen}
          onClose={() => setIsAddNotebookOpen(false)}
          onSave={handleAddNotebook}
        />

        <ExportOverlay
          isOpen={isExportOpen}
          notebooks={notebooks}
          memos={memos}
          onClose={() => setIsExportOpen(false)}
          onExport={handleExport}
        />

        <ImportOverlay
          isOpen={isImportOpen}
          existingNotebooks={notebooks}
          existingMemos={memos}
          getNextMemoId={getNextMemoId}
          onClose={() => setIsImportOpen(false)}
          onImport={handleImport}
        />
      </div>
    );
  }

  const selectedNotebook = notebooks.find(n => n.id === selectedNotebookId);

  return (
    <div className="app-shell">
      <header className="app-header app-header--compact">
        <button
          type="button"
          className="back-btn"
          onClick={() => setSelectedNotebookId(null)}
        >
          ← Back
        </button>
        <div className="notebook-title">
          <h1>{selectedNotebook?.name}</h1>
          <p className="memo-count">{notebookMemos.length} memos</p>
        </div>
        <div className="header-menu">
          <button
            type="button"
            className="menu-btn"
            onClick={() => setIsMenuOpen(v => !v)}
          >
            ⋮
          </button>
          {isMenuOpen && (
            <div ref={menuRef} className="menu-dropdown">
              <button type="button" onClick={() => { setIsWeReadImportOpen(true); setIsMenuOpen(false); }}>
                Import WeRead Notes
              </button>
            </div>
          )}
        </div>
      </header>

      <main>
        <section className="container">
          <div className="mode-switch">
            <button
              type="button"
              className={clsx('mode-btn', { active: appMode === 'view' })}
              onClick={() => setAppMode('view')}
            >
              View Mode
            </button>
            <button
              type="button"
              className={clsx('mode-btn', { active: appMode === 'exercise' })}
              onClick={handleStartExercise}
            >
              Exercise Mode
            </button>
          </div>

          {appMode === 'view' && (
            <MemoList
              memos={notebookMemos}
              showExplanation={showExplanation}
              currentMemoId={initialMemoId}
              onToggleExplanation={handleToggleExplanation}
              onNavigate={handleNavigateMemo}
              onAdd={handleOpenAddMemo}
              onEdit={handleOpenEditMemo}
              onDelete={handleDeleteMemo}
            />
          )}

          {appMode === 'exercise' && (
            <div className="exercise-intro">
              <p>Click "Start Exercise" to begin reviewing your memos in random order.</p>
              <button
                type="button"
                className="btn-primary btn-lg"
                onClick={handleStartExercise}
              >
                Start Exercise
              </button>
            </div>
          )}
        </section>
      </main>

      <AddMemoOverlay
        isOpen={isAddMemoOpen}
        onClose={() => {
          setIsAddMemoOpen(false);
          setEditMemo(null);
        }}
        onSave={handleAddMemo}
        onEdit={handleEditMemo}
        editMemo={editMemo}
      />

      <ExerciseOverlay
        isOpen={isExerciseOpen}
        memos={notebookMemos}
        onClose={() => setIsExerciseOpen(false)}
        onComplete={handleExerciseComplete}
      />

      <WeReadImportOverlay
        isOpen={isWeReadImportOpen}
        currentNotebookName={selectedNotebook?.name || ''}
        existingMemos={notebookMemos}
        getNextMemoId={getNextMemoId}
        onClose={() => setIsWeReadImportOpen(false)}
        onImport={handleWeReadImport}
      />
    </div>
  );
};

export default App;
