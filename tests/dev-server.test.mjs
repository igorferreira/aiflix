import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from '../scripts/dev-server.mjs';

test('servidor serve somente public e recusa métodos de escrita em arquivos', async () => {
  const server = createServer();
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  try {
    const base = `http://127.0.0.1:${server.address().port}`;
    assert.equal((await fetch(`${base}/`)).status, 200);
    assert.equal((await fetch(`${base}/PRD.md`)).status, 404);
    assert.equal((await fetch(`${base}/styles.css`, { method: 'POST' })).status, 405);
  } finally {
    await new Promise(resolve => server.close(resolve));
  }
});
