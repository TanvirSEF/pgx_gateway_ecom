import * as crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;
const TAG_LENGTH = 16;

function deriveKey(secret: string): Buffer {
  return crypto.createHash('sha256').update(secret).digest();
}

function isSafeHttpUrl(candidate: string): boolean {
  try {
    const parsed = new URL(candidate);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Seals a merchant return URL into an opaque, authenticated AES-256-GCM token
 * so Stripe and third parties inspecting success_url / cancel_url cannot decode
 * the merchant domain, and attackers cannot forge arbitrary redirect targets.
 */
export function sealRedirectUrl(targetUrl: string | undefined, secret: string): string {
  const trimmed = String(targetUrl || '').trim();
  if (!trimmed || !secret || !isSafeHttpUrl(trimmed)) {
    return '';
  }

  const key = deriveKey(secret);
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  const encrypted = Buffer.concat([cipher.update(trimmed, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();

  return Buffer.concat([iv, tag, encrypted]).toString('base64url');
}

/**
 * Verifies and decrypts an opaque redirect token created by `sealRedirectUrl`.
 * Returns `null` for missing, tampered, or non-HTTP(S) payloads.
 */
export function openRedirectUrl(token: string | undefined, secret: string): string | null {
  const trimmed = String(token || '').trim();
  if (!trimmed || !secret) {
    return null;
  }

  try {
    const payload = Buffer.from(trimmed, 'base64url');
    if (payload.length <= IV_LENGTH + TAG_LENGTH) {
      return null;
    }

    const iv = payload.subarray(0, IV_LENGTH);
    const tag = payload.subarray(IV_LENGTH, IV_LENGTH + TAG_LENGTH);
    const ciphertext = payload.subarray(IV_LENGTH + TAG_LENGTH);

    const decipher = crypto.createDecipheriv(ALGORITHM, deriveKey(secret), iv);
    decipher.setAuthTag(tag);

    const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString('utf8');
    return isSafeHttpUrl(decrypted) ? decrypted : null;
  } catch {
    return null;
  }
}
