// Execute somente contra um projeto de teste, com duas contas já confirmadas.
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';
if (existsSync('.env')) process.loadEnvFile('.env');
const required = ['EXPO_PUBLIC_SUPABASE_URL', 'EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY', 'TEST_USER_A_EMAIL', 'TEST_USER_A_PASSWORD', 'TEST_USER_B_EMAIL', 'TEST_USER_B_PASSWORD'];
for (const key of required) if (!process.env[key]) throw new Error(`Configure ${key} antes do teste.`);
const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const key = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const options = { auth: { persistSession: false, autoRefreshToken: false } };
const a = createClient(url, key, options), b = createClient(url, key, options), anon = createClient(url, key, options);
let testId, userId;
try {
  const signIn = async (client, suffix) => {
    const { data, error } = await client.auth.signInWithPassword({ email: process.env[`TEST_USER_${suffix}_EMAIL`], password: process.env[`TEST_USER_${suffix}_PASSWORD`] });
    if (error) throw error;
    return data.user.id;
  };
  userId = await signIn(a, 'A');
  const secondId = await signIn(b, 'B');
  assert.notEqual(userId, secondId, 'Use contas diferentes.');
  // ID reservado para teste, sem sobrescrever entradas reais do catálogo.
  testId = 1_000_000_000 + Math.floor(Math.random() * 1_000_000_000);
  const show = { id: testId, name: 'Teste de isolamento', image: null, genres: [], summary: 'Teste', language: null, status: null, premiered: null, rating: null, url: 'https://www.tvmaze.com' };
  const row = { user_id: userId, show_id: testId, show, favorite: true, watched: false, rating: null, revision: 'security-test' };
  const inserted = await a.from('library_entries').insert(row);
  assert.equal(inserted.error, null, 'A deve poder inserir sua própria entrada.');
  const own = await a.from('library_entries').select('show_id').eq('show_id', testId);
  assert.equal(own.error, null); assert.equal(own.data.length, 1);
  const other = await b.from('library_entries').select('show_id').eq('user_id', userId).eq('show_id', testId);
  assert.equal(other.error, null); assert.equal(other.data.length, 0, 'B não pode ler dados de A.');
  const denied = await b.from('library_entries').upsert({ ...row, favorite: false });
  assert.ok(denied.error, 'B não pode escrever em nome de A.');
  const anonymous = await anon.from('library_entries').select('show_id').eq('show_id', testId);
  assert.ok(anonymous.error || anonymous.data.length === 0, 'Não autenticado não pode ler a biblioteca.');
  console.log('PASS: autenticação, gravação/leitura própria e isolamento de usuários pela RLS.');
} finally {
  if (testId && userId) await a.from('library_entries').delete().eq('user_id', userId).eq('show_id', testId);
  await Promise.allSettled([a.auth.signOut({ scope: 'local' }), b.auth.signOut({ scope: 'local' })]);
}
