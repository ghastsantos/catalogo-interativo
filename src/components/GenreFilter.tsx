import { ScrollView, Text, View } from 'react-native';
import { Button } from './Button';
import { styles } from '../theme/theme';

export function GenreFilter({ genres, selected, onSelect }: { genres: string[]; selected: string; onSelect: (genre: string) => void }) {
  return <View style={{ gap: 8 }}>
    <Text style={styles.muted}>Gênero · filtro dos itens carregados</Text>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingBottom: 4 }}>
      {['Todos', ...genres].map((genre) => <Button key={genre} title={genre} variant={selected === genre ? 'primary' : 'quiet'}
        label={`Filtrar por ${genre}`} state={{ selected: selected === genre }} onPress={() => onSelect(genre)} />)}
    </ScrollView>
  </View>;
}
