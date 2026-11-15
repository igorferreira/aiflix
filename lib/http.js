export class HttpError extends Error {
  constructor(status, code, message) { super(message); this.status = status; this.code = code; }
}
export function reply(res, status, value) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  if (value !== undefined) res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.statusCode = status;
  res.end(value === undefined ? undefined : JSON.stringify(value));
}
export function failure(res, error) {
  const known = error instanceof HttpError;
  reply(res, known ? error.status : 503, { error: { code: known ? error.code : 'UNAVAILABLE', message: known ? error.message : 'Serviço indisponível. Tente novamente mais tarde.' } });
}
export function methods(req, res, allowed) {
  if (allowed.includes(req.method)) return true;
  res.setHeader('Allow', allowed.join(', '));
  reply(res, 405, { error: { code: 'METHOD_NOT_ALLOWED', message: 'Método não permitido.' } });
  return false;
}
export async function body(req, limit = 256 * 1024) {
  if (!/^application\/json(?:\s*;|$)/i.test(req.headers['content-type'] || '')) throw new HttpError(415, 'CONTENT_TYPE', 'Envie JSON.');
  if (Number(req.headers['content-length']) > limit) throw new HttpError(413, 'BODY_TOO_LARGE', 'Corpo excede o limite.');
  let raw = '';
  if (req.body !== undefined) raw = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
  else for await (const chunk of req) {
    raw += Buffer.isBuffer(chunk) ? chunk.toString('utf8') : chunk;
    if (Buffer.byteLength(raw) > limit) throw new HttpError(413, 'BODY_TOO_LARGE', 'Corpo excede o limite.');
  }
  if (Buffer.byteLength(raw) > limit) throw new HttpError(413, 'BODY_TOO_LARGE', 'Corpo excede o limite.');
  try { return JSON.parse(raw); } catch { throw new HttpError(400, 'INVALID_JSON', 'JSON inválido.'); }
}
export function exactObject(value, keys) {
  if (!value || typeof value !== 'object' || Array.isArray(value) || Object.keys(value).length !== keys.length || keys.some(key => !Object.hasOwn(value, key))) throw new HttpError(422, 'INVALID_INPUT', 'Campos inválidos.');
}
