import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { AppState, Platform } from 'react-native';
import type { User } from '@supabase/supabase-js';
import { normalizeEmail, validateCredentials, validateName } from '../domain/validation';
import { localAuth } from '../services/localAuth';
import { authMode, configurationError, supabase } from '../services/supabase';
import type { AppUser } from '../types/models';

interface AuthValue {
  user: AppUser | null; loading: boolean; busy: boolean; error: string | null;
  bootstrapError: string | null; notice: string | null;
  retry: () => void; clearMessages: () => void;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}
const AuthContext = createContext<AuthValue | undefined>(undefined);
const fromSupabase = (user: User): AppUser => ({
  id: user.id, email: user.email ?? '', provider: 'supabase',
  name: typeof user.user_metadata.name === 'string' ? user.user_metadata.name : 'Você',
});

function authError(error: unknown): string {
  if (error && typeof error === 'object' && 'code' in error) {
    const code = String(error.code);
    if (code === 'invalid_credentials') return 'E-mail ou senha incorretos.';
    if (code === 'email_not_confirmed') return 'Confirme seu e-mail antes de entrar.';
    if (code.includes('rate_limit')) return 'Muitas tentativas. Aguarde um pouco e tente novamente.';
    if (code === 'user_already_exists') return 'Este e-mail já está cadastrado.';
    return 'Não foi possível concluir a autenticação. Verifique os dados e tente novamente.';
  }
  if (error instanceof TypeError) return 'Não conseguimos conectar. Verifique sua internet.';
  return error instanceof Error ? error.message : 'Não foi possível concluir. Tente novamente.';
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const authRunning = useRef(false);
  const [error, setError] = useState<string | null>(null);
  const [bootstrapError, setBootstrapError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    let authEventReceived = false;
    setLoading(true); setBootstrapError(null);
    const subscription = supabase?.auth.onAuthStateChange((_event, session) => {
      authEventReceived = true;
      if (active) setUser(session ? fromSupabase(session.user) : null);
    });
    async function restore() {
      try {
        if (configurationError) throw new Error(configurationError);
        if (supabase) {
          const { data, error: sessionError } = await supabase.auth.getSession();
          if (sessionError) throw sessionError;
          if (active && !authEventReceived) setUser(data.session ? fromSupabase(data.session.user) : null);
        } else {
          const saved = await localAuth.restore();
          if (active) setUser(saved);
        }
      } catch (caught) { if (active) setBootstrapError(authError(caught)); }
      finally { if (active) setLoading(false); }
    }
    void restore();
    return () => { active = false; subscription?.data.subscription.unsubscribe(); };
  }, [attempt]);

  useEffect(() => {
    if (!supabase || Platform.OS === 'web') return;
    const client = supabase;
    if (AppState.currentState === 'active') client.auth.startAutoRefresh();
    const listener = AppState.addEventListener('change', (state) => {
      if (state === 'active') client.auth.startAutoRefresh();
      else client.auth.stopAutoRefresh();
    });
    return () => { listener.remove(); client.auth.stopAutoRefresh(); };
  }, []);

  const clearMessages = useCallback(() => { setError(null); setNotice(null); }, []);
  const run = useCallback(async (work: () => Promise<void>) => {
    if (authRunning.current) return;
    authRunning.current = true;
    setBusy(true); setError(null); setNotice(null);
    try { await work(); } catch (caught) { setError(authError(caught)); }
    finally { authRunning.current = false; setBusy(false); }
  }, []);
  const signIn = useCallback((email: string, password: string) => run(async () => {
    validateCredentials(email, password);
    if (supabase) {
      const { data, error: failure } = await supabase.auth.signInWithPassword({ email: normalizeEmail(email), password });
      if (failure) throw failure;
      setUser(fromSupabase(data.user));
    } else setUser(await localAuth.signIn(email, password));
  }), [run]);
  const signUp = useCallback((name: string, email: string, password: string) => run(async () => {
    validateName(name); validateCredentials(email, password);
    if (supabase) {
      const { data, error: failure } = await supabase.auth.signUp({ email: normalizeEmail(email), password, options: { data: { name: name.trim() } } });
      if (failure) throw failure;
      if (data.session) setUser(fromSupabase(data.session.user));
      else setNotice('Confira sua caixa de entrada, confirme o e-mail e depois entre na conta.');
    } else setUser(await localAuth.signUp(name, email, password));
  }), [run]);
  const signOut = useCallback(() => run(async () => {
    if (supabase) {
      const { error: failure } = await supabase.auth.signOut({ scope: 'local' });
      if (failure) throw failure;
    } else await localAuth.signOut();
    setUser(null);
  }), [run]);
  const retry = useCallback(() => setAttempt((value) => value + 1), []);
  const value = useMemo(() => ({ user, loading, busy, error, bootstrapError, notice, signIn, signUp, signOut, retry, clearMessages }),
    [user, loading, busy, error, bootstrapError, notice, signIn, signUp, signOut, retry, clearMessages]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth deve ser usado dentro de AuthProvider.');
  return context;
}
export { authMode };
