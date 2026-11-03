import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Feedback } from '../components/Feedback';
import { LibraryStatus } from '../components/LibraryStatus';
import { ShowGrid } from '../components/ShowGrid';
import { useLibrary } from '../contexts/LibraryContext';
import type { RootStackParamList } from '../navigation/types';
import { styles } from '../theme/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Favorites' | 'Watched'>;
export function LibraryScreen({ navigation, route }: Props) {
  const { snapshot } = useLibrary();
  const favorites = route.name === 'Favorites';
  const items = Object.values(snapshot.entries).filter((entry) => favorites ? entry.favorite : entry.watched)
    .map((entry) => entry.show).sort((a, b) => a.name.localeCompare(b.name));
  const header = <View style={{ padding: 6, gap: 16, paddingBottom: 18 }}>
    <Text style={styles.eyebrow}>SUA BIBLIOTECA</Text>
    <Text accessibilityRole="header" style={styles.title}>{favorites ? 'Vale guardar.' : 'Já deram play.'}</Text>
    <Text style={styles.muted}>{favorites ? 'Suas favoritas, sempre por perto.' : 'Seu histórico de séries e suas avaliações.'} {items.length} série(s).</Text>
    <LibraryStatus />
  </View>;
  return <SafeAreaView style={styles.screen} edges={['left', 'right', 'bottom']}>
    <ShowGrid data={items} header={header} onSelect={(id) => navigation.navigate('Details', { id })}
      empty={<Feedback title={favorites ? 'Sua lista de favoritas está começando' : 'Toda maratona começa com uma série'}
        message={favorites ? 'Toque no coração de uma série para encontrá-la aqui.' : 'Abra uma série, escolha sua nota e marque como assistida.'} />} />
  </SafeAreaView>;
}
