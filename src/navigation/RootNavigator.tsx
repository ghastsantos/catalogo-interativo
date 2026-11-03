import { DarkTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Feedback } from '../components/Feedback';
import { useAuth } from '../contexts/AuthContext';
import { LibraryProvider } from '../contexts/LibraryContext';
import { CatalogScreen } from '../screens/CatalogScreen';
import { DetailsScreen } from '../screens/DetailsScreen';
import { LibraryScreen } from '../screens/LibraryScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { SearchScreen } from '../screens/SearchScreen';
import { colors } from '../theme/theme';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();
const theme = { ...DarkTheme, colors: { ...DarkTheme.colors, background: colors.background, card: colors.surface, text: colors.text, primary: colors.accent, border: colors.line } };
export function RootNavigator() {
  const { user, loading, bootstrapError, retry } = useAuth();
  if (loading) return <Feedback loading title="Preparando seu próximo play…" full />;
  if (bootstrapError) return <Feedback title="Não conseguimos restaurar a sessão" message={bootstrapError} onRetry={retry} full />;
  return <NavigationContainer theme={theme}>
    {user ? <LibraryProvider key={`${user.provider}:${user.id}`} user={user}>
      <Stack.Navigator screenOptions={{ headerTintColor: colors.text, headerStyle: { backgroundColor: colors.surface }, contentStyle: { backgroundColor: colors.background } }}>
        <Stack.Screen name="Catalog" component={CatalogScreen} options={{ title: 'Entre Episódios' }} />
        <Stack.Screen name="Search" component={SearchScreen} options={{ title: 'Buscar séries' }} />
        <Stack.Screen name="Details" component={DetailsScreen} options={{ title: 'Detalhes' }} />
        <Stack.Screen name="Favorites" component={LibraryScreen} options={{ title: 'Favoritas' }} />
        <Stack.Screen name="Watched" component={LibraryScreen} options={{ title: 'Assistidas' }} />
      </Stack.Navigator>
    </LibraryProvider> : <Stack.Navigator><Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} /></Stack.Navigator>}
  </NavigationContainer>;
}
