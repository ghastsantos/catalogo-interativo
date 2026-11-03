import { isEntry } from '../domain/library';
import type { LibraryEntry } from '../types/models';
import { supabase } from './supabase';

export async function syncCloudLibrary(userId: string, pending: LibraryEntry[]): Promise<LibraryEntry[]> {
  if (!supabase) throw new Error('A nuvem não está configurada.');
  if (pending.length) {
    const { error } = await supabase.from('library_entries').upsert(pending.map((entry) => ({
      user_id: userId, show_id: entry.show.id, show: entry.show, favorite: entry.favorite,
      watched: entry.watched, rating: entry.rating, revision: entry.revision,
    })), { onConflict: 'user_id,show_id' });
    if (error) throw error;
  }
  const entries: LibraryEntry[] = [];
  // O PostgREST limita a quantidade por resposta. Percorremos a biblioteca por faixas.
  for (let start = 0; ; start += 500) {
    const { data, error } = await supabase.from('library_entries')
      .select('show, favorite, watched, rating, revision')
      .eq('user_id', userId).order('show_id').range(start, start + 499);
    if (error) throw error;
    if (!data || !data.every(isEntry)) throw new Error('A nuvem retornou uma biblioteca inválida.');
    entries.push(...data);
    if (data.length < 500) return entries;
  }
}
