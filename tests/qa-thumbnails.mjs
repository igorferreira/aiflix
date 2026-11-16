import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createServer } from '../scripts/dev-server.mjs';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const catalog = JSON.parse(await readFile(new URL('../public/data/catalog.json', import.meta.url), 'utf8'));
const server = createServer();
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const browser = await chromium.launch({ headless: true });
try {
  for (const width of [390, 1440]) {
    const page = await browser.newPage({ viewport: { width, height: 844 } });
    await page.route('**/data/catalog.json', route => route.fulfill({ json: catalog }));
    await page.goto('http://127.0.0.1:' + server.address().port);
    const images = page.getByRole('region', { name: 'Cursos: Todos os cursos', exact: true }).locator('img');
    await images.first().waitFor({ state: 'attached' });
    await page.waitForFunction(expected => {
      const region = [...document.querySelectorAll('[role="region"]')].find(node => node.getAttribute('aria-label') === 'Cursos: Todos os cursos');
      const images = region ? [...region.querySelectorAll('img')] : [];
      return images.length === expected && images.every(image => image.complete && image.naturalWidth > 0);
    }, catalog.courses.length);
    const state = await images.evaluateAll(nodes => nodes.map(image => ({ loading: image.loading, width: image.naturalWidth, height: image.naturalHeight })));
    assert.equal(state.length, 7);
    assert.ok(state.every(image => image.loading === 'eager' && image.width === 1200 && image.height === 630));
    assert.equal(await page.evaluate(() => scrollY), 0);
    console.log(width + 'px: sete capas carregadas antes de rolar, sem imagens ausentes.');
    await page.close();
  }
} finally {
  await browser.close();
  await new Promise(resolve => server.close(resolve));
}
