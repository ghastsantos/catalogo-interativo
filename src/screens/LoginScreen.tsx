import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../components/Button';
import { useAuth } from '../contexts/AuthContext';
import { colors, styles } from '../theme/theme';

export function LoginScreen() {
  const { signIn, signUp, busy, error, notice, clearMessages } = useAuth();
  const [register, setRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const submit = () => {
    setFormError(null);
    if (register && password !== confirmation) { setFormError('As senhas precisam ser iguais.'); return; }
    if (register) void signUp(name, email, password); else void signIn(email, password);
  };
  return <SafeAreaView style={styles.screen}>
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingVertical: 32 }}>
        <View style={[styles.content, { maxWidth: 480, gap: 22 }]}>
          <View style={{ gap: 12 }}>
            <Text style={styles.eyebrow}>SEU PRÓXIMO PLAY</Text>
            <Text accessibilityRole="header" style={[styles.title, { fontSize: 38 }]}>Entre{ '\n' }Episódios.</Text>
            <Text style={styles.muted}>Descubra séries. Guarde as favoritas. Dê sua nota para as que já assistiu.</Text>
          </View>
          <View style={styles.panel}>
            <Text accessibilityRole="header" style={styles.subtitle}>{register ? 'Crie sua conta' : 'Que bom ter você aqui'}</Text>
            <Text style={styles.muted}>Conta Supabase · sua biblioteca sincroniza entre dispositivos.</Text>
            {register && <View><Text style={styles.label}>Nome</Text><TextInput accessibilityLabel="Nome" autoComplete="name" textContentType="name"
              style={styles.input} value={name} onChangeText={setName} maxLength={80} editable={!busy} /></View>}
            <View><Text style={styles.label}>E-mail</Text><TextInput accessibilityLabel="E-mail" keyboardType="email-address" autoCapitalize="none"
              autoCorrect={false} autoComplete="email" textContentType="emailAddress" style={styles.input} value={email} onChangeText={setEmail} maxLength={254} editable={!busy} /></View>
            <View><Text style={styles.label}>Senha</Text><TextInput accessibilityLabel="Senha, entre 8 e 128 caracteres" secureTextEntry
              autoCapitalize="none" autoCorrect={false} autoComplete={register ? 'new-password' : 'current-password'} textContentType={register ? 'newPassword' : 'password'}
              style={styles.input} value={password} onChangeText={setPassword} maxLength={128} editable={!busy} returnKeyType="go" onSubmitEditing={submit} /></View>
            {register && <View><Text style={styles.label}>Repita a senha</Text><TextInput accessibilityLabel="Repita a senha" secureTextEntry
              autoCapitalize="none" autoCorrect={false} style={styles.input} value={confirmation} onChangeText={setConfirmation} maxLength={128} editable={!busy} onSubmitEditing={submit} /></View>}
            {(formError || error) && <Text accessibilityRole="alert" style={[styles.body, { color: colors.error }]}>{formError ?? error}</Text>}
            {notice && <Text accessibilityLiveRegion="polite" style={[styles.body, { color: colors.success }]}>{notice}</Text>}
            <Button title={register ? 'Criar conta' : 'Entrar'} loading={busy} onPress={submit} />
            {error && <Button title="Tentar novamente" variant="quiet" disabled={busy} onPress={submit} />}
            <Button title={register ? 'Já tenho uma conta' : 'Quero me cadastrar'} variant="quiet" disabled={busy} onPress={() => {
              setRegister((current) => !current); setFormError(null); setPassword(''); setConfirmation(''); clearMessages();
            }} />
          </View>
          <Text style={[styles.muted, { textAlign: 'center' }]}>Não use uma senha que você já utiliza em outros serviços.</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  </SafeAreaView>;
}
