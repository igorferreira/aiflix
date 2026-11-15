import test from 'node:test';
import assert from 'node:assert/strict';
import { adminApi } from '../public/assets/js/admin-api.js';

test('transporte administrativo preserva cookies, payload e erros sem depender do DOM', async () => {
  const originalFetch = globalThis.fetch;
  try {
    globalThis.fetch = async (path, options) => {
      assert.equal(path, '/api/session');
      assert.equal(options.credentials, 'same-origin');
      assert.equal(options.cache, 'no-store');
      assert.equal(options.method, 'POST');
      assert.equal(options.headers['Content-Type'], 'application/json');
      assert.equal(options.body, '{"password":"fixture"}');
      return Response.json({ authenticated: true });
    };
    assert.deepEqual(await adminApi('/api/session', { method: 'POST', body: '{"password":"fixture"}' }), { authenticated: true });
    globalThis.fetch = async () => new Response(null, { status: 204 });
    assert.equal(await adminApi('/api/session', { method: 'DELETE' }), null);
    globalThis.fetch = async () => { throw new Error('network'); };
    await assert.rejects(adminApi('/api/session'), /Não foi possível conectar/);
    globalThis.fetch = async () => new Response('not-json');
    await assert.rejects(adminApi('/api/session'), /Resposta inválida/);
    globalThis.fetch = async () => Response.json({ error: { message: 'conflito' } }, { status: 409 });
    await assert.rejects(adminApi('/api/admin/learn-paths'), /Suas alterações foram mantidas/);
    globalThis.fetch = async () => Response.json({ error: { message: 'Administração ainda não configurada.' } }, { status: 503 });
    await assert.rejects(adminApi('/api/session'), /Administração ainda não configurada/);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
