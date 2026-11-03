import { useEffect, useState } from 'react';
import { Image, Text, View } from 'react-native';
import { colors, styles } from '../theme/theme';

export function Poster({ uri, title }: { uri: string | null; title: string }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [uri]);
  if (!uri || failed) return <View accessible accessibilityRole="image" accessibilityLabel={`Sem capa disponível para ${title}`}
    style={{ aspectRatio: 2 / 3, width: '100%', backgroundColor: colors.raised, alignItems: 'center', justifyContent: 'center', padding: 12 }}>
    <Text style={[styles.subtitle, { fontSize: 32 }]} importantForAccessibility="no">▶</Text>
    <Text style={[styles.muted, { textAlign: 'center' }]} importantForAccessibility="no">Sem capa</Text>
  </View>;
  return <Image accessible accessibilityRole="image" accessibilityLabel={`Capa de ${title}`} source={{ uri }}
    onError={() => setFailed(true)} resizeMode="cover" style={{ width: '100%', aspectRatio: 2 / 3, backgroundColor: colors.raised }} />;
}
