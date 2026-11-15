import { readFile, writeFile } from 'node:fs/promises';
import { validateCatalog } from '../public/assets/js/catalog.js';
const [catalogFile, outputFile] = process.argv.slice(2);
if (!catalogFile || !outputFile) throw new Error('Uso: node scripts/seed-editorial-state.mjs <catalog.json> <arquivo-privado.json>');
const catalog = validateCatalog(JSON.parse(await readFile(catalogFile, 'utf8')));
const paths = catalog.learnPaths.map(path => ({ ...path, status: 'published', revision: 1 }));
await writeFile(outputFile, `${JSON.stringify({ schemaVersion: 1, paths, publishedCatalog: catalog, audit: [] }, null, 2)}\n`, { flag: 'wx', mode: 0o600 });
