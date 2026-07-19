const ENCRYPTED_BACKUP_FORMAT = 'aequimens-encrypted-backup';
const ENCRYPTION_VERSION = 1;
const PBKDF2_ITERATIONS = 250_000;

interface EncryptedBackupEnvelope {
  app: 'aequimens';
  format: typeof ENCRYPTED_BACKUP_FORMAT;
  version: number;
  algorithm: 'AES-GCM';
  kdf: 'PBKDF2-SHA-256';
  iterations: number;
  exportedAt: string;
  salt: string;
  iv: string;
  ciphertext: string;
}

export interface BackupSummary {
  encrypted: boolean;
  exportedAt?: string;
  version?: number;
  counts: {
    checkIns: number;
    journalEntries: number;
    habits: number;
    goals: number;
    routines: number;
  };
}


function asArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = '';
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
}

function base64ToBytes(value: string): Uint8Array {
  const binary = atob(value);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

async function deriveKey(password: string, salt: Uint8Array, iterations: number): Promise<CryptoKey> {
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveKey'],
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: asArrayBuffer(salt),
      iterations,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  );
}

export async function encryptBackup(plainText: string, password: string): Promise<string> {
  if (password.length < 8) {
    throw new Error('Use at least 8 characters for the backup password.');
  }

  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(password, salt, PBKDF2_ITERATIONS);
  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: asArrayBuffer(iv) },
    key,
    new TextEncoder().encode(plainText),
  );

  const envelope: EncryptedBackupEnvelope = {
    app: 'aequimens',
    format: ENCRYPTED_BACKUP_FORMAT,
    version: ENCRYPTION_VERSION,
    algorithm: 'AES-GCM',
    kdf: 'PBKDF2-SHA-256',
    iterations: PBKDF2_ITERATIONS,
    exportedAt: new Date().toISOString(),
    salt: bytesToBase64(salt),
    iv: bytesToBase64(iv),
    ciphertext: bytesToBase64(new Uint8Array(ciphertext)),
  };

  return JSON.stringify(envelope, null, 2);
}

export function isEncryptedBackup(raw: string): boolean {
  try {
    const parsed = JSON.parse(raw) as Partial<EncryptedBackupEnvelope>;
    return parsed.format === ENCRYPTED_BACKUP_FORMAT && typeof parsed.ciphertext === 'string';
  } catch {
    return false;
  }
}

export async function decryptBackup(raw: string, password: string): Promise<string> {
  const parsed = JSON.parse(raw) as EncryptedBackupEnvelope;
  if (
    parsed.app !== 'aequimens' ||
    parsed.format !== ENCRYPTED_BACKUP_FORMAT ||
    parsed.algorithm !== 'AES-GCM' ||
    parsed.kdf !== 'PBKDF2-SHA-256'
  ) {
    throw new Error('This is not a recognised encrypted Aequimens backup.');
  }

  try {
    const salt = base64ToBytes(parsed.salt);
    const iv = base64ToBytes(parsed.iv);
    const key = await deriveKey(password, salt, parsed.iterations || PBKDF2_ITERATIONS);
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: asArrayBuffer(iv) },
      key,
      asArrayBuffer(base64ToBytes(parsed.ciphertext)),
    );
    return new TextDecoder().decode(decrypted);
  } catch {
    throw new Error('The password is incorrect or the backup file is damaged.');
  }
}

function arrayLength(value: unknown): number {
  return Array.isArray(value) ? value.length : 0;
}

export function inspectBackup(raw: string, encrypted = false): BackupSummary {
  const parsed = JSON.parse(raw) as {
    app?: string;
    version?: number;
    exportedAt?: string;
    data?: Record<string, unknown>;
  };

  if (parsed.app !== 'aequimens' || !parsed.data || typeof parsed.data !== 'object') {
    throw new Error('This file is not a valid Aequimens backup.');
  }

  return {
    encrypted,
    exportedAt: parsed.exportedAt,
    version: parsed.version,
    counts: {
      checkIns: arrayLength(parsed.data.checkIns),
      journalEntries: arrayLength(parsed.data.journal),
      habits: arrayLength(parsed.data.habits),
      goals: arrayLength(parsed.data.goals),
      routines: arrayLength(parsed.data.routines),
    },
  };
}
