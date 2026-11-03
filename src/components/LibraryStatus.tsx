import { ActivityIndicator, Text, View } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useLibrary } from '../contexts/LibraryContext';
import { colors, styles } from '../theme/theme';
import { Button } from './Button';

export function LibraryStatus() {
  const { user } = useAuth();
  const { error, clearError, snapshot, syncing, syncError, sync, saving } = useLibrary();
  return <View style={{ gap: 8 }}>
    {saving && <View style={styles.row}><ActivityIndicator color={colors.accent} /><Text style={styles.muted}>Salvando no aparelho…</Text></View>}
    {error && <View style={styles.panel}><Text accessibilityRole="alert" style={{ color: colors.error }}>{error}</Text><Button title="Entendi" onPress={clearError} variant="quiet" /></View>}
    {user?.provider === 'supabase' && <View style={styles.panel}>
      <Text style={styles.muted} accessibilityLiveRegion="polite">{syncing ? 'Sincronizando com a nuvem…' : snapshot.pending.length ? `${snapshot.pending.length} alteração(ões) aguardando envio.` : 'Biblioteca local pronta. Sincronize para buscar novidades de outro aparelho.'}</Text>
      {syncError && <Text accessibilityRole="alert" style={{ color: colors.error }}>{syncError}</Text>}
      <Button title={syncError ? 'Tentar novamente' : 'Sincronizar'} onPress={() => { void sync(); }} loading={syncing} variant="secondary" />
    </View>}
  </View>;
}
