import { useCallback, useMemo, useState } from 'react';
import { Keyboard, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button } from '../components/Button';
import { Feedback } from '../components/Feedback';
import { GenreFilter } from '../components/GenreFilter';
import { LibraryStatus } from '../components/LibraryStatus';
import { ShowGrid } from '../components/ShowGrid';
import { filterByGenre } from '../domain/catalog';
import { useRequest } from '../hooks/useRequest';
import type { RootStackParamList } from '../navigation/types';
import { searchShows } from '../services/tvmaze';
import { colors, styles } from '../theme/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Search'>;
export function SearchScreen({ navigation }: Props) {
  const [input, setInput] = useState('');
  const [submitted, setSubmitted] = useState({ query: '', revision: 0 });
  const [validation, setValidation] = useState<string | null>(null);
  const [genre, setGenre] = useState('Todos');
  const fetcher = useCallback((signal: AbortSignal) => searchShows(submitted.query, signal), [submitted]);
  const { data, loading, error, retry } = useRequest(fetcher, submitted.query.length > 0);
  const items = useMemo(() => filterByGenre(data ?? [], genre), [data, genre]);
  const genres = useMemo(() => [...new Set((data ?? []).flatMap((show) => show.genres))].sort(), [data]);
  const submit = () => {
    const query = input.trim();
    if (!query) { setValidation('Digite o nome de uma série para buscar.'); return; }
    setValidation(null); setGenre('Todos'); Keyboard.dismiss();
    setSubmitted((old) => ({ query, revision: old.revision + 1 }));
  };
  const header = <View style={{ padding: 6, gap: 16, paddingBottom: 18 }}>
    <Text style={styles.eyebrow}>ENCONTRE SUA HISTÓRIA</Text>
    <Text accessibilityRole="header" style={styles.title}>Tem algo em mente?</Text>
    <TextInput accessible accessibilityLabel="Nome da série para buscar" accessibilityRole="search" value={input} onChangeText={setInput}
      style={styles.input} placeholder="Ex.: Dark, The Office, Friends" placeholderTextColor={colors.muted}
      autoCorrect={false} returnKeyType="search" onSubmitEditing={submit} maxLength={100} />
    <Button title="Buscar" onPress={submit} loading={loading} />
    {validation && <Text accessibilityRole="alert" style={{ color: colors.error }}>{validation}</Text>}
    <LibraryStatus />
    {data && data.length > 0 && <GenreFilter genres={genres} selected={genre} onSelect={setGenre} />}
    {data && <Text style={styles.muted}>{items.length} resultado(s) para “{submitted.query}”</Text>}
  </View>;
  const empty = loading ? <Feedback loading title="Procurando séries…" />
    : error ? <Feedback title="A busca não foi concluída" message={error} onRetry={retry} />
      : !submitted.query ? <Feedback title="Cada boa série começa com uma descoberta" message="Digite um título e toque em Buscar." />
        : <Feedback title="Nenhuma série encontrada" message="Tente outro título ou remova o filtro de gênero." />;
  return <SafeAreaView style={styles.screen} edges={['left', 'right', 'bottom']}>
    <ShowGrid data={items} header={header} empty={empty} onSelect={(id) => navigation.navigate('Details', { id })} />
  </SafeAreaView>;
}
