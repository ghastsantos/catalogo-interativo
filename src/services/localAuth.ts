import * as Crypto from 'expo-crypto';
import { pbkdf2Async } from '@noble/hashes/pbkdf2.js';
import { sha256 } from '@noble/hashes/sha2.js';
import { bytesToHex, hexToBytes } from '@noble/hashes/utils.js';
import { constantTimeEqual, normalizeEmail, validateCredentials, validateName } from '../domain/validation';
import type { AppUser } from '../types/models';
import { secureStorage } from './secureStorage';

interface Account { version: 1; user: AppUser; salt: string; hash: string; iterations: number }
const SESSION_KEY = 'entre-episodios.local.session.v1';
const ITERATIONS = 600_000;
const accountKey = async (email: string) => `entre-episodios.account.${await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, normalizeEmail(email))}`;

async function passwordHash(password: string, salt: string, iterations: number): Promise<Uint8Array> {
  return pbkdf2Async(sha256, password, hexToBytes(salt), { c: iterations, dkLen: 32, asyncTick: 10 });
}

function parseAccount(raw: string): Account {
  const value = JSON.parse(raw) as Account;
  if (value.version !== 1 || !value.user || value.user.provider !== 'local'
    || typeof value.user.id !== 'string' || typeof value.user.email !== 'string'
    || typeof value.user.name !== 'string' || !/^[a-f0-9]{32}$/.test(value.salt)
    || !/^[a-f0-9]{64}$/.test(value.hash) || value.iterations !== ITERATIONS) {
    throw new Error('Não foi possível ler esta conta local.');
  }
  return value;
}

export const localAuth = {
  async restore(): Promise<AppUser | null> {
    const raw = await secureStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw) as { id?: string; email?: string };
    if (!session.id || !session.email) throw new Error('Sessão local inválida.');
    const account = await secureStorage.getItem(await accountKey(session.email));
    if (!account) { await secureStorage.removeItem(SESSION_KEY); return null; }
    const { user } = parseAccount(account);
    return user.id === session.id ? user : null;
  },
  async signUp(name: string, email: string, password: string): Promise<AppUser> {
    validateName(name); validateCredentials(email, password);
    const key = await accountKey(email);
    if (await secureStorage.getItem(key)) throw new Error('Este e-mail já está cadastrado neste aparelho.');
    const salt = bytesToHex(await Crypto.getRandomBytesAsync(16));
    const user: AppUser = { id: Crypto.randomUUID(), name: name.trim(), email: normalizeEmail(email), provider: 'local' };
    const account: Account = { version: 1, user, salt, hash: bytesToHex(await passwordHash(password, salt, ITERATIONS)), iterations: ITERATIONS };
    await secureStorage.setItem(key, JSON.stringify(account));
    await secureStorage.setItem(SESSION_KEY, JSON.stringify({ id: user.id, email: user.email }));
    return user;
  },
  async signIn(email: string, password: string): Promise<AppUser> {
    validateCredentials(email, password);
    const raw = await secureStorage.getItem(await accountKey(email));
    if (!raw) throw new Error('E-mail ou senha incorretos.');
    const account = parseAccount(raw);
    const hash = await passwordHash(password, account.salt, account.iterations);
    if (!constantTimeEqual(hash, hexToBytes(account.hash))) throw new Error('E-mail ou senha incorretos.');
    await secureStorage.setItem(SESSION_KEY, JSON.stringify({ id: account.user.id, email: account.user.email }));
    return account.user;
  },
  signOut: () => secureStorage.removeItem(SESSION_KEY),
};
