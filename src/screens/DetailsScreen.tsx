import { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button } from '../components/Button';
import { Feedback } from '../components/Feedback';
import { LibraryStatus } from '../components/LibraryStatus';
import { Poster } from '../components/Poster';
import { useLibrary } from '../contexts/LibraryContext';
import { isRating } from '../domain/library';
import { useRequest } from '../hooks/useRequest';
import type { RootStackParamList } from '../navigation/types';
import { getShow } from '../services/tvmaze';
import { colors, styles } from '../theme/theme';
import type { PersonalRating } from '../types/models';

type Props = NativeStackScreenProps<RootStackParamList, 'Details'>;
export function DetailsScreen({ route, navigation }: Props) {
  const fetcher = useCallback((signal: AbortSignal) => getShow(route.params.id, signal), [route.params.id]);
  const { data: show, loading, error, retry } = useRequest(fetcher);
  const { snapshot, update, saving } = useLibrary();
  const entry = snapshot.entries[String(route.params.id)];
  const [draftRating, setDraftRating] = useState<PersonalRating | null>(entry?.rating ?? null);
  const [validation, setValidation] = useState<string | null>(null);
  useEffect(() => setDraftRating(entry?.rating ?? null), [entry?.rating, route.params.id]);
  useLayoutEffect(() => { if (show) navigation.setOptions({ title: show.name }); }, [navigation, show]);
  if (loading) return <Feedback loading title="Abrindo os detalhes…" full />;
  if (error || !show) return <Feedback title="Não conseguimos abrir esta série" message={error ?? 'Tente novamente.'} onRetry={retry} full />;

  const toggleWatched = () => {
    setValidation(null);
    if (entry?.watched) { void update(show, { type: 'watched', watched: false }); return; }
    if (!isRating(draftRating)) { setValidation('Escolha sua nota de 1 a 5 estrelas antes de marcar como assistida.'); return; }
    void update(show, { type: 'watched', watched: true, rating: draftRating });
  };
  return <SafeAreaView style={styles.screen} edges={['left', 'right', 'bottom']}>
    <ScrollView contentContainerStyle={[styles.content, { maxWidth: 760 }]}>
      <View style={{ width: '100%', maxWidth: 300, alignSelf: 'center', borderRadius: 18, overflow: 'hidden' }}><Poster uri={show.image} title={show.name} /></View>
      <Text style={styles.eyebrow}>{show.genres.join(' / ') || 'SÉRIE'}</Text>
      <Text accessibilityRole="header" style={styles.title}>{show.name}</Text>
      <Text style={styles.muted}>{show.premiered?.slice(0, 4) ?? 'Ano não informado'} · {show.language ?? 'Idioma não informado'} · {show.status ?? 'Status não informado'}</Text>
      <Text style={styles.muted}>Nota TVmaze: {show.rating === null ? 'não informada' : `${show.rating}/10`}</Text>
      <Button title={entry?.favorite ? '♥ Remover das favoritas' : '♡ Adicionar às favoritas'} variant={entry?.favorite ? 'primary' : 'secondary'}
        label={entry?.favorite ? 'Remover série dos favoritos' : 'Adicionar série aos favoritos'} state={{ selected: entry?.favorite ?? false }}
        disabled={saving} onPress={() => { void update(show, { type: 'favorite' }); }} />
      <View style={styles.panel}>
        <Text accessibilityRole="header" style={styles.subtitle}>Sua experiência</Text>
        <Text style={styles.muted}>{entry?.watched ? 'Série assistida. Toque nas estrelas para atualizar sua nota.' : 'Já assistiu? Escolha uma nota e registre na sua biblioteca.'}</Text>
        <View accessibilityRole="radiogroup" accessibilityLabel="Sua nota de 1 a 5 estrelas" style={styles.row}>
          {([1, 2, 3, 4, 5] as const).map((rating) => <Pressable key={rating} accessible accessibilityRole="radio"
            accessibilityLabel={`${rating} ${rating === 1 ? 'estrela' : 'estrelas'}`} accessibilityState={{ checked: draftRating === rating, disabled: saving }}
            disabled={saving} hitSlop={2} onPress={() => {
              setValidation(null);
              if (entry?.watched) void update(show, { type: 'rating', rating });
              else setDraftRating(rating);
            }} style={{ minHeight: 48, minWidth: 48, alignItems: 'center', justifyContent: 'center', padding: 8, borderRadius: 8, backgroundColor: colors.raised }}>
            <Text style={{ fontSize: 26, color: colors.accent }}>{draftRating && rating <= draftRating ? '★' : '☆'}</Text>
          </Pressable>)}
        </View>
        <Text style={styles.muted} accessibilityLiveRegion="polite">{draftRating ? `Sua nota: ${draftRating} de 5` : 'Nenhuma nota selecionada'}</Text>
        {validation && <Text accessibilityRole="alert" style={[styles.body, { color: colors.error }]}>{validation}</Text>}
        <Button title={entry?.watched ? 'Remover das assistidas' : 'Marcar como assistida'} state={{ selected: entry?.watched ?? false }}
          onPress={toggleWatched} loading={saving} variant="secondary" />
      </View>
      <LibraryStatus />
      <Text accessibilityRole="header" style={styles.subtitle}>Sobre a série</Text>
      <Text style={styles.body}>{show.summary}</Text>
      <Text style={styles.muted}>Sinopse e dados fornecidos pela TVmaze. O idioma do conteúdo depende da API.</Text>
    </ScrollView>
  </SafeAreaView>;
}
