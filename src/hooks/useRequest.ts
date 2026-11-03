import { useCallback, useEffect, useState } from 'react';
import { friendlyError } from '../services/tvmaze';

/** O fetcher deve ser estável (useCallback); cada execução tem seu próprio cancelamento. */
export function useRequest<T>(fetcher: (signal: AbortSignal) => Promise<T>, enabled = true) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    if (!enabled) { setLoading(false); setData(null); setError(null); return; }
    const controller = new AbortController();
    setLoading(true); setData(null); setError(null);
    fetcher(controller.signal).then((result) => {
      if (!controller.signal.aborted) setData(result);
    }).catch((caught) => {
      if (!controller.signal.aborted) setError(friendlyError(caught));
    }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [fetcher, enabled, attempt]);
  const retry = useCallback(() => setAttempt((value) => value + 1), []);
  return { data, loading, error, retry };
}
