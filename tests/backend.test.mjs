import test from 'node:test';
import assert from 'node:assert/strict';
import { randomBytes, scryptSync } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import sessionHandler from '../api/session.js';
import adminHandler from '../api/admin/[...segments].js';
import catalogHandler from '../api/catalog.js';
import { authConfig, sessionValue } from '../lib/auth.js';

const catalog = { schemaVersion: 2, tracks: [], learnPaths: [], courses: [{ id: 'fixture-course', title: 'Fixture — não publicar', description: '', modules: [{ id: 'fixture-module', title: 'Fixture', lessons: [{ id: 'fixture-lesson', title: 'Fixture', description: '', durationSeconds: 60, youtubeUrl: 'https://youtu.be/abcdefghijk', materials: [] }] }] }] };
const password = randomBytes(32).toString('hex');
const salt = randomBytes(16);
const hash = `scrypt$${salt.toString('hex')}$${scryptSync(password, salt, 64).toString('hex')}`;
const keys = ['ADMIN_PASSWORD_HASH', 'ADMIN_SESSION_SECRET', 'ADMIN_ORIGIN', 'ADMIN_LOGIN_PROTECTION', 'ADMIN_LOCAL_HTTP', 'VERCEL', 'EDITORIAL_GITHUB_TOKEN', 'EDITORIAL_GITHUB_REPOSITORY', 'EDITORIAL_GITHUB_BRANCH'];
async function request(handler, method = 'GET', url = '/api/session', input, cookie, extra = {}) {
  const headers = { origin: 'https://example.test', 'content-type': 'application/json', ...extra };
  if (cookie) headers.cookie = cookie;
  const req = { method, url, headers, ...(input !== undefined ? { body: input } : {}) };
  const res = { headers: {}, setHeader(k, v) { this.headers[k.toLowerCase()] = v; }, end(value) { this.raw = value; this.value = value ? JSON.parse(value) : undefined; } };
  await handler(req, res);
  return res;
}
test('backend: sessão, autorização, CAS e publicação sem rede real', async t => {
  const saved = Object.fromEntries(keys.map(key => [key, process.env[key]]));
  const realFetch = globalThis.fetch;
  catalog.creators = [{ id: 'fixture-creator', title: 'Autor fixture', description: 'Indicação isolada de teste', channelUrl: 'https://www.youtube.com/@fixture' }];
  let state = { schemaVersion: 1, paths: [], publishedCatalog: structuredClone(catalog), audit: [] };
  let sha = 'revision-1';
  let writes = 0;
  let privateRepo = true;
  let forceConflict = false;
  let forceFailure = false;
  Object.assign(process.env, { ADMIN_PASSWORD_HASH: hash, ADMIN_SESSION_SECRET: randomBytes(32).toString('hex'), ADMIN_ORIGIN: 'https://example.test', ADMIN_LOGIN_PROTECTION: 'platform', EDITORIAL_GITHUB_TOKEN: 'isolated-test-token', EDITORIAL_GITHUB_REPOSITORY: 'fixture/private', EDITORIAL_GITHUB_BRANCH: 'main' });
  delete process.env.ADMIN_LOCAL_HTTP;
  globalThis.fetch = async (url, options) => {
    assert.ok(url.startsWith('https://api.github.com/repos/fixture/private'));
    if (forceFailure) return new Response('{}', { status: 500 });
    if (url.endsWith('/fixture/private')) return Response.json({ private: privateRepo });
    if (options.method === 'PUT') {
      const input = JSON.parse(options.body);
      assert.equal(input.branch, 'main');
      if (forceConflict || input.sha !== sha) return new Response('{}', { status: 409 });
      state = JSON.parse(Buffer.from(input.content, 'base64').toString('utf8'));
      writes++; sha = `revision-${writes + 1}`;
      return Response.json({ content: { sha } });
    }
    const raw = JSON.stringify(state);
    return Response.json({ sha, content: Buffer.from(raw).toString('base64'), size: Buffer.byteLength(raw), encoding: 'base64' });
  };
  try {
    await t.test('configuração incompleta e proteção não ativada falham fechadas', async () => {
      delete process.env.ADMIN_LOGIN_PROTECTION;
      assert.equal((await request(sessionHandler)).statusCode, 503);
      process.env.ADMIN_LOGIN_PROTECTION = 'platform';
      assert.equal((await request(sessionHandler)).value.authenticated, false);
    });
    await t.test('login exige origem exata, JSON e senha correta', async () => {
      assert.equal((await request(sessionHandler, 'POST', '/api/session', { password }, undefined, { origin: 'https://evil.test' })).statusCode, 403);
      assert.equal((await request(sessionHandler, 'POST', '/api/session', { password }, undefined, { origin: undefined })).statusCode, 403);
      assert.equal((await request(sessionHandler, 'POST', '/api/session', { password: 'wrong' })).statusCode, 401);
      assert.equal((await request(sessionHandler, 'POST', '/api/session', '{bad')).statusCode, 400);
      assert.equal((await request(sessionHandler, 'POST', '/api/session', { password }, undefined, { 'content-length': '17000' })).statusCode, 413);
      assert.equal((await request(sessionHandler, 'POST', '/api/session', { password }, undefined, { 'content-type': 'text/plain' })).statusCode, 415);
    });
    const login = await request(sessionHandler, 'POST', '/api/session', { password });
    assert.equal(login.statusCode, 200);
    const cookie = login.headers['set-cookie'].split(';')[0];
    assert.match(login.headers['set-cookie'], /HttpOnly/);
    assert.match(login.headers['set-cookie'], /Secure/);
    assert.match(login.headers['set-cookie'], /SameSite=Strict/);
    assert.deepEqual(login.value, { authenticated: true });
    await t.test('autorização rejeita anônimo, adulteração, expiração e papel incorreto', async () => {
      assert.equal((await request(adminHandler, 'GET', '/api/admin/learn-paths')).statusCode, 401);
      assert.equal((await request(adminHandler, 'GET', '/api/admin/learn-paths', undefined, `${cookie}x`)).statusCode, 401);
      const expired = `aiflix_admin=${sessionValue(authConfig(), Math.floor(Date.now() / 1000) - 30000)}`;
      assert.equal((await request(adminHandler, 'GET', '/api/admin/learn-paths', undefined, expired)).statusCode, 401);
      const noRole = `aiflix_admin=${sessionValue(authConfig(), undefined, 'reader')}`;
      assert.equal((await request(adminHandler, 'GET', '/api/admin/learn-paths', undefined, noRole)).statusCode, 403);
      assert.equal((await request(sessionHandler, 'GET', '/api/session', undefined, cookie)).value.authenticated, true);
    });
    const draft = { id: 'first-path', title: 'Caminho', description: 'Rascunho privado', courseIds: ['fixture-course'] };
    await t.test('rascunho persiste compartilhado sem aparecer no público', async () => {
      assert.equal((await request(adminHandler, 'POST', '/api/admin/learn-paths', draft, cookie)).statusCode, 201);
      const listed = await request(adminHandler, 'GET', '/api/admin/learn-paths', undefined, cookie);
      assert.equal(listed.value.paths[0].revision, 1);
      const publicResponse = await request(catalogHandler, 'GET', '/api/catalog');
      assert.deepEqual(publicResponse.value.learnPaths, []);
      assert.equal(Object.hasOwn(publicResponse.value, 'paths'), false);
      assert.equal(Object.hasOwn(publicResponse.value, 'audit'), false);
      assert.equal(publicResponse.headers['cache-control'], 'no-store');
    });
    await t.test('validação e CSRF impedem escritas inválidas', async () => {
      const previous = writes;
      assert.equal((await request(adminHandler, 'POST', '/api/admin/learn-paths', draft, cookie)).statusCode, 409);
      assert.equal((await request(adminHandler, 'POST', '/api/admin/learn-paths', { ...draft, id: 'broken', courseIds: ['missing'] }, cookie)).statusCode, 422);
      assert.equal((await request(adminHandler, 'POST', '/api/admin/learn-paths', { ...draft, id: 'bad', unknown: true }, cookie)).statusCode, 422);
      assert.equal((await request(adminHandler, 'POST', '/api/admin/learn-paths', { ...draft, id: 'other' }, cookie, { origin: 'https://evil.test' })).statusCode, 403);
      assert.equal(writes, previous);
    });
    await t.test('rascunho vazio não publica; métodos e revisão inválidos são recusados', async () => {
      assert.equal((await request(adminHandler, 'POST', '/api/admin/learn-paths', { ...draft, id: 'empty-path', courseIds: [] }, cookie)).statusCode, 201);
      assert.equal((await request(adminHandler, 'POST', '/api/admin/learn-paths/empty-path/publish', { expectedRevision: 1 }, cookie)).statusCode, 422);
      assert.equal((await request(adminHandler, 'POST', '/api/admin/learn-paths/first-path/publish', { expectedRevision: 0 }, cookie)).statusCode, 422);
      assert.equal((await request(adminHandler, 'DELETE', '/api/admin/learn-paths/first-path', undefined, cookie)).statusCode, 405);
      assert.equal((await request(sessionHandler, 'PATCH')).statusCode, 405);
      assert.equal((await request(catalogHandler, 'POST', '/api/catalog')).statusCode, 405);
    });
    await t.test('publicação atômica e conflitos preservam snapshot', async () => {
      const published = await request(adminHandler, 'POST', '/api/admin/learn-paths/first-path/publish', { expectedRevision: 1 }, cookie);
      assert.equal(published.statusCode, 200);
      assert.equal(published.value.path.revision, 2);
      assert.deepEqual((await request(catalogHandler, 'GET', '/api/catalog')).value.creators, catalog.creators);
      assert.equal((await request(catalogHandler, 'GET', '/api/catalog')).value.learnPaths[0].title, 'Caminho');
      assert.equal((await request(adminHandler, 'POST', '/api/admin/learn-paths/first-path/publish', { expectedRevision: 1 }, cookie)).statusCode, 409);
      const update = { title: 'Novo título', description: '', courseIds: ['fixture-course'], expectedRevision: 2 };
      assert.equal((await request(adminHandler, 'PUT', '/api/admin/learn-paths/first-path', update, cookie)).statusCode, 200);
      assert.equal((await request(catalogHandler, 'GET', '/api/catalog')).value.learnPaths[0].title, 'Caminho');
      forceConflict = true;
      assert.equal((await request(adminHandler, 'POST', '/api/admin/learn-paths/first-path/publish', { expectedRevision: 3 }, cookie)).statusCode, 409);
      forceConflict = false;
      assert.equal(state.publishedCatalog.learnPaths[0].title, 'Caminho');
      assert.equal(state.audit.length, 1);
    });
    await t.test('storage público, corrompido ou falho não usa bootstrap silencioso', async () => {
      privateRepo = false;
      assert.equal((await request(catalogHandler, 'GET', '/api/catalog')).statusCode, 503);
      privateRepo = true;
      forceFailure = true;
      assert.equal((await request(catalogHandler, 'GET', '/api/catalog')).statusCode, 503);
      forceFailure = false;
      const old = state.schemaVersion; state.schemaVersion = 99;
      assert.equal((await request(catalogHandler, 'GET', '/api/catalog')).statusCode, 503);
      state.schemaVersion = old;
      const logout = await request(sessionHandler, 'DELETE', '/api/session', undefined, cookie);
      assert.equal(logout.statusCode, 204);
      assert.match(logout.headers['set-cookie'], /Max-Age=0/);
    });
    await t.test('utilitários hash/seed validam entrada e não sobrescrevem arquivo existente', async () => {
      const result = spawnSync(process.execPath, ['scripts/hash-admin-password.mjs'], { input: password, encoding: 'utf8' });
      assert.equal(result.status, 0);
      assert.match(result.stdout.trim(), /^scrypt\$[a-f0-9]{32}\$[a-f0-9]{128}$/);
      assert.equal(result.stdout.includes(password), false);
      const directory = await mkdtemp(path.join(os.tmpdir(), 'aiflix-seed-'));
      try {
        const file = path.join(directory, 'state.json');
        const seeded = spawnSync(process.execPath, ['scripts/seed-editorial-state.mjs', 'public/data/catalog.json', file], { encoding: 'utf8' });
        assert.equal(seeded.status, 0);
        assert.equal(JSON.parse(await readFile(file, 'utf8')).schemaVersion, 1);
        assert.notEqual(spawnSync(process.execPath, ['scripts/seed-editorial-state.mjs', 'public/data/catalog.json', file]).status, 0);
      } finally { await rm(directory, { recursive: true }); }
    });
  } finally {
    globalThis.fetch = realFetch;
    for (const key of keys) saved[key] === undefined ? delete process.env[key] : process.env[key] = saved[key];
  }
});
