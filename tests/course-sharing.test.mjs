import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { once } from 'node:events';
import { generateCoursePages, renderCoursePage } from '../scripts/generate-course-pages.mjs';
import { courseShareUrl, whatsappUrl } from '../public/assets/js/share.js';
import { createServer } from '../scripts/dev-server.mjs';

const catalog = JSON.parse(await readFile(new URL('../public/data/catalog.json', import.meta.url), 'utf8'));

test('links de curso e WhatsApp usam URLs absolutas sem hash', () => {
  assert.equal(courseShareUrl('gerencia-contexto'), 'https://iaflix.vercel.app/cursos/gerencia-contexto/');
  const url = new URL(whatsappUrl({ id: 'harness', title: 'Harness & contexto' }));
  assert.equal(url.origin, 'https://wa.me');
  assert.equal(url.searchParams.get('text'), 'Harness & contexto — IAFLIX\nhttps://iaflix.vercel.app/cursos/harness/');
  for (const id of ['../admin', '<script>', 'bad/id', '']) assert.throws(() => courseShareUrl(id));
});

test('build gera HTML público e metadados completos para os sete cursos', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'aiflix-sharing-'));
  try {
    assert.equal(await generateCoursePages(catalog, directory), 7);
    for (const course of catalog.courses) {
      const html = await readFile(join(directory, course.id, 'index.html'), 'utf8');
      assert.ok(html.includes(`<meta property="og:url" content="${courseShareUrl(course.id)}">`));
      assert.ok(html.includes(`https://iaflix.vercel.app/assets/images/social/course-${course.id}-v1.jpg`));
      for (const field of ['og:title', 'og:description', 'og:image', 'og:image:type', 'og:image:width', 'og:image:height', 'og:image:alt']) assert.ok(html.includes(`property="${field}"`));
      assert.ok(html.includes('content="1200"'));
      assert.ok(html.includes('content="630"'));
      assert.ok(html.includes('name="twitter:card" content="summary_large_image"'));
      assert.ok(html.includes(`href="/#/curso/${course.id}"`));
      assert.ok(!/<script|http-equiv="refresh"/i.test(html));
      if (course.status === 'preparing') {
        assert.ok(html.includes('Este curso ainda não possui aulas disponíveis.'));
        assert.ok(!html.includes('/aula/'));
      } else {
        assert.ok(html.includes('/aula/'));
      }
    }
    const preparingHtml = renderCoursePage({ id: 'em-preparacao', title: 'Curso futuro', description: 'Aguardando curadoria', status: 'preparing', modules: [] });
    assert.ok(preparingHtml.includes('Este curso ainda não possui aulas disponíveis.'));
    assert.ok(!preparingHtml.includes('/aula/'));
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test('HTML estático escapa conteúdo editorial e rejeita IDs fora do contrato', async () => {
  const course = structuredClone(catalog.courses[0]);
  course.title = '"><script>alert(1)</script>';
  course.description = '<img src=x onerror="alert(1)"> & texto';
  course.modules[0].title = '<svg onload=alert(1)>';
  course.modules[0].lessons[0].title = '<iframe src="javascript:alert(1)">';
  const html = renderCoursePage(course);
  assert.ok(html.includes('&lt;script&gt;'));
  assert.ok(html.includes('&lt;img src=x onerror=&quot;alert(1)&quot;&gt; &amp; texto'));
  assert.ok(!/<script|<svg|<iframe|<img src=x/.test(html));
  assert.throws(() => renderCoursePage({ ...course, id: '../escape' }));
});

test('servidor local serve páginas por curso sem JavaScript com MIME HTML', async () => {
  const server = createServer();
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  try {
    const base = `http://127.0.0.1:${server.address().port}`;
    const response = await fetch(`${base}/cursos/harness/`);
    assert.equal(response.status, 200);
    assert.match(response.headers.get('content-type'), /^text\/html/);
    assert.ok((await response.text()).includes('og:title'));
  } finally {
    await new Promise(resolve => server.close(resolve));
  }
});

test('todos os cursos preservam capa original do catálogo em PNG de 1200 por 630', async () => {
  for (const course of catalog.courses) {
    const png = await readFile(new URL(`../public/assets/images/course-${course.id}.png`, import.meta.url));
    assert.equal(png.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
    assert.equal(png.readUInt32BE(16), 1200);
    assert.equal(png.readUInt32BE(20), 630);
    assert.equal(course.cover, `assets/images/course-${course.id}.png`);
  }
});

test('marca pública IAFLIX aparece no HTML, logo, catálogo e compartilhamento', async () => {
  const index = await readFile(new URL('../public/index.html', import.meta.url), 'utf8');
  const logo = await readFile(new URL('../public/assets/images/logo-iaflix.svg', import.meta.url), 'utf8');
  assert.ok(index.includes('IAFLIX — Aprenda inteligência artificial'));
  assert.ok(index.includes('aria-label="IAFLIX, início"'));
  assert.ok(logo.includes('>IAFLIX</text>'));
  assert.ok(renderCoursePage(catalog.courses[0]).includes('content="IAFLIX"'));
  assert.ok(catalog.courses.every(course => !/\baiflix\b/i.test(course.description)));
  assert.ok(new URL(whatsappUrl(catalog.courses[0])).searchParams.get('text').includes('— IAFLIX\n'));
});
