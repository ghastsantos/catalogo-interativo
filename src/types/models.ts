export interface Show {
  id: number;
  name: string;
  image: string | null;
  genres: string[];
  summary: string;
  language: string | null;
  status: string | null;
  premiered: string | null;
  rating: number | null;
  url: string;
}

export interface AppUser {
  id: string;
  email: string;
  name: string;
  provider: 'local' | 'supabase';
}

export type PersonalRating = 1 | 2 | 3 | 4 | 5;

export interface LibraryEntry {
  show: Show;
  favorite: boolean;
  watched: boolean;
  rating: PersonalRating | null;
  revision: string;
}

export interface LibrarySnapshot {
  version: 1;
  entries: Record<string, LibraryEntry>;
  pending: string[];
}
