import { useMemo, useState } from 'react';
import { ActivityIndicator, Linking, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button } from '../components/Button';
import { Feedback } from '../components/Feedback';
import { GenreFilter } from '../components/GenreFilter';
import { LibraryStatus } from '../components/LibraryStatus';
import { ShowGrid } from '../components/ShowGrid';
import { useAuth } from '../contexts/AuthContext';
import { useLibrary } from '../contexts/LibraryContext';
import { filterByGenre } from '../domain/catalog';
import { useCatalog } from '../hooks/useCatalog';
import type { RootStackParamList } from '../navigation/types';
import { colors, styles } from '../theme/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Catalog'>;
export function CatalogScreen({ navigation }: Props) {
  const catalog = useCatalog();
  const { user, signOut, busy, error } = useAuth();
  const { saving } = useLibrary();
  const [genre, setGenre] = useState('Todos');
  const [linkError, setLinkError] = useState(false);
  const genres = useMemo(() => [...new Set(catalog.data.flatMap((show) => show.genres))].sort(), [catalog.data]);
  const items = useMemo(() => filterByGenre(catalog.data, genre), [catalog.data, genre]);
  const header = <View style={{ padding: 6, paddingBottom: 18, gap: 16 }}>
    <Text style={styles.eyebrow}>ENTRE EPISÓDIOS</Text>
    <Text accessibilityRole="header" style={styles.title}>O que vamos assistir,{ '\n' }{user?.name.split(' ')[0]}?</Text>
    <Text style={styles.muted}>Explore o catálogo e monte sua próxima maratona.</Text>
    <View style={styles.row}>
      <Button title="Buscar séries" onPress={() => navigation.navigate('Search')} />
      <Button title="Favoritas" variant="secondary" onPress={() => navigation.navigate('Favorites')} />
      <Button title="Assistidas" variant="secondary" onPress={() => navigation.navigate('Watched')} />
      <Button title="Sair" variant="quiet" loading={busy} disabled={saving} onPress={() => { void signOut(); }} />
    </View>
    {error && <View style={styles.panel}><Text accessibilityRole="alert" style={{ color: colors.error }}>{error}</Text><Button title="Tentar novamente" onPress={() => { void signOut(); }} disabled={busy || saving} /></View>}
    <LibraryStatus />
    <GenreFilter genres={genres} selected={genre} onSelect={setGenre} />
    <Text style={styles.muted}>{catalog.data.length} séries carregadas · {items.length} neste filtro</Text>
    {catalog.error && catalog.data.length > 0 && <Feedback title="Não conseguimos atualizar" message={catalog.error} onRetry={catalog.retry} />}
  </View>;
  const empty = catalog.loading ? <Feedback loading title="Buscando seu próximo play…" />
    : catalog.error ? <Feedback title="O catálogo não carregou" message={catalog.error} onRetry={catalog.retry} />
      : <Feedback title="Nenhuma série neste filtro" message="Escolha outro gênero ou carregue a próxima página." />;
  const footer = <View style={{ padding: 6, paddingTop: 16, gap: 16 }}>
    {catalog.loadingMore && <ActivityIndicator color={colors.accent} accessibilityLabel="Carregando próxima página" />}
    {catalog.moreError && <Feedback title="A próxima página não carregou" message={catalog.moreError} onRetry={catalog.retry} />}
    {!catalog.loading && !catalog.loadingMore && !catalog.refreshing && !catalog.moreError && !catalog.error && catalog.hasMore
      && <Button title="Carregar próxima página" variant="quiet" onPress={catalog.loadMore} />}
    {!catalog.hasMore && <Text style={[styles.muted, { textAlign: 'center' }]}>Você chegou ao fim do catálogo.</Text>}
    <Button title="Dados por TVmaze · CC BY-SA" variant="quiet" onPress={() => {
      void Linking.openURL('https://www.tvmaze.com/api').catch(() => setLinkError(true));
    }} />
    {linkError && <Text style={styles.muted}>Não foi possível abrir o link da TVmaze.</Text>}
  </View>;
  return <SafeAreaView style={styles.screen} edges={['left', 'right', 'bottom']}>
    <ShowGrid data={items} onSelect={(id) => navigation.navigate('Details', { id })} header={header} footer={footer} empty={empty}
      refreshing={catalog.refreshing} onRefresh={catalog.refresh} onEndReached={genre === 'Todos' ? catalog.loadMore : undefined} />
  </SafeAreaView>;
}
