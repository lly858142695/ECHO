import { createDecipheriv } from 'node:crypto';
import { readFileSync } from 'node:fs';

const packagePath = process.argv[2];
if (!packagePath) {
  throw new Error('Usage: node scripts/echo-pro-decrypt-watermark.mjs <echo-pro-package.echo>');
}

const decodeSecretKey = (value) => {
  const normalized = value.trim();
  if (/^[a-f0-9]{64}$/iu.test(normalized)) {
    return Buffer.from(normalized, 'hex');
  }
  const base64 = normalized.replace(/-/g, '+').replace(/_/g, '/');
  return Buffer.from(base64, 'base64');
};

const key = decodeSecretKey(process.env.ECHO_PRO_WATERMARK_KEY ?? '');
if (key.length !== 32) {
  throw new Error('ECHO_PRO_WATERMARK_KEY must be the same 32-byte key used during generation.');
}

const parsed = JSON.parse(readFileSync(packagePath, 'utf8'));
const encryptedWatermark = parsed?.license?.encryptedWatermark;
if (typeof encryptedWatermark !== 'string') {
  throw new Error('Package does not contain an encrypted watermark.');
}

const [version, ivText, tagText, ciphertextText] = encryptedWatermark.split('.');
if (version !== 'v1' || !ivText || !tagText || !ciphertextText) {
  throw new Error('Unsupported watermark format.');
}

const decipher = createDecipheriv('aes-256-gcm', key, Buffer.from(ivText, 'base64url'));
decipher.setAuthTag(Buffer.from(tagText, 'base64url'));
const plaintext = Buffer.concat([
  decipher.update(Buffer.from(ciphertextText, 'base64url')),
  decipher.final(),
]).toString('utf8');

console.log(JSON.stringify(JSON.parse(plaintext), null, 2));
