import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/contexts/AuthContext';
import { RootNavigator } from './src/navigation/RootNavigator';

export default function App() {
  return <SafeAreaProvider>
    <StatusBar style="light" />
    <AuthProvider><RootNavigator /></AuthProvider>
  </SafeAreaProvider>;
}
