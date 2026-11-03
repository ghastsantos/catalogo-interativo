import { ActivityIndicator, Text, View } from 'react-native';
import { colors, styles } from '../theme/theme';
import { Button } from './Button';

export function Feedback({ title, message, loading, onRetry, full = false }: {
  title: string; message?: string; loading?: boolean; onRetry?: () => void; full?: boolean;
}) {
  return <View style={[{ padding: 24, gap: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }, full && { flex: 1 }]}>
    {loading && <ActivityIndicator size="large" color={colors.accent} accessibilityLabel={title} />}
    <Text accessibilityRole="header" accessibilityLiveRegion="polite" style={[styles.subtitle, { textAlign: 'center' }]}>{title}</Text>
    {message && <Text style={[styles.muted, { textAlign: 'center' }]}>{message}</Text>}
    {onRetry && <Button title="Tentar novamente" onPress={onRetry} />}
  </View>;
}
