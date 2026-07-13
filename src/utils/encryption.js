// Client-side AES-256-GCM encryption for LocalStorage auto-save data.
// NOTE: The passphrase is hardcoded for this project simulation. In a real
// production system this would be derived per-user (e.g. from a session
// secret) rather than hardcoded in the bundle.

const PASSPHRASE = 'lendswift-auto-save-v1-static-passphrase';
const SALT = 'lendswift-static-salt';

async function getKey() {
  const enc = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    enc.encode(PASSPHRASE),
    'PBKDF2',
    false,
    ['deriveKey'],
  );
  return window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: enc.encode(SALT),
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  );
}

function bufferToBase64(buffer) {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)));
}

function base64ToBuffer(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

export async function encryptData(plainObject) {
  const key = await getKey();
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const enc = new TextEncoder();
  const encoded = enc.encode(JSON.stringify(plainObject));
  const ciphertext = await window.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encoded,
  );
  return {
    iv: bufferToBase64(iv),
    data: bufferToBase64(ciphertext),
  };
}

export async function decryptData({ iv, data }) {
  const key = await getKey();
  const decrypted = await window.crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: base64ToBuffer(iv) },
    key,
    base64ToBuffer(data),
  );
  const dec = new TextDecoder();
  return JSON.parse(dec.decode(decrypted));
}
