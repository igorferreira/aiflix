import { randomBytes, scrypt as scryptCallback } from 'node:crypto';
import { promisify } from 'node:util';
const chunks = [];
let size = 0;
for await (const chunk of process.stdin) {
  size += chunk.length;
  if (size > 4096) throw new Error('Entrada excede limite.');
  chunks.push(chunk);
}
const password = Buffer.concat(chunks).toString('utf8').replace(/\r?\n$/, '');
if (password.length < 32 || password.length > 1024) throw new Error('Use senha aleatória de pelo menos 32 caracteres.');
const salt = randomBytes(16);
const hash = await promisify(scryptCallback)(password, salt, 64, { N: 16384, r: 8, p: 1 });
process.stdout.write(`scrypt$${salt.toString('hex')}$${hash.toString('hex')}\n`);
