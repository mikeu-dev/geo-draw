import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useUndoHistory } from '@/hooks/useUndoHistory';

describe('useUndoHistory Hook', () => {
  it('should initialize with correct state and flags', () => {
    const { result } = renderHook(() => useUndoHistory('initial'));

    expect(result.current.state).toBe('initial');
    expect(result.current.canUndo).toBe(false);
    expect(result.current.canRedo).toBe(false);
  });

  it('should update state and past history when set is called', () => {
    const { result } = renderHook(() => useUndoHistory('initial'));

    act(() => {
      result.current.set('state1');
    });

    expect(result.current.state).toBe('state1');
    expect(result.current.canUndo).toBe(true);
    expect(result.current.canRedo).toBe(false);
  });

  it('should not update history if set is called with the same state', () => {
    const { result } = renderHook(() => useUndoHistory('initial'));

    act(() => {
      result.current.set('initial');
    });

    expect(result.current.state).toBe('initial');
    expect(result.current.canUndo).toBe(false);
  });

  it('should handle undo and redo operations correctly', () => {
    const { result } = renderHook(() => useUndoHistory('initial'));

    act(() => {
      result.current.set('state1');
    });
    act(() => {
      result.current.set('state2');
    });

    expect(result.current.state).toBe('state2');

    // Undo to state1
    act(() => {
      const prev = result.current.undo();
      expect(prev).toBe('state1');
    });
    expect(result.current.state).toBe('state1');
    expect(result.current.canUndo).toBe(true);
    expect(result.current.canRedo).toBe(true);

    // Undo to initial
    act(() => {
      const prev = result.current.undo();
      expect(prev).toBe('initial');
    });
    expect(result.current.state).toBe('initial');
    expect(result.current.canUndo).toBe(false);
    expect(result.current.canRedo).toBe(true);

    // Redo to state1
    act(() => {
      const next = result.current.redo();
      expect(next).toBe('state1');
    });
    expect(result.current.state).toBe('state1');
    expect(result.current.canUndo).toBe(true);
    expect(result.current.canRedo).toBe(true);

    // Redo to state2
    act(() => {
      const next = result.current.redo();
      expect(next).toBe('state2');
    });
    expect(result.current.state).toBe('state2');
    expect(result.current.canUndo).toBe(true);
    expect(result.current.canRedo).toBe(false);
  });

  it('should limit the history size', () => {
    const { result } = renderHook(() => useUndoHistory('initial', 2));

    act(() => {
      result.current.set('state1');
    });
    act(() => {
      result.current.set('state2');
    });
    act(() => {
      result.current.set('state3');
    });

    // History is limited to 2: past should contain ['state2', 'state3'] when current is state3
    act(() => {
      result.current.undo();
    }); // goes to state2
    expect(result.current.state).toBe('state2');

    act(() => {
      result.current.undo();
    }); // goes to state1
    expect(result.current.state).toBe('state1');

    act(() => {
      result.current.undo();
    }); // can't undo further because limit is 2
    expect(result.current.state).toBe('state1');
  });

  it('should reset state and clear history', () => {
    const { result } = renderHook(() => useUndoHistory('initial'));

    act(() => {
      result.current.set('state1');
    });
    expect(result.current.canUndo).toBe(true);

    act(() => {
      result.current.reset('resetState');
    });

    expect(result.current.state).toBe('resetState');
    expect(result.current.canUndo).toBe(false);
    expect(result.current.canRedo).toBe(false);
  });
});
