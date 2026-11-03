import { createClient, processLock } from '@supabase/supabase-js';
import { secureStorage } from './secureStorage';

const mode = process.env.EXPO_PUBLIC_AUTH_MODE ?? 'local';
const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const key = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
export const authMode = mode === 'supabase' ? 'supabase' : 'local';
export const configurationError = mode !== 'local' && mode !== 'supabase'
  ? 'EXPO_PUBLIC_AUTH_MODE deve ser local ou supabase.'
  : authMode === 'supabase' && (!url?.startsWith('https://') || !key)
    ? 'Configure a URL HTTPS e a chave publicável do Supabase no arquivo .env.' : null;

const fetchWithTimeout: typeof fetch = async (input, init) => {
  const controller = new AbortController();
  const upstream = init?.signal;
  const abort = () => controller.abort();
  if (upstream?.aborted) controller.abort();
  upstream?.addEventListener('abort', abort, { once: true });
  const timer = setTimeout(abort, 15000);
  try { return await fetch(input, { ...init, signal: controller.signal }); }
  finally { clearTimeout(timer); upstream?.removeEventListener('abort', abort); }
};

export const supabase = authMode === 'supabase' && !configurationError
  ? createClient(url!, key!, {
    global: { fetch: fetchWithTimeout },
    auth: { storage: secureStorage, persistSession: true, autoRefreshToken: true, detectSessionInUrl: false, lock: processLock },
  }) : null;
