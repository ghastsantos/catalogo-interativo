import { useCallback, useEffect, useRef, useState } from 'react';
import { appendUnique } from '../domain/catalog';
import { friendlyError, getShows } from '../services/tvmaze';
import type { Show } from '../types/models';

type Phase = 'initial' | 'refresh' | 'more';
export function useCatalog() {
  const [data, setData] = useState<Show[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [moreError, setMoreError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const request = useRef<AbortController | null>(null);
  const page = useRef(0);
  const busy = useRef(false);
  const generation = useRef(0);
  const lastFailedPhase = useRef<Phase>('initial');
  const mayLoadMore = useRef(true);
  const blocked = useRef(false);

  const load = useCallback(async (phase: Phase) => {
    if (phase === 'more' && (busy.current || !mayLoadMore.current || blocked.current)) return;
    request.current?.abort();
    const controller = new AbortController();
    request.current = controller;
    const version = ++generation.current;
    busy.current = true;
    setError(null); setMoreError(null);
    setLoading(phase === 'initial'); setRefreshing(phase === 'refresh'); setLoadingMore(phase === 'more');
    const nextPage = phase === 'more' ? page.current : 0;
    try {
      const result = await getShows(nextPage, controller.signal);
      if (controller.signal.aborted || version !== generation.current) return;
      const items = result ?? [];
      setData((old) => phase === 'more' ? appendUnique(old, items) : items);
      page.current = nextPage + 1;
      mayLoadMore.current = result !== null;
      setHasMore(mayLoadMore.current); blocked.current = false;
    } catch (caught) {
      if (controller.signal.aborted || version !== generation.current) return;
      lastFailedPhase.current = phase; blocked.current = true;
      if (phase === 'more') setMoreError(friendlyError(caught)); else setError(friendlyError(caught));
    } finally {
      if (!controller.signal.aborted && version === generation.current) {
        busy.current = false; setLoading(false); setRefreshing(false); setLoadingMore(false);
      }
    }
  }, []);
  useEffect(() => { void load('initial'); return () => { request.current?.abort(); generation.current += 1; }; }, [load]);
  const refresh = useCallback(() => { blocked.current = false; void load('refresh'); }, [load]);
  const loadMore = useCallback(() => { void load('more'); }, [load]);
  const retry = useCallback(() => { blocked.current = false; void load(lastFailedPhase.current); }, [load]);
  return { data, loading, refreshing, loadingMore, error, moreError, hasMore, refresh, loadMore, retry };
}
