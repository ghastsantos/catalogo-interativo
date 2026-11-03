import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

interface Manifest { generation: string; count: number }
const queues = new Map<string, Promise<void>>();
const baseKey = (key: string) => Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, key);
const chunkKey = (key: string, m: Manifest, i: number) => `ee.${key}.${m.generation}.${i}`;

async function manifest(key: string): Promise<Manifest | null> {
  const value = await SecureStore.getItemAsync(`ee.${key}`);
  if (!value) return null;
  const parsed: unknown = JSON.parse(value);
  const m = parsed as Manifest;
  if (!m || typeof m.generation !== 'string' || !Number.isInteger(m.count) || m.count < 1 || m.count > 256) {
    throw new Error('Não foi possível ler a sessão protegida.');
  }
  return m;
}

async function clearChunks(key: string, m: Manifest | null): Promise<void> {
  if (m) await Promise.allSettled(Array.from({ length: m.count }, (_, i) => SecureStore.deleteItemAsync(chunkKey(key, m, i))));
}

async function serialized(key: string, work: () => Promise<void>): Promise<void> {
  const current = (queues.get(key) ?? Promise.resolve()).catch(() => undefined).then(work);
  queues.set(key, current);
  try { await current; } finally { if (queues.get(key) === current) queues.delete(key); }
}

// No navegador não existe SecureStore. Somente hashes de senha e tokens ficam no armazenamento local.
// A sessão web é uma conveniência de demonstração; use o app nativo para o armazenamento protegido.
export const secureStorage = {
  async getItem(key: string): Promise<string | null> {
    await queues.get(key)?.catch(() => undefined);
    if (Platform.OS === 'web') return AsyncStorage.getItem(key);
    const base = await baseKey(key);
    const m = await manifest(base);
    if (!m) return null;
    const chunks = await Promise.all(Array.from({ length: m.count }, (_, i) => SecureStore.getItemAsync(chunkKey(base, m, i))));
    if (chunks.some((part) => part === null)) throw new Error('A sessão protegida está incompleta.');
    return chunks.join('');
  },
  async setItem(key: string, value: string): Promise<void> {
    return serialized(key, async () => {
      if (Platform.OS === 'web') return AsyncStorage.setItem(key, value);
      const base = await baseKey(key);
      const old = await manifest(base);
      // 400 caracteres mantêm cada parte abaixo dos limites históricos do Keychain.
      const parts = value.match(/[\s\S]{1,400}/g) ?? [''];
      if (parts.length > 256) throw new Error('Dados de sessão maiores que o limite suportado.');
      const next = { generation: Crypto.randomUUID(), count: parts.length };
      try {
        const writes = await Promise.allSettled(parts.map((part, i) => SecureStore.setItemAsync(chunkKey(base, next, i), part)));
        const failure = writes.find((result) => result.status === 'rejected');
        if (failure?.status === 'rejected') throw failure.reason;
        await SecureStore.setItemAsync(`ee.${base}`, JSON.stringify(next));
      } catch (error) {
        await clearChunks(base, next);
        throw error;
      }
      await clearChunks(base, old);
    });
  },
  async removeItem(key: string): Promise<void> {
    return serialized(key, async () => {
      if (Platform.OS === 'web') return AsyncStorage.removeItem(key);
      const base = await baseKey(key);
      const old = await manifest(base);
      await SecureStore.deleteItemAsync(`ee.${base}`);
      await clearChunks(base, old);
    });
  },
};
