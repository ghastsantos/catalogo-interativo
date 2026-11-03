import type { Show } from '../types/models';

/** Preserva a ordem da lista, inclusive quando a API repete um item entre páginas. */
export function appendUnique(current: Show[], incoming: Show[]): Show[] {
  const items = new Map(current.map((item) => [item.id, item]));
  incoming.forEach((item) => items.set(item.id, item));
  return [...items.values()];
}

export function filterByGenre(items: Show[], genre: string): Show[] {
  return genre === 'Todos' ? items : items.filter((item) => item.genres.includes(genre));
}

// O conteúdo é exibido somente em Text, nunca como HTML executável.
export function plainText(html: string | null | undefined): string {
  if (!html) return 'Sinopse não disponível.';
  const entities: Record<string, string> = {
    amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ',
    rsquo: '’', lsquo: '‘', rdquo: '”', ldquo: '“', ndash: '–', mdash: '—', hellip: '…',
  };
  return html
    .replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, '')
    .replace(/<\/(p|div)>/gi, '\n\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]*>/g, '')
    .replace(/&(#x[\da-f]+|#\d+|[a-z]+);/gi, (match, entity: string) => {
      if (!entity.startsWith('#')) return entities[entity.toLowerCase()] ?? match;
      const number = entity[1]?.toLowerCase() === 'x'
        ? parseInt(entity.slice(2), 16) : parseInt(entity.slice(1), 10);
      return Number.isFinite(number) && number > 0 && number <= 0x10ffff
        ? String.fromCodePoint(number) : '';
    })
    .replace(/[\t ]+/g, ' ')
    .replace(/\n\s*\n/g, '\n\n')
    .trim() || 'Sinopse não disponível.';
}
