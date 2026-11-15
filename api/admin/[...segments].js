import { authConfig, authorize, checkOrigin } from '../../lib/auth.js';
import { body, exactObject, failure, HttpError, methods, reply } from '../../lib/http.js';
import { readState, validatePath, writeState } from '../../lib/editorial.js';
import { isId } from '../../public/assets/js/catalog.js';
export default async function handler(req, res) {
  try {
    const config = authConfig();
    authorize(req, config);
    if (req.method !== 'GET') checkOrigin(req, config);
    const url = new URL(req.url, config.origin);
    const route = /^\/api\/admin\/learn-paths(?:\/([a-z0-9-]+)(\/publish)?)?$/.exec(url.pathname);
    if (!route || (route[1] && !isId(route[1]))) throw new HttpError(404, 'NOT_FOUND', 'Caminho não encontrado.');
    const [, id, publish] = route;
    if (!methods(req, res, !id ? ['GET', 'POST'] : publish ? ['POST'] : ['PUT'])) return;
    const record = await readState();
    if (req.method === 'GET') { reply(res, 200, { paths: record.state.paths, catalog: record.state.publishedCatalog }); return; }
    const input = await body(req);
    let path;
    if (!id) {
      exactObject(input, ['id', 'title', 'description', 'courseIds']);
      validatePath(input, record.state.publishedCatalog);
      if (record.state.paths.some(item => item.id === input.id) || record.state.publishedCatalog.learnPaths.some(item => item.id === input.id)) throw new HttpError(409, 'DUPLICATE_ID', 'ID já existe.');
      path = { ...input, status: 'draft', revision: 1 };
      record.state.paths.push(path);
    } else {
      exactObject(input, publish ? ['expectedRevision'] : ['title', 'description', 'courseIds', 'expectedRevision']);
      if (!Number.isSafeInteger(input.expectedRevision) || input.expectedRevision < 1) throw new HttpError(422, 'INVALID_REVISION', 'Revisão inválida.');
      path = record.state.paths.find(item => item.id === id);
      if (!path) throw new HttpError(404, 'NOT_FOUND', 'Caminho não encontrado.');
      if (path.revision !== input.expectedRevision) throw new HttpError(409, 'REVISION_CONFLICT', 'Caminho alterado. Recarregue antes de tentar novamente.');
      if (publish) {
        if (!path.courseIds.length) throw new HttpError(422, 'EMPTY_PATH', 'Selecione ao menos um curso para publicar.');
        path.status = 'published'; path.revision++;
        const snapshot = { id: path.id, title: path.title, description: path.description, courseIds: [...path.courseIds] };
        const index = record.state.publishedCatalog.learnPaths.findIndex(item => item.id === id);
        if (index < 0) record.state.publishedCatalog.learnPaths.push(snapshot);
        else record.state.publishedCatalog.learnPaths[index] = snapshot;
        record.state.audit.push({ at: new Date().toISOString(), actor: 'admin', pathId: id, revision: path.revision, result: 'published' });
        record.state.audit = record.state.audit.slice(-100);
      } else {
        validatePath({ id, title: input.title, description: input.description, courseIds: input.courseIds }, record.state.publishedCatalog);
        Object.assign(path, { title: input.title, description: input.description, courseIds: input.courseIds, status: 'draft', revision: path.revision + 1 });
      }
    }
    await writeState(record);
    reply(res, !id ? 201 : 200, { path });
  } catch (error) { failure(res, error); }
}
