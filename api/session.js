import { authConfig, authorize, checkOrigin, passwordMatches, session, sessionValue, setCookie } from '../lib/auth.js';
import { body, exactObject, failure, HttpError, methods, reply } from '../lib/http.js';
import { storageConfig } from '../lib/editorial.js';
export default async function handler(req, res) {
  if (!methods(req, res, ['GET', 'POST', 'DELETE'])) return;
  try {
    const config = authConfig();
    if (!storageConfig()) throw new HttpError(503, 'ADMIN_UNAVAILABLE', 'Administração ainda não configurada.');
    if (req.method === 'GET') { reply(res, 200, { authenticated: session(req, config)?.role === 'admin' }); return; }
    checkOrigin(req, config);
    if (req.method === 'DELETE') {
      authorize(req, config); setCookie(res, config); reply(res, 204); return;
    }
    const input = await body(req, 16 * 1024);
    exactObject(input, ['password']);
    if (typeof input.password !== 'string' || !input.password.length || input.password.length > 1024) throw new HttpError(422, 'INVALID_INPUT', 'Senha inválida.');
    if (!await passwordMatches(input.password, config)) throw new HttpError(401, 'UNAUTHENTICATED', 'Credenciais inválidas.');
    setCookie(res, config, sessionValue(config));
    reply(res, 200, { authenticated: true });
  } catch (error) { failure(res, error); }
}
