export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function validateCredentials(email: string, password: string): void {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizeEmail(email))) {
    throw new Error('Digite um e-mail válido.');
  }
  if (password.length < 8 || password.length > 128) {
    throw new Error('Use uma senha de 8 a 128 caracteres.');
  }
}

export function validateName(name: string): void {
  if (name.trim().length < 2 || name.trim().length > 80) {
    throw new Error('Digite seu nome, com 2 a 80 caracteres.');
  }
}

export function constantTimeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let difference = 0;
  for (let i = 0; i < a.length; i += 1) difference |= a[i]! ^ b[i]!;
  return difference === 0;
}
