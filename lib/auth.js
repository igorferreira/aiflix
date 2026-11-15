import { createHmac, timingSafeEqual, scrypt as scryptCallback } from 'node:crypto';
import { promisify } from 'node:util';
import { HttpError } from './http.js';
const scrypt = promisify(scryptCallback);
const lifetime = 8 * 60 * 60;
export function authConfig() {
  const hash = process.env.ADMIN_PASSWORD_HASH || '';
  const secret = process.env.ADMIN_SESSION_SECRET || '';
  const origin = process.env.ADMIN_ORIGIN || '';
  const local = !process.env.VERCEL && process.env.ADMIN_LOCAL_HTTP === 'true';
  let url;
  try { url = new URL(origin); } catch {}
  if (!/^scrypt\$[a-f0-9]{32}\$[a-f0-9]{128}$/.test(hash) || Buffer.byteLength(secret) < 32 || !url || url.origin !== origin || url.username || url.password || (url.protocol !== 'https:' && !(local && url.protocol === 'http:' && ['127.0.0.1', 'localhost'].includes(url.hostname))) || process.env.ADMIN_LOGIN_PROTECTION !== 'platform') throw new HttpError(503, 'ADMIN_UNAVAILABLE', 'Administração ainda não configurada.');
  return { hash, secret, origin, local };
}
export function checkOrigin(req, config) {
  if (req.headers.origin !== config.origin) throw new HttpError(403, 'ORIGIN_DENIED', 'Origem não autorizada.');
}
function signature(payload, secret) { return createHmac('sha256', secret).update(payload).digest('base64url'); }
export function sessionValue(config, now = Math.floor(Date.now() / 1000), role = 'admin') {
  const payload = Buffer.from(JSON.stringify({ role, iat: now, exp: now + lifetime })).toString('base64url');
  return `${payload}.${signature(payload, config.secret)}`;
}
export function session(req, config) {
  const matches = (req.headers.cookie || '').split(';').map(part => part.trim()).filter(part => part.startsWith('aiflix_admin='));
  if (matches.length !== 1) return null;
  const token = matches[0].slice('aiflix_admin='.length);
  if (token.length > 1024) return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const expected = Buffer.from(signature(parts[0], config.secret));
  const actual = Buffer.from(parts[1]);
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return null;
  try {
    const value = JSON.parse(Buffer.from(parts[0], 'base64url').toString('utf8'));
    const now = Math.floor(Date.now() / 1000);
    if (!Number.isSafeInteger(value.iat) || !Number.isSafeInteger(value.exp) || value.iat > now || value.exp <= now || value.exp - value.iat !== lifetime) return null;
    return value;
  } catch { return null; }
}
export function authorize(req, config) {
  const value = session(req, config);
  if (!value) throw new HttpError(401, 'UNAUTHENTICATED', 'Entre na administração.');
  if (value.role !== 'admin') throw new HttpError(403, 'FORBIDDEN', 'Sem permissão administrativa.');
  return value;
}
export function setCookie(res, config, value = '') {
  res.setHeader('Set-Cookie', `aiflix_admin=${value}; Path=/api; HttpOnly; SameSite=Strict; Max-Age=${value ? lifetime : 0}${config.local ? '' : '; Secure'}`);
}
export async function passwordMatches(password, config) {
  const [, salt, hash] = config.hash.split('$');
  const derived = await scrypt(password, Buffer.from(salt, 'hex'), 64, { N: 16384, r: 8, p: 1 });
  return timingSafeEqual(derived, Buffer.from(hash, 'hex'));
}
