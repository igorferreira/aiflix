import { publicCatalog } from '../lib/editorial.js';
import { failure, methods, reply } from '../lib/http.js';
export default async function handler(req, res) {
  if (!methods(req, res, ['GET'])) return;
  try { reply(res, 200, await publicCatalog()); } catch (error) { failure(res, error); }
}
