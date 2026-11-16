import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { renderCoursePage } from '../scripts/generate-course-pages.mjs';

const catalog = JSON.parse(await readFile(new URL('../public/data/catalog.json', import.meta.url), 'utf8'));

test('home e cursos entregam metadados no HTML e imagem social abaixo de 600 KB', async () => {
  const pages = [await readFile(new URL('../public/index.html', import.meta.url), 'utf8'), ...catalog.courses.map(renderCoursePage)];
  const imageUrls = new Set();
  for (const html of pages) {
    const head = html.slice(0, html.indexOf('</head>'));
    assert.ok(Buffer.byteLength(head) < 300000);
    for (const name of ['title', 'description', 'url', 'image']) {
      const match = head.match(new RegExp('<meta property="og:' + name + '" content="([^"]+)"'));
      assert.ok(match?.[1], 'Metadado obrigatório: ' + name);
      if (name === 'image') imageUrls.add(match[1]);
    }
    assert.ok(head.includes('property="og:image:type" content="image/jpeg"'));
    assert.ok(head.includes('property="og:image:width" content="1200"'));
    assert.ok(head.includes('property="og:image:height" content="630"'));
  }
  assert.equal(imageUrls.size, catalog.courses.length + 1);
  for (const imageUrl of imageUrls) {
    const url = new URL(imageUrl);
    assert.equal(url.origin, 'https://iaflix.vercel.app');
    assert.match(url.pathname, /^\/assets\/images\/social\/[a-z0-9-]+-v1\.jpg$/);
    const image = await readFile(new URL('../public' + url.pathname, import.meta.url));
    assert.equal(image.subarray(0, 3).toString('hex'), 'ffd8ff');
    assert.ok(image.length < 600000, 'Imagem acima do limite do WhatsApp: ' + imageUrl);
  }
});
