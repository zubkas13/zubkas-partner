import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { toSnakeRow, toCamelRow } from '@/utils/caseConvert';

type Row = Record<string, unknown>;

/**
 * A React hook that provides true per-row CRUD operations against a Supabase
 * table, with realtime subscriptions so changes from any client are reflected
 * live in local state.
 *
 * - `insertRow(row)` — inserts one row (camelCase keys auto-converted)
 * - `updateRow(id, updates)` — patches one row by id
 * - `deleteRow(id)` — deletes one row by id
 * - `upsertRow(row)` — upserts one row (uses id as the conflict key)
 * - `replaceAll(rows)` — replaces every row (used by reset/clear)
 *
 * The `state` array is always kept in sync via Supabase Realtime
 * (postgres_changes on INSERT/UPDATE/DELETE).
 */
export function useSupabaseCollection<T extends { id: string }>(
  table: string,
  initialValue: T[],
  orderColumn: string = 'created_at'
): {
  state: T[];
  loaded: boolean;
  insertRow: (row: T) => Promise<T>;
  updateRow: (id: string, updates: Partial<T>) => Promise<void>;
  deleteRow: (id: string) => Promise<void>;
  upsertRow: (row: T) => Promise<void>;
  replaceAll: (rows: T[]) => Promise<void>;
  setState: React.Dispatch<React.SetStateAction<T[]>>;
} {
  const [state, setState] = useState<T[]>(initialValue);
  const [loaded, setLoaded] = useState(false);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  // Load initial data + subscribe to realtime changes
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const { data, error } = await supabase.from(table).select('*').order(orderColumn, { ascending: false });
        if (!cancelled && !error && data) {
          const camelData = (data as Row[]).map(row => toCamelRow<Row>(row)) as unknown as T[];
          setState(camelData);
        }
      } catch {
        // fall back to initialValue
      }
      if (!cancelled) setLoaded(true);
    })();

    const channel = supabase
      .channel(`realtime-${table}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table }, (payload) => {
        const newRow = toCamelRow<Row>(payload.new as Row) as unknown as T;
        setState(prev => {
          if (prev.some(r => r.id === newRow.id)) return prev;
          return [newRow, ...prev];
        });
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table }, (payload) => {
        const updatedRow = toCamelRow<Row>(payload.new as Row) as unknown as T;
        setState(prev => prev.map(r => (r.id === updatedRow.id ? { ...r, ...updatedRow } : r)));
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table }, (payload) => {
        const oldId = (payload.old as Row).id as string;
        setState(prev => prev.filter(r => r.id !== oldId));
      })
      .subscribe();

    channelRef.current = channel;

    return () => {
      cancelled = true;
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [table, orderColumn]);

  const insertRow = useCallback(async (row: T) => {
    const snake = toSnakeRow(row as unknown as Row);
    // Omit empty/falsy id so the database can auto-generate it (e.g. UUID default)
    if (!snake.id) delete snake.id;
    // Omit undefined, null, and empty-string values so DB defaults / NULL apply for nullable columns
    for (const key of Object.keys(snake)) {
      if (snake[key] === undefined || snake[key] === null || snake[key] === '') delete snake[key];
    }
    const { data, error } = await supabase.from(table).insert(snake).select();
    if (error) throw new Error(error.message);
    // Use the actual inserted row (with DB-generated id) for the state update
    const inserted = data && data.length > 0
      ? toCamelRow<Row>(data[0] as Row) as unknown as T
      : row;
    setState(prev => {
      if (prev.some(r => r.id === inserted.id)) return prev;
      return [inserted, ...prev];
    });
    return inserted;
  }, [table]);

  const updateRow = useCallback(async (id: string, updates: Partial<T>) => {
    const snake = toSnakeRow(updates as unknown as Row);
    // Omit undefined, null, and empty-string values so DB defaults / NULL apply for nullable columns
    for (const key of Object.keys(snake)) {
      if (snake[key] === undefined || snake[key] === null || snake[key] === '') delete snake[key];
    }
    // Optimistic update: reflect changes in local state immediately
    setState(prev => prev.map(r => (r.id === id ? { ...r, ...updates } : r)));
    const { error } = await supabase.from(table).update(snake).eq('id', id);
    if (error) throw new Error(error.message);
  }, [table]);

  const deleteRow = useCallback(async (id: string) => {
    const { error } = await supabase.from(table).delete().eq('id', id);
    if (error) throw new Error(error.message);
    setState(prev => prev.filter(r => r.id !== id));
  }, [table]);

  const upsertRow = useCallback(async (row: T) => {
    const snake = toSnakeRow(row as unknown as Row);
    // Omit empty/falsy id so the database can auto-generate it
    if (!snake.id) delete snake.id;
    // Omit undefined and empty-string values so DB defaults / NULL apply for nullable columns
    for (const key of Object.keys(snake)) {
      if (snake[key] === undefined || snake[key] === '') delete snake[key];
    }
    await supabase.from(table).upsert(snake, { onConflict: 'id' });
    setState(prev => {
      const idx = prev.findIndex(r => r.id === row.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = row;
        return next;
      }
      return [row, ...prev];
    });
  }, [table]);

  const replaceAll = useCallback(async (rows: T[]) => {
    // Delete all existing rows, then insert the new set
    await supabase.from(table).delete().neq('id', '___impossible___');
    if (rows.length > 0) {
      const snakeRows = rows.map(r => {
        const snake = toSnakeRow(r as unknown as Row);
        if (!snake.id) delete snake.id;
        for (const key of Object.keys(snake)) {
          if (snake[key] === undefined || snake[key] === '') delete snake[key];
        }
        return snake;
      });
      await supabase.from(table).insert(snakeRows);
    }
    setState(rows);
  }, [table]);

  return { state, loaded, insertRow, updateRow, deleteRow, upsertRow, replaceAll, setState };
}

/**
 * Singleton hook for tables that store a single JSON document (e.g. site_content).
 * Reads/writes one row with id='singleton' and a jsonb column.
 * Also subscribes to realtime updates.
 */
export function useSupabaseSingleton<T>(
  table: string,
  initialValue: T,
  column: string = 'content'
): [T, (value: T | ((prev: T) => T)) => void, boolean] {
  const [state, setState] = useState<T>(initialValue);
  const [loaded, setLoaded] = useState(false);
  const isInitialLoad = useRef(true);
  const skipNextWrite = useRef(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data, error } = await supabase
          .from(table)
          .select(column)
          .eq('id', 'singleton')
          .maybeSingle();
        if (!cancelled && !error && data) {
          const val = (data as unknown as Record<string, unknown>)[column];
          if (val !== null && val !== undefined) {
            skipNextWrite.current = true;
            setState(val as T);
          }
        }
      } catch {
        // ignore
      }
      if (!cancelled) {
        setLoaded(true);
        isInitialLoad.current = false;
      }
    })();

    const channel = supabase
      .channel(`realtime-${table}-singleton`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table }, (payload) => {
        const newRow = payload.new as Record<string, unknown>;
        const val = newRow[column];
        if (val !== null && val !== undefined) {
          skipNextWrite.current = true;
          setState(val as T);
        }
      })
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [table, column]);

  useEffect(() => {
    if (isInitialLoad.current) return;
    if (skipNextWrite.current) {
      skipNextWrite.current = false;
      return;
    }
    (async () => {
      try {
        await supabase
          .from(table)
          .upsert({ id: 'singleton', [column]: state, updated_at: new Date().toISOString() });
      } catch {
        // ignore
      }
    })();
  }, [state, table, column]);

  const setSupabaseState = useCallback((value: T | ((prev: T) => T)) => {
    setState(prev => (value instanceof Function ? (value as (prev: T) => T)(prev) : value));
  }, []);

  return [state, setSupabaseState, loaded];
}
