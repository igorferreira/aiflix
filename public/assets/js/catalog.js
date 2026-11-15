export const isId = value => typeof value === 'string' && value.length <= 80 && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
export function httpsUrl(value) {
  if (typeof value !== 'string' || value.length > 2048) throw new Error('URL inválida');
  const url = new URL(value);
  if (url.protocol !== 'https:' || url.username || url.password) throw new Error('URL HTTPS sem credenciais exigida');
  return url;
}
export function youtubeId(value) {
  const url = httpsUrl(value);
  let id;
  if (['youtube.com', 'www.youtube.com'].includes(url.hostname) && url.pathname === '/watch') id = url.searchParams.get('v');
  if (url.hostname === 'youtu.be' && /^\/[A-Za-z0-9_-]{11}$/.test(url.pathname)) id = url.pathname.slice(1);
  if (!id || !/^[A-Za-z0-9_-]{11}$/.test(id) || url.port) throw new Error('Vídeo YouTube inválido');
  return id;
}
export function validateCatalog(value) {
  const fail = (path, message) => { throw new Error(`${path}: ${message}`); };
  function object(item, path, required, optional = []) {
    if (!item || typeof item !== 'object' || Array.isArray(item)) fail(path, 'objeto exigido');
    for (const key of required) if (!Object.hasOwn(item, key)) fail(`${path}.${key}`, 'campo obrigatório');
    for (const key of Object.keys(item)) if (![...required, ...optional].includes(key)) fail(`${path}.${key}`, 'campo desconhecido');
  }
  function text(item, path, max, empty = false) {
    if (typeof item !== 'string' || item.length > max || (!empty && !item.trim())) fail(path, 'texto inválido');
  }
  function array(item, path, nonempty = false) {
    if (!Array.isArray(item) || (nonempty && !item.length)) fail(path, 'lista inválida');
  }
  const seen = { course: new Set(), module: new Set(), lesson: new Set(), track: new Set(), path: new Set() };
  function identity(item, path, type) {
    if (!isId(item.id) || seen[type].has(item.id)) fail(`${path}.id`, 'ID inválido ou duplicado');
    seen[type].add(item.id); text(item.title, `${path}.title`, 160);
  }
  object(value, 'catalog', ['schemaVersion', 'courses', 'tracks', 'learnPaths']);
  if (value.schemaVersion !== 2) fail('schemaVersion', 'versão não suportada');
  for (const key of ['courses', 'tracks', 'learnPaths']) array(value[key], key);
  value.courses.forEach((course, i) => {
    const p = `courses[${i}]`;
    object(course, p, ['id', 'title', 'description', 'modules'], ['cover', 'status']); identity(course, p, 'course'); text(course.description, `${p}.description`, 4000, true);
    if (course.cover !== undefined && (typeof course.cover !== 'string' || !/^assets\/images\/[a-zA-Z0-9_/-]+\.(?:png|jpe?g|webp|avif|svg)$/.test(course.cover) || course.cover.includes('..'))) fail(`${p}.cover`, 'capa inválida');
    if (course.status !== undefined && course.status !== 'preparing') fail(`${p}.status`, 'estado inválido');
    array(course.modules, `${p}.modules`, course.status !== 'preparing');
    if (course.status === 'preparing' && course.modules.length) fail(`${p}.modules`, 'curso em preparação não contém aulas publicadas');
    course.modules.forEach((module, j) => {
      const mp = `${p}.modules[${j}]`; object(module, mp, ['id', 'title', 'lessons']); identity(module, mp, 'module'); array(module.lessons, `${mp}.lessons`, true);
      module.lessons.forEach((lesson, k) => {
        const lp = `${mp}.lessons[${k}]`; object(lesson, lp, ['id', 'title', 'description', 'durationSeconds', 'youtubeUrl', 'materials']); identity(lesson, lp, 'lesson'); text(lesson.description, `${lp}.description`, 4000, true);
        if (!Number.isSafeInteger(lesson.durationSeconds) || lesson.durationSeconds <= 0) fail(`${lp}.durationSeconds`, 'duração inválida');
        try { youtubeId(lesson.youtubeUrl); } catch { fail(`${lp}.youtubeUrl`, 'URL YouTube inválida'); }
        array(lesson.materials, `${lp}.materials`);
        lesson.materials.forEach((material, n) => {
          const mat = `${lp}.materials[${n}]`; object(material, mat, ['title', 'url']); text(material.title, `${mat}.title`, 160);
          try { httpsUrl(material.url); } catch { fail(`${mat}.url`, 'URL inválida'); }
        });
      });
    });
  });
  for (const [key, type] of [['tracks', 'track'], ['learnPaths', 'path']]) value[key].forEach((group, i) => {
    const p = `${key}[${i}]`; object(group, p, ['id', 'title', 'description', 'courseIds']); identity(group, p, type); text(group.description, `${p}.description`, 4000, true); array(group.courseIds, `${p}.courseIds`, key === 'learnPaths');
    if (new Set(group.courseIds).size !== group.courseIds.length || group.courseIds.some(id => !seen.course.has(id))) fail(`${p}.courseIds`, 'referência inválida ou duplicada');
  });
  return value;
}
export function resolveRoute(hash, catalog) {
  const route = hash || '#/';
  if (route === '#/') return { type: 'home' };
  if (route === '#/admin') return { type: 'admin' };
  const admin = /^#\/admin\/caminho\/([a-z0-9-]+)$/.exec(route);
  if (admin && isId(admin[1])) return { type: 'admin', id: admin[1] };
  const path = /^#\/caminho\/([a-z0-9-]+)$/.exec(route);
  if (path && isId(path[1])) {
    const entry = catalog.learnPaths.find(p => p.id === path[1]);
    if (entry) return { type: 'path', path: entry };
  }
  const match = /^#\/curso\/([a-z0-9-]+)(?:\/aula\/([a-z0-9-]+))?$/.exec(route);
  if (match && isId(match[1]) && (!match[2] || isId(match[2]))) {
    const course = catalog.courses.find(c => c.id === match[1]);
    if (course && !match[2]) return { type: 'course', course };
    const lesson = course?.modules.flatMap(m => m.lessons).find(l => l.id === match[2]);
    if (lesson) return { type: 'lesson', course, lesson };
  }
  return { type: 'not-found' };
}
