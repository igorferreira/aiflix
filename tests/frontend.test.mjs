import test from 'node:test';
import assert from 'node:assert/strict';
import { validateCatalog, youtubeId, resolveRoute, lessonAuthor } from '../public/assets/js/catalog.js';
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
test('indicações de canais são opcionais e rejeitam destinos inseguros e IDs duplicados', () => {
  const creator = { id: 'ronnaldhawk', title: '@ronnaldhawk', description: 'Indicação da comunidade', channelUrl: 'https://www.youtube.com/@ronnaldhawk' };
  const value = fixture();
  assert.equal(validateCatalog(value), value);
  value.creators = [creator];
  assert.equal(validateCatalog(value).creators[0].channelUrl, creator.channelUrl);
  for (const url of ['https://youtube.com.evil.test/@ronnaldhawk', 'javascript:alert(1)', 'https://user:pass@www.youtube.com/@ronnaldhawk', 'https://www.youtube.com/watch?v=abcdefghijk', 'https://www.youtube.com:8080/@ronnaldhawk', 'https://www.youtube.com/@ronnaldhawk?redirect=other']) {
    assert.throws(() => validateCatalog({ ...value, creators: [{ ...creator, channelUrl: url }] }));
  }
  assert.throws(() => validateCatalog({ ...value, creators: [creator, creator] }));
  assert.throws(() => validateCatalog({ ...value, creators: 'invalid' }));
  assert.throws(() => validateCatalog({ ...value, creators: [{ ...creator, description: '' }] }));
});
test('rotas vinculam aula ao curso e rejeitam formatos malformados', () => {
  const value = fixture();
  assert.equal(resolveRoute('#/curso/test-course/aula/test-lesson', value).type, 'lesson');
  for (const hash of ['#/curso/missing/aula/test-lesson', '#/curso/test-course/aula/missing', '#/curso/test-course%2fextra', '#/curso/test-course/', '#/admin/caminho/--bad']) assert.equal(resolveRoute(hash, value).type, 'not-found');
  assert.deepEqual(resolveRoute('#/admin/caminho/new-path', value), { type: 'admin', id: 'new-path' });
});
test('rota explicativa do progresso aceita seções conhecidas e rejeita variações', () => {
  const value = fixture();
  assert.deepEqual(resolveRoute('#/como-funciona-progresso', value), { type: 'progress-info', section: undefined });
  assert.deepEqual(resolveRoute('#/como-funciona-progresso#privacidade', value), { type: 'progress-info', section: 'privacidade' });
  assert.deepEqual(resolveRoute('#/como-funciona-progresso#curadoria', value), { type: 'progress-info', section: 'curadoria' });
  for (const hash of ['#/como-funciona-progresso/', '#/como-funciona-progresso#outra', '#/como-funciona-progresso?x=1']) assert.equal(resolveRoute(hash, value).type, 'not-found');
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

test('aulas aceitam campos de autoria e rejeitam valores inválidos', () => {
  const value = fixture();
  const lesson = value.courses[0].modules[0].lessons[0];
  lesson.author = 'Canal de Teste';
  lesson.authorUrl = 'https://www.youtube.com/@CanalTeste';
  lesson.creatorId = 'ronnaldhawk';
  assert.equal(validateCatalog(value), value);

  // Author inválido
  assert.throws(() => validateCatalog({ ...value, courses: [{ ...value.courses[0], modules: [{ ...value.courses[0].modules[0], lessons: [{ ...lesson, author: '' }] }] }] }));
  assert.throws(() => validateCatalog({ ...value, courses: [{ ...value.courses[0], modules: [{ ...value.courses[0].modules[0], lessons: [{ ...lesson, author: 'a'.repeat(161) }] }] }] }));

  // AuthorUrl inválido
  assert.throws(() => validateCatalog({ ...value, courses: [{ ...value.courses[0], modules: [{ ...value.courses[0].modules[0], lessons: [{ ...lesson, authorUrl: 'https://evil.com/@teste' }] }] }] }));
  assert.throws(() => validateCatalog({ ...value, courses: [{ ...value.courses[0], modules: [{ ...value.courses[0].modules[0], lessons: [{ ...lesson, authorUrl: 'https://www.youtube.com/watch?v=123' }] }] }] }));

  // CreatorId inválido
  assert.throws(() => validateCatalog({ ...value, courses: [{ ...value.courses[0], modules: [{ ...value.courses[0].modules[0], lessons: [{ ...lesson, creatorId: 'INVALID_ID!' }] }] }] }));
});

test('lessonAuthor resolve autoria explícita, por criador, por material ou fallback', () => {
  const cat = {
    creators: [{ id: 'test-creator', title: 'Criador Indicado', channelUrl: 'https://www.youtube.com/@indicado' }]
  };
  
  // Explícito
  assert.deepEqual(lessonAuthor({ author: 'Autor Direto', authorUrl: 'https://www.youtube.com/@direto' }, cat), { name: 'Autor Direto', url: 'https://www.youtube.com/@direto' });
  
  // Por creatorId
  assert.deepEqual(lessonAuthor({ creatorId: 'test-creator' }, cat), { name: 'Criador Indicado', url: 'https://www.youtube.com/@indicado' });
  
  // Por materials (legado)
  assert.deepEqual(lessonAuthor({ materials: [{ title: 'Canal original — Canal Legado', url: 'https://www.youtube.com/@legado' }] }, cat), { name: 'Canal Legado', url: 'https://www.youtube.com/@legado' });
  
  // Por description (legado)
  assert.deepEqual(lessonAuthor({ description: 'Autoria: Nome na Descrição. Aula externa.' }, cat), { name: 'Nome na Descrição', url: null });
  
  // Fallback padrão
  assert.deepEqual(lessonAuthor({}, cat), { name: 'IAFLIX', url: null });
  assert.deepEqual(lessonAuthor(null, cat), { name: 'IAFLIX', url: null });
});

test('catálogo publicado atende meta de >= 10 aulas por assunto em foco, sem vídeos duplicados e com autoria vinculada', async () => {
  const { readFileSync } = await import('node:fs');
  const catalog = validateCatalog(JSON.parse(readFileSync(new URL('../public/data/catalog.json', import.meta.url), 'utf8')));
  const creatorIds = new Set(catalog.creators.map(c => c.id));
  const seenVideoIds = new Set();

  for (const course of catalog.courses) {
    for (const mod of course.modules) {
      for (const lesson of mod.lessons) {
        const vid = youtubeId(lesson.youtubeUrl);
        assert.equal(seenVideoIds.has(vid), false, `Vídeo duplicado no catálogo: ${vid} (${lesson.id})`);
        seenVideoIds.add(vid);
        assert.ok(lesson.author && lesson.author.trim().length > 0, `Aula sem author: ${lesson.id}`);
        assert.ok(lesson.authorUrl, `Aula sem authorUrl: ${lesson.id}`);
      }
    }
  }

  for (const courseId of ['harness', 'gerencia-contexto', 'memoria-ia', 'agentes-ia']) {
    const course = catalog.courses.find(c => c.id === courseId);
    assert.ok(course, `Curso ausente: ${courseId}`);
    const lessons = course.modules.flatMap(m => m.lessons);
    assert.ok(lessons.length >= 10, `Curso ${courseId} possui apenas ${lessons.length} aulas (mínimo 10)`);
    for (const lesson of lessons) {
      assert.ok(creatorIds.has(lesson.creatorId), `Aula ${lesson.id} com creatorId fora de creators: ${lesson.creatorId}`);
    }
  }
});


