import { StyleSheet } from 'react-native';
export const colors = {
  background: '#10131B', surface: '#1D2330', raised: '#283143', text: '#F5F3ED',
  muted: '#B6BED0', accent: '#F5C96A', onAccent: '#171A22', line: '#73809A', error: '#FFB4AB', success: '#AAE5C4',
};
export const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20, gap: 16, width: '100%', maxWidth: 1040, alignSelf: 'center' },
  title: { color: colors.text, fontSize: 28, fontWeight: '700', flexShrink: 1 },
  subtitle: { color: colors.text, fontSize: 20, fontWeight: '600', flexShrink: 1 },
  body: { color: colors.text, fontSize: 16, lineHeight: 25, flexShrink: 1 },
  muted: { color: colors.muted, fontSize: 14, lineHeight: 22, flexShrink: 1 },
  eyebrow: { color: colors.accent, fontSize: 12, fontWeight: '700', letterSpacing: 2 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, flexWrap: 'wrap' },
  input: { color: colors.text, fontSize: 16, backgroundColor: colors.surface, borderColor: colors.line, borderWidth: 1, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, minHeight: 52 },
  panel: { backgroundColor: colors.surface, borderRadius: 16, padding: 16, gap: 12 },
  label: { color: colors.text, fontSize: 15, fontWeight: '600', marginBottom: 7 },
});
