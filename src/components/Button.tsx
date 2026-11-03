import { ActivityIndicator, Pressable, StyleSheet, Text, type AccessibilityState } from 'react-native';
import { colors } from '../theme/theme';

interface Props {
  title: string; onPress: () => void; loading?: boolean; disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'quiet'; label?: string; state?: AccessibilityState;
}
export function Button({ title, onPress, loading = false, disabled = false, variant = 'primary', label, state }: Props) {
  return (
    <Pressable accessible accessibilityRole="button" accessibilityLabel={label ?? title}
      accessibilityState={{ ...state, disabled: disabled || loading, busy: loading }}
      onPress={onPress} disabled={disabled || loading}
      style={({ pressed }) => [s.button, variant === 'primary' ? s.primary : variant === 'secondary' ? s.secondary : s.quiet, (pressed || disabled || loading) && s.dim]}>
      {loading ? <ActivityIndicator color={variant === 'primary' ? colors.onAccent : colors.text} accessibilityLabel="Carregando" /> : null}
      <Text style={[s.text, { color: variant === 'primary' ? colors.onAccent : colors.text }]}>{title}</Text>
    </Pressable>
  );
}
const s = StyleSheet.create({
  button: { minHeight: 48, minWidth: 48, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12, flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center', flexShrink: 1 },
  primary: { backgroundColor: colors.accent }, secondary: { backgroundColor: colors.raised }, quiet: { borderWidth: 1, borderColor: colors.line },
  dim: { opacity: 0.65 }, text: { fontSize: 15, fontWeight: '600', textAlign: 'center', flexShrink: 1 },
});
