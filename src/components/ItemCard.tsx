import { Pressable, Text, View } from 'react-native';
import { useLibrary } from '../contexts/LibraryContext';
import type { Show } from '../types/models';
import { colors, styles } from '../theme/theme';
import { Poster } from './Poster';

export function ItemCard({ item, onPress }: { item: Show; onPress: () => void }) {
  const { snapshot, update, saving } = useLibrary();
  const entry = snapshot.entries[String(item.id)];
  const favorite = entry?.favorite ?? false;
  return <View style={{ flex: 1, backgroundColor: colors.surface, borderRadius: 16, overflow: 'hidden' }}>
    <Pressable accessible accessibilityRole="button" accessibilityLabel={`Ver detalhes de ${item.name}`}
      onPress={onPress} style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}>
      <Poster uri={item.image} title={item.name} />
      <View style={{ padding: 12, gap: 5 }}>
        <Text style={[styles.body, { fontWeight: '700' }]}>{item.name}</Text>
        <Text style={styles.muted}>{item.genres[0] ?? 'Série'}</Text>
        {entry?.watched && <Text style={[styles.muted, { color: colors.accent }]}>Assistida · {entry.rating}/5 ★</Text>}
      </View>
    </Pressable>
    <Pressable accessible accessibilityRole="button" hitSlop={4} disabled={saving}
      accessibilityLabel={`${favorite ? 'Remover' : 'Adicionar'} ${item.name} ${favorite ? 'dos' : 'aos'} favoritos`}
      accessibilityState={{ selected: favorite, disabled: saving }} onPress={() => { void update(item, { type: 'favorite' }); }}
      style={({ pressed }) => ({ minHeight: 48, padding: 12, borderTopColor: colors.line, borderTopWidth: 1, opacity: pressed ? 0.6 : 1 })}>
      <Text style={[styles.muted, { color: favorite ? colors.accent : colors.text }]}>{favorite ? '♥ Favorita' : '♡ Favoritar'}</Text>
    </Pressable>
  </View>;
}
