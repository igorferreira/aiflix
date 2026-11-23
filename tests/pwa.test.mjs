import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { renderCoursePage } from '../scripts/generate-course-pages.mjs';
import { createServer } from '../scripts/dev-server.mjs';

const root = new URL('../public/', import.meta.url);
test('manifest único e ícones de instalação válidos na home e cursos', async () => {
  const manifest = JSON.parse(await readFile(new URL('manifest.webmanifest', root)));
  assert.equal(manifest.name, 'IAFLIX');
  assert.equal(manifest.id, './');
  assert.equal(manifest.start_url, './');
  assert.equal(manifest.scope, './');
  assert.equal(manifest.display, 'standalone');
  for (const size of [192, 512, 180]) {
    const src = 'assets/images/icon-' + size + '.png';
    const png = await readFile(new URL(src, root));
    assert.equal(png.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
    assert.equal(png.readUInt32BE(16), size);
    assert.equal(png.readUInt32BE(20), size);
    if (size !== 180) assert.ok(manifest.icons.some(icon => icon.src === src && icon.sizes === size + 'x' + size));
  }
  const catalog = JSON.parse(await readFile(new URL('data/catalog.json', root)));
  for (const [index, html] of [await readFile(new URL('index.html', root), 'utf8'), ...catalog.courses.map(renderCoursePage)].entries()) {
    const base = new URL(index ? 'cursos/exemplo/' : '', 'https://iaflix.vercel.app/');
    const href = html.match(/rel="manifest" href="([^"]+)"/)[1];
    assert.equal(new URL(href, base).href, 'https://iaflix.vercel.app/manifest.webmanifest');
    assert.match(html, /rel="apple-touch-icon"/);
  }
});
test('manifest servido com MIME próprio', async () => {
  const server = createServer();
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  try {
    const response = await fetch('http://127.0.0.1:' + server.address().port + '/manifest.webmanifest');
    assert.equal(response.status, 200);
    assert.equal(response.headers.get('content-type'), 'application/manifest+json');
    assert.equal((await response.json()).name, 'IAFLIX');
  } finally { await new Promise(resolve => server.close(resolve)); }
});
