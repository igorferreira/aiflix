import test from 'node:test';
import assert from 'node:assert/strict';
import { validateCatalog, youtubeId, resolveRoute } from '../public/assets/js/catalog.js';
import { createProgress } from '../public/assets/js/progress.js';
const fixture = () => ({ schemaVersion: 2, courses: [{ id: 'test-course', title: 'Fixture de teste', description: '', modules: [{ id: 'test-module', title: 'Módulo de teste', lessons: [{ id: 'test-lesson', title: 'Aula fictícia isolada', description: '<img src=x onerror=alert(1)>', durationSeconds: 60, youtubeUrl: 'https://www.youtube.com/watch?v=abcdefghijk', materials: [] }] }] }], tracks: [], learnPaths: [{ id: 'test-path', title: 'Caminho', description: '', courseIds: ['test-course'] }] });
test('catálogo preserva texto como dados, curso independente e referências em caminhos', () => {
  const value = fixture(); value.learnPaths.push({ ...value.learnPaths[0], id: 'second-path' });
  assert.equal(validateCatalog(value), value);
  assert.equal(resolveRoute('#/curso/test-course', value).type, 'course');
  assert.equal(resolveRoute('#/caminho/second-path', value).path.courseIds[0], 'test-course');
});
test('catálogo rejeita versão, campos desconhecidos, duplicatas e referências quebradas', () => {
  for (const change of [c => c.schemaVersion = 1, c => c.secret = 'x', c => c.courses.push(c.courses[0]), c => c.learnPaths[0].courseIds.push('missing'), c => c.learnPaths[0].courseIds.push('test-course'), c => c.courses[0].modules[0].lessons[0].durationSeconds = -1]) {
    const value = fixture(); change(value); assert.throws(() => validateCatalog(value));
  }
});
test('URLs YouTube usam hosts exatos e ID sem repassar parâmetros extras', () => {
  assert.equal(youtubeId('https://youtu.be/abcdefghijk?si=other'), 'abcdefghijk');
  for (const url of ['javascript:alert(1)', 'https://youtube.com.evil.test/watch?v=abcdefghijk', 'https://user:pass@youtube.com/watch?v=abcdefghijk', 'https://youtube.com/embed/abcdefghijk', 'https://youtu.be/abcdefghijk/extra', 'https://youtube.com:8080/watch?v=abcdefghijk', 'http://youtube.com/watch?v=abcdefghijk']) assert.throws(() => youtubeId(url));
});
test('rotas vinculam aula ao curso e rejeitam formatos malformados', () => {
  const value = fixture();
  assert.equal(resolveRoute('#/curso/test-course/aula/test-lesson', value).type, 'lesson');
  for (const hash of ['#/curso/missing/aula/test-lesson', '#/curso/test-course/aula/missing', '#/curso/test-course%2fextra', '#/curso/test-course/', '#/admin/caminho/--bad']) assert.equal(resolveRoute(hash, value).type, 'not-found');
  assert.deepEqual(resolveRoute('#/admin/caminho/new-path', value), { type: 'admin', id: 'new-path' });
});
test('progresso persiste reversão e preserva IDs removidos do catálogo', () => {
  let raw = JSON.stringify({ version: 1, completedLessonIds: ['removed-lesson'] });
  const store = { getItem: () => raw, setItem: (_, value) => { raw = value; } };
  const state = createProgress(store); assert.equal(state.stats(fixture().courses[0]).percent, 0);
  state.toggle('test-lesson'); assert.equal(state.stats(fixture().courses[0]).percent, 100);
  assert.equal(createProgress(store).completed.has('removed-lesson'), true);
  state.toggle('test-lesson'); assert.equal(createProgress(store).completed.has('test-lesson'), false);
});
test('registro corrompido não é sobrescrito sem autorização explícita', () => {
  let raw = '{broken'; const state = createProgress({ getItem: () => raw, setItem: (_, value) => { raw = value; } });
  assert.equal(state.toggle('test-lesson'), false); assert.equal(raw, '{broken');
  assert.equal(state.toggle('test-lesson', { replaceCorrupt: true }), true); assert.equal(JSON.parse(raw).completedLessonIds[0], 'test-lesson');
});
test('falha de escrita mantém conclusão na sessão sem prometer persistência', () => {
  const state = createProgress({ getItem: () => null, setItem: () => { throw new Error('blocked'); } });
  assert.equal(state.toggle('test-lesson'), true); assert.equal(state.completed.has('test-lesson'), true); assert.match(state.warning, /sessão/);
});

test('cursos em preparação são explícitos e não simulam aulas publicadas', () => {
  const value = fixture();
  value.courses.push({ id: 'harness', title: 'Harness', description: 'Curadoria pendente', status: 'preparing', modules: [] });
  assert.equal(validateCatalog(value), value);
  assert.equal(resolveRoute('#/curso/harness', value).type, 'course');
  assert.equal(resolveRoute('#/curso/harness/aula/inventada', value).type, 'not-found');
  assert.deepEqual(createProgress({ getItem: () => null }).stats(value.courses[1]), { completed: 0, total: 0, percent: 0 });
  delete value.courses[1].status;
  assert.throws(() => validateCatalog(value));
  value.courses[1].status = 'published';
  assert.throws(() => validateCatalog(value));
  value.courses[1].status = 'preparing';
  value.courses[1].modules = value.courses[0].modules;
  assert.throws(() => validateCatalog(value));
});
