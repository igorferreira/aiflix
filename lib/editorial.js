import { readFile } from 'node:fs/promises';
import { validateCatalog, isId } from '../public/assets/js/catalog.js';
import { HttpError, exactObject } from './http.js';
const unavailable = () => new HttpError(503, 'STORAGE_UNAVAILABLE', 'Armazenamento editorial indisponível.');
const maxStateBytes = 500 * 1024;
export function storageConfig() {
  const token = process.env.EDITORIAL_GITHUB_TOKEN;
  const repo = process.env.EDITORIAL_GITHUB_REPOSITORY;
  const branch = process.env.EDITORIAL_GITHUB_BRANCH || 'main';
  if (!token && !repo) return null;
  if (!token || !/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(repo || '') || !branch || branch.length > 200) throw unavailable();
  return { token, repo, branch };
}
export function validatePath(value, catalog) {
  if (!isId(value.id) || typeof value.title !== 'string' || !value.title.trim() || value.title.length > 160 || typeof value.description !== 'string' || value.description.length > 4000 || !Array.isArray(value.courseIds) || new Set(value.courseIds).size !== value.courseIds.length || value.courseIds.some(id => !isId(id) || !catalog.courses.some(course => course.id === id))) throw new HttpError(422, 'INVALID_PATH', 'Caminho ou referências inválidos.');
  return value;
}
export function validateState(value) {
  exactObject(value, ['schemaVersion', 'paths', 'publishedCatalog', 'audit']);
  if (value.schemaVersion !== 1 || !Array.isArray(value.paths) || !Array.isArray(value.audit) || value.audit.length > 100) throw unavailable();
  validateCatalog(value.publishedCatalog);
  const ids = new Set();
  for (const path of value.paths) {
    exactObject(path, ['id', 'title', 'description', 'courseIds', 'status', 'revision']);
    validatePath(path, value.publishedCatalog);
    if (ids.has(path.id) || !['draft', 'published'].includes(path.status) || !Number.isSafeInteger(path.revision) || path.revision < 1) throw unavailable();
    ids.add(path.id);
  }
  for (const entry of value.audit) {
    exactObject(entry, ['at', 'actor', 'pathId', 'revision', 'result']);
    if (typeof entry.at !== 'string' || !Number.isFinite(Date.parse(entry.at)) || entry.actor !== 'admin' || !isId(entry.pathId) || !Number.isSafeInteger(entry.revision) || entry.revision < 1 || entry.result !== 'published') throw unavailable();
  }
  for (const path of value.paths.filter(path => path.status === 'published')) {
    const published = value.publishedCatalog.learnPaths.find(item => item.id === path.id);
    if (!published || published.title !== path.title || published.description !== path.description || JSON.stringify(published.courseIds) !== JSON.stringify(path.courseIds)) throw unavailable();
  }
  return value;
}
async function github(config, suffix, options = {}) {
  let response;
  try {
    response = await fetch(`https://api.github.com/repos/${config.repo}${suffix}`, {
      ...options,
      headers: { Accept: 'application/vnd.github+json', Authorization: `Bearer ${config.token}`, 'X-GitHub-Api-Version': '2022-11-28', ...(options.body ? { 'Content-Type': 'application/json' } : {}) },
      signal: AbortSignal.timeout(10000)
    });
  } catch { throw unavailable(); }
  if (response.status === 409 || response.status === 422) throw new HttpError(409, 'REVISION_CONFLICT', 'Estado alterado por outra edição. Recarregue antes de tentar novamente.');
  if (!response.ok) throw unavailable();
  try { return await response.json(); } catch { throw unavailable(); }
}
export async function readState(config = storageConfig()) {
  if (!config) throw unavailable();
  const metadata = await github(config, '');
  if (metadata.private !== true) throw unavailable();
  const file = await github(config, `/contents/state.json?ref=${encodeURIComponent(config.branch)}`);
  if (file.encoding !== 'base64' || typeof file.content !== 'string' || typeof file.sha !== 'string' || !Number.isSafeInteger(file.size) || file.size > maxStateBytes) throw unavailable();
  try {
    const decoded = Buffer.from(file.content.replace(/\s/g, ''), 'base64');
    if (decoded.length > maxStateBytes) throw unavailable();
    return { state: validateState(JSON.parse(decoded.toString('utf8'))), sha: file.sha, config };
  } catch { throw unavailable(); }
}
export async function writeState(record) {
  validateState(record.state);
  const data = JSON.stringify(record.state);
  if (Buffer.byteLength(data) > maxStateBytes) throw new HttpError(422, 'STATE_TOO_LARGE', 'Limite editorial atingido.');
  await github(record.config, '/contents/state.json', { method: 'PUT', body: JSON.stringify({ message: 'Atualiza estado editorial', content: Buffer.from(data).toString('base64'), sha: record.sha, branch: record.config.branch }) });
}
export async function publicCatalog() {
  const config = storageConfig();
  if (config) return (await readState(config)).state.publishedCatalog;
  try { return validateCatalog(JSON.parse(await readFile(new URL('../public/data/catalog.json', import.meta.url), 'utf8'))); } catch { throw unavailable(); }
}
