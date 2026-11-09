import { useState, useEffect, useCallback } from 'react';

export function usePersistentState<T>(key: string, initialValue: T): [T, (value: T | ((prev: T) => T)) => void] {
  const [state, setState] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(key);
      if (stored !== null) return JSON.parse(stored) as T;
    } catch {
      // ignore parse errors
    }
    return initialValue;
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch {
      // ignore write errors
    }
  }, [key, state]);

  const setPersistentState = useCallback((value: T | ((prev: T) => T)) => {
    setState(prev => (value instanceof Function ? (value as (prev: T) => T)(prev) : value));
  }, []);

  return [state, setPersistentState];
}
