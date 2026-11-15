import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(fileURLToPath(new URL('../public/', import.meta.url)));
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml' };

export function createServer() {
  return http.createServer(async (req, res) => {
    try {
      const url = new URL(req.url, 'http://localhost');
      let module;
      if (url.pathname === '/api/session') module = '../api/session.js';
      else if (url.pathname === '/api/catalog' || url.pathname === '/data/catalog.json') module = '../api/catalog.js';
      else if (url.pathname.startsWith('/api/admin/')) module = '../api/admin/[...segments].js';
      if (module) {
        const { default: handler } = await import(module);
        await handler(req, res);
        return;
      }
      if (req.method !== 'GET' && req.method !== 'HEAD') {
        res.writeHead(405).end();
        return;
      }
      const name = decodeURIComponent(url.pathname.endsWith('/') ? `${url.pathname}index.html` : url.pathname);
      const target = path.resolve(root, `.${name}`);
      if (!target.startsWith(`${root}${path.sep}`)) {
        res.writeHead(404).end();
        return;
      }
      const data = await readFile(target);
      res.writeHead(200, { 'Content-Type': types[path.extname(target)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
      res.end(req.method === 'HEAD' ? undefined : data);
    } catch (error) {
      const status = error.code === 'ENOENT' || error.code === 'EISDIR' ? 404 : 500;
      res.writeHead(status, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end(status === 404 ? 'Não encontrado' : 'Serviço indisponível');
    }
  });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const port = Number(process.env.PORT || 3000);
  createServer().listen(port, '127.0.0.1', () => {
    process.stdout.write(`IAFLIX local: http://127.0.0.1:${port}\n`);
  });
}
