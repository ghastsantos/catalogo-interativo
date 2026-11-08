import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { AppState } from 'react-native';
import * as Crypto from 'expo-crypto';
import { changeLibrary, emptyLibrary, reconcileLibrary, type LibraryAction } from '../domain/library';
import { readLibrary, writeLibrary } from '../services/libraryStorage';
import { syncCloudLibrary } from '../services/cloudLibrary';
import type { AppUser, LibrarySnapshot, Show } from '../types/models';
import { Feedback } from '../components/Feedback';

interface LibraryValue {
  snapshot: LibrarySnapshot; saving: boolean; syncing: boolean; error: string | null;
  syncError: string | null; update: (show: Show, action: LibraryAction) => Promise<void>;
  sync: () => Promise<void>; clearError: () => void;
}
const LibraryContext = createContext<LibraryValue | undefined>(undefined);

export function LibraryProvider({ user, children }: { user: AppUser; children: ReactNode }) {
  const [snapshot, setSnapshot] = useState(emptyLibrary);
  const stateRef = useRef(snapshot);
  const active = useRef(true);
  const queue = useRef(Promise.resolve());
  const syncRunning = useRef(false);
  const [loaded, setLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [savingCount, setSavingCount] = useState(0);
  const [syncing, setSyncing] = useState(false);
  const [syncRetryCount, setSyncRetryCount] = useState(0);
  const [attempt, setAttempt] = useState(0);
  const [syncRevision, setSyncRevision] = useState(0);

  useEffect(() => {
    active.current = true;
    return () => { active.current = false; };
  }, []);
  useEffect(() => {
    let current = true;
    setLoaded(false); setLoadError(null);
    async function hydrate() {
      try {
        let saved = await readLibrary(user);
        if (user.provider === 'supabase') {
          try {
            const sent = saved.pending.map((id) => saved.entries[id]!).filter(Boolean);
            const remote = await syncCloudLibrary(user.id, sent);
            if (!current) return;
            const reconciled = reconcileLibrary(saved, sent, remote);
            await writeLibrary(user, reconciled);
            saved = reconciled;
          } catch {
            if (current) setSyncError('Não foi possível sincronizar com a nuvem. As alterações serão reenviadas quando a conexão voltar.');
          }
        }
        if (current) { stateRef.current = saved; setSnapshot(saved); setLoaded(true); }
      } catch {
        if (current) setLoadError('Não foi possível carregar sua biblioteca. Tente novamente.');
      }
    }
    void hydrate();
    return () => { current = false; };
  }, [user.id, user.provider, attempt]); // Provider é remontado na troca de usuário.

  const transact = useCallback((transform: (state: LibrarySnapshot) => LibrarySnapshot) => {
    const operation = queue.current.catch(() => undefined).then(async () => {
      const next = transform(stateRef.current);
      await writeLibrary(user, next);
      stateRef.current = next;
      if (active.current) setSnapshot(next);
    });
    queue.current = operation;
    return operation;
  }, [user.id, user.provider]);

  const update = useCallback(async (show: Show, action: LibraryAction) => {
    if (!loaded) return;
    setSavingCount((count) => count + 1); setError(null);
    try {
      await transact((state) => {
        const next = changeLibrary(state, show, action, Crypto.randomUUID());
        return user.provider === 'local' ? { ...next, pending: [] } : next;
      });
    } catch (caught) {
      if (active.current) setError(caught instanceof Error ? `Não foi possível salvar: ${caught.message}` : 'Não foi possível salvar. Tente novamente.');
    } finally { if (active.current) setSavingCount((count) => count - 1); }
  }, [loaded, transact, user.provider]);

  const sync = useCallback(async () => {
    if (!loaded || user.provider !== 'supabase' || syncRunning.current) return;
    syncRunning.current = true; setSyncing(true); setSyncError(null);
    let succeeded = false;
    try {
      await queue.current.catch(() => undefined);
      if (!active.current) return;
      const sent = stateRef.current.pending.map((id) => stateRef.current.entries[id]!).filter(Boolean);
      const remote = await syncCloudLibrary(user.id, sent);
      if (!active.current) return;
      await transact((current) => reconcileLibrary(current, sent, remote));
      succeeded = true;
      setSyncRetryCount(0);
    } catch {
      if (active.current) {
        setSyncError('A nuvem não respondeu. As alterações continuam pendentes para sincronização.');
        setSyncRetryCount((count) => count + 1);
      }
    } finally {
      syncRunning.current = false;
      if (active.current) {
        setSyncing(false);
        // Uma edição durante a sincronização merece outra rodada, sem perder sua revisão.
        if (succeeded && stateRef.current.pending.length) setSyncRevision((value) => value + 1);
      }
    }
  }, [loaded, transact, user.id, user.provider]);

  const pendingRevision = snapshot.pending.map((id) => snapshot.entries[id]?.revision).join(',');
  useEffect(() => {
    if (!loaded || (!snapshot.pending.length && !syncError && syncRevision === 0)) return;
    const delay = syncError ? Math.min(30000, 1000 * 2 ** Math.min(syncRetryCount, 5)) : 600;
    const timer = setTimeout(() => { void sync(); }, delay);
    return () => clearTimeout(timer);
  }, [sync, loaded, pendingRevision, syncError, syncRetryCount, syncRevision]);
  useEffect(() => {
    const listener = AppState.addEventListener('change', (state) => { if (state === 'active') void sync(); });
    return () => listener.remove();
  }, [sync]);
  const clearError = useCallback(() => setError(null), []);
  const value = useMemo(() => ({ snapshot, saving: savingCount > 0, syncing, error, syncError, update, sync, clearError }),
    [snapshot, savingCount, syncing, error, syncError, update, sync, clearError]);

  if (loadError) return <Feedback title="Sua biblioteca está protegida" message={loadError} onRetry={() => setAttempt((n) => n + 1)} full />;
  if (!loaded) return <Feedback loading title="Abrindo sua biblioteca…" full />;
  return <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>;
}
export function useLibrary(): LibraryValue {
  const context = useContext(LibraryContext);
  if (!context) throw new Error('useLibrary deve ser usado dentro de LibraryProvider.');
  return context;
}
