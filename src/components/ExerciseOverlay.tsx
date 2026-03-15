import { useState, useEffect, useCallback } from 'react';
import { Memo, ExerciseResult } from '../types/memo';
import clsx from 'clsx';

interface ExerciseOverlayProps {
  isOpen: boolean;
  memos: Memo[];
  onClose: () => void;
  onComplete: (results: ExerciseResult[]) => void;
}

const ExerciseOverlay = ({
  isOpen,
  memos,
  onClose,
  onComplete
}: ExerciseOverlayProps) => {
  const [shuffledMemos, setShuffledMemos] = useState<Memo[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [results, setResults] = useState<ExerciseResult[]>([]);
  const [showExplanation, setShowExplanation] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const startExercise = useCallback(() => {
    setShuffledMemos(shuffleArray(memos));
    setCurrentIndex(0);
    setResults([]);
    setShowExplanation(false);
    setIsComplete(false);
  }, [memos]);

  useEffect(() => {
    if (isOpen && memos.length > 0) {
      startExercise();
    }
  }, [isOpen, memos, startExercise]);

  const currentMemo = shuffledMemos[currentIndex];

  const handleAnswer = (remembered: boolean) => {
    const result: ExerciseResult = {
      memoId: currentMemo.id,
      remembered,
      timestamp: new Date().toISOString()
    };
    setResults(prev => [...prev, result]);

    if (currentIndex < shuffledMemos.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setShowExplanation(false);
    } else {
      setIsComplete(true);
    }
  };

  const handleComplete = () => {
    onComplete(results);
    onClose();
  };

  if (!isOpen) return null;

  if (memos.length === 0) {
    return (
      <div className="overlay">
        <div className="overlay-backdrop" onClick={onClose} />
        <div className="overlay-panel exercise-panel">
          <div className="exercise-empty">
            <h2>No Memos to Exercise</h2>
            <p>Add some memos to this notebook first!</p>
            <button type="button" className="btn-primary" onClick={onClose}>
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isComplete) {
    const correctCount = results.filter(r => r.remembered).length;
    const percentage = Math.round((correctCount / results.length) * 100);

    return (
      <div className="overlay">
        <div className="overlay-backdrop" />
        <div className="overlay-panel exercise-panel">
          <div className="exercise-complete">
            <h2>Exercise Complete!</h2>
            <div className="exercise-score">
              <div className="score-circle">
                <span className="score-value">{percentage}%</span>
              </div>
              <p className="score-detail">
                {correctCount} out of {results.length} remembered
              </p>
            </div>
            <div className="exercise-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={startExercise}
              >
                Try Again
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={handleComplete}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="overlay">
      <div className="overlay-backdrop" onClick={onClose} />
      <div className="overlay-panel exercise-panel">
        <div className="exercise-header">
          <button type="button" className="overlay-back" onClick={onClose}>
            ← Exit
          </button>
          <span className="exercise-progress">
            {currentIndex + 1} / {shuffledMemos.length}
          </span>
        </div>

        <div className="progress-bar progress-bar--lg">
          <div
            className="progress-bar__fill"
            style={{ width: `${((currentIndex + 1) / shuffledMemos.length) * 100}%` }}
          />
        </div>

        <div className="exercise-card">
          <button
            type="button"
            className={clsx('exercise-original', { reveal: showExplanation })}
            onClick={() => setShowExplanation(true)}
          >
            {currentMemo?.originalText}
          </button>

          {showExplanation && (
            <div className="exercise-explanation">
              <p>{currentMemo?.explanation}</p>
            </div>
          )}
        </div>

        <div className="exercise-buttons">
          <button
            type="button"
            className="exercise-btn exercise-btn--wrong"
            onClick={() => handleAnswer(false)}
          >
            ×
          </button>
          <button
            type="button"
            className="exercise-btn exercise-btn--correct"
            onClick={() => handleAnswer(true)}
          >
            ✓
          </button>
        </div>

        <p className="exercise-hint">
          {showExplanation
            ? 'Did you remember it correctly?'
            : 'Tap the text to reveal the explanation'}
        </p>
      </div>
    </div>
  );
};

export default ExerciseOverlay;
