import axios from 'axios';
import { plainText } from '../domain/catalog';
import type { Show } from '../types/models';

interface ApiShow {
  id: number; name: string; image: { medium: string; original: string } | null;
  genres: string[]; summary: string | null; language: string | null; status: string | null;
  premiered: string | null; rating: { average: number | null }; url: string;
}

const api = axios.create({ baseURL: 'https://api.tvmaze.com', timeout: 15000 });
const normalize = (show: ApiShow): Show => ({
  id: show.id, name: show.name, image: show.image?.medium ?? show.image?.original ?? null,
  genres: show.genres ?? [], summary: plainText(show.summary), language: show.language ?? null,
  status: show.status ?? null, premiered: show.premiered ?? null,
  rating: show.rating?.average ?? null, url: show.url,
});

export async function getShows(page: number, signal?: AbortSignal): Promise<Show[] | null> {
  try {
    const { data } = await api.get<ApiShow[]>('/shows', { params: { page }, signal });
    return data.map(normalize);
  } catch (error) {
    // A TVMaze sinaliza o fim do índice com 404, não pelo tamanho de uma página.
    if (axios.isAxiosError(error) && error.response?.status === 404) return null;
    throw error;
  }
}

export async function searchShows(query: string, signal?: AbortSignal): Promise<Show[]> {
  const { data } = await api.get<{ show: ApiShow }[]>('/search/shows', { params: { q: query }, signal });
  return data.map(({ show }) => normalize(show));
}

export async function getShow(id: number, signal?: AbortSignal): Promise<Show> {
  const { data } = await api.get<ApiShow>(`/shows/${id}`, { signal });
  return normalize(data);
}

export function friendlyError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    if (error.response?.status === 429) return 'Muitas consultas agora. Aguarde um pouco e tente novamente.';
    if (error.response?.status === 404) return 'Este item não foi encontrado.';
    return 'Não conseguimos acessar o catálogo. Verifique sua conexão e tente novamente.';
  }
  return error instanceof Error ? error.message : 'Algo deu errado. Tente novamente.';
}
