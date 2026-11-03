import type { LibraryEntry, LibrarySnapshot, PersonalRating, Show } from '../types/models';

export const emptyLibrary = (): LibrarySnapshot => ({ version: 1, entries: {}, pending: [] });
export type LibraryAction =
  | { type: 'favorite' }
  | { type: 'watched'; watched: boolean; rating?: PersonalRating }
  | { type: 'rating'; rating: PersonalRating };

export function isRating(value: unknown): value is PersonalRating {
  return typeof value === 'number' && Number.isInteger(value) && value >= 1 && value <= 5;
}

export function changeLibrary(
  state: LibrarySnapshot, show: Show, action: LibraryAction, revision: string,
): LibrarySnapshot {
  const id = String(show.id);
  const old = state.entries[id] ?? { show, favorite: false, watched: false, rating: null, revision };
  let next: LibraryEntry = { ...old, show, revision };
  if (action.type === 'favorite') next.favorite = !old.favorite;
  if (action.type === 'watched') {
    if (action.watched && !isRating(action.rating ?? old.rating)) {
      throw new Error('Escolha uma nota de 1 a 5 estrelas.');
    }
    next = { ...next, watched: action.watched, rating: action.watched ? (action.rating ?? old.rating) : null };
  }
  if (action.type === 'rating') {
    if (!old.watched) throw new Error('Marque a série como assistida antes de avaliar.');
    if (!isRating(action.rating)) throw new Error('A nota deve estar entre 1 e 5.');
    next.rating = action.rating;
  }
  // Mantemos o registro desmarcado: a nuvem também precisa receber a remoção.
  return { version: 1, entries: { ...state.entries, [id]: next }, pending: [...new Set([...state.pending, id])] };
}

export function reconcileLibrary(
  current: LibrarySnapshot, sent: LibraryEntry[], remote: LibraryEntry[],
): LibrarySnapshot {
  const sentById = new Map(sent.map((entry) => [String(entry.show.id), entry.revision]));
  const pending = current.pending.filter((id) => current.entries[id]?.revision !== sentById.get(id));
  const entries = { ...current.entries };
  // Uma edição feita enquanto a requisição estava em andamento não é apagada.
  remote.forEach((entry) => {
    const id = String(entry.show.id);
    if (!pending.includes(id)) entries[id] = entry;
  });
  return { version: 1, entries, pending };
}

export function isShow(value: unknown): value is Show {
  if (!value || typeof value !== 'object') return false;
  const s = value as Partial<Show>;
  return Number.isInteger(s.id) && Number(s.id) > 0 && typeof s.name === 'string'
    && (s.image === null || typeof s.image === 'string') && Array.isArray(s.genres)
    && s.genres.every((genre) => typeof genre === 'string') && typeof s.summary === 'string'
    && [s.language, s.status, s.premiered].every((v) => v === null || typeof v === 'string')
    && (s.rating === null || (typeof s.rating === 'number' && Number.isFinite(s.rating)))
    && typeof s.url === 'string';
}

export function isEntry(value: unknown): value is LibraryEntry {
  if (!value || typeof value !== 'object') return false;
  const e = value as Partial<LibraryEntry>;
  return isShow(e.show) && typeof e.favorite === 'boolean' && typeof e.watched === 'boolean'
    && typeof e.revision === 'string' && (e.watched ? isRating(e.rating) : e.rating === null);
}

export function parseLibrary(raw: string | null): LibrarySnapshot {
  if (raw === null) return emptyLibrary();
  const value: unknown = JSON.parse(raw);
  if (!value || typeof value !== 'object') throw new Error('Biblioteca local inválida.');
  const data = value as Partial<LibrarySnapshot>;
  if (data.version !== 1 || !data.entries || typeof data.entries !== 'object' || Array.isArray(data.entries)
    || !Array.isArray(data.pending) || !data.pending.every((id) => typeof id === 'string')
    || !Object.entries(data.entries).every(([id, entry]) => isEntry(entry) && String(entry.show.id) === id)
    || !data.pending.every((id) => Object.hasOwn(data.entries!, id))) {
    throw new Error('Não foi possível ler a biblioteca. Os dados originais foram preservados.');
  }
  return data as LibrarySnapshot;
}
