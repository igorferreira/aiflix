import { validateCatalog, youtubeId, resolveRoute, isId } from './catalog.js';
import { createProgress } from './progress.js';
const main = document.querySelector('main');
const announcements = document.querySelector('#announcements');
let catalog = { schemaVersion: 2, courses: [], tracks: [], learnPaths: [] };
let routeVersion = 0;
let storage;
try { storage = window.localStorage; } catch { storage = { getItem() { throw new Error(); }, setItem() { throw new Error(); } }; }
const progress = createProgress(storage);
function el(tag, text, className) {
  const node = document.createElement(tag);
  if (text !== undefined) node.textContent = text;
  if (className) node.className = className;
  return node;
}
function link(text, href) { const node = el('a', text); node.href = href; return node; }
function button(text, action) { const node = el('button', text); node.type = 'button'; node.addEventListener('click', action); return node; }
function announce(text) { announcements.textContent = ''; requestAnimationFrame(() => { announcements.textContent = text; }); }
function heading(text) { const title = el('h1', text); title.tabIndex = -1; document.title = `${text} — aiflix`; main.append(title); return title; }
function duration(seconds) { return `${Math.ceil(seconds / 60)} min`; }
function lessons(course) { return course.modules.flatMap(module => module.lessons); }
function statsText(course) { const s = progress.stats(course); return `${s.completed} de ${s.total} aulas concluídas · ${s.percent}%`; }
function artwork(course) {
  const art = el('div', undefined, 'course-art');
  art.setAttribute('aria-hidden', 'true');
  art.append(el('span', course.title, 'art-title'), el('span', lessons(course)[0].title, 'art-lesson'));
  return art;
}
function card(course) {
  const article = el('article', undefined, 'course-card');
  const visual = link('', `#/curso/${course.id}`); visual.className = 'course-visual'; visual.setAttribute('aria-label', `Ver curso: ${course.title}`);
  if (course.cover) {
    const img = el('img'); img.src = course.cover; img.alt = ''; img.loading = 'lazy'; img.className = 'cover'; img.addEventListener('error', () => visual.replaceChildren(artwork(course)), { once: true }); visual.append(img);
  } else visual.append(artwork(course));
  article.append(visual);
  const title = el('h3'); title.append(link(course.title, `#/curso/${course.id}`));
  const list = lessons(course);
  article.append(title, el('p', course.description), el('p', `${list.length} aulas · ${duration(list.reduce((sum, lesson) => sum + lesson.durationSeconds, 0))}`, 'meta'), el('p', statsText(course), 'meta'));
  return article;
}
function group(title, description, courses, carousel = false) {
  const section = el('section'); const header = el('div', undefined, 'section-head'); header.append(el('h2', title)); section.append(header);
  if (description) section.append(el('p', description));
  if (!courses.length) { section.append(el('p', 'Conteúdo em preparação.', 'empty')); return section; }
  const list = el('div', undefined, carousel ? 'carousel' : 'course-grid');
  if (carousel) {
    list.tabIndex = 0; list.setAttribute('role', 'region'); list.setAttribute('aria-label', `Cursos: ${title}`);
    const actions = el('div', undefined, 'actions');
    for (const [label, direction] of [['Anterior', -1], ['Próximo', 1]]) {
      const control = button(label, () => list.scrollBy({ left: direction * list.clientWidth * .8, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' }));
      control.setAttribute('aria-label', `${label}: ${title}`); actions.append(control);
    }
    header.append(actions);
  }
  courses.forEach(course => list.append(card(course))); section.append(list); return section;
}
function home() {
  heading('O que você quer aprender?');
  main.append(el('p', 'Escolha um curso ou siga um caminho de aprendizagem. Todo conteúdo é gratuito e pode ser acessado na ordem que você preferir.'));
  if (!catalog.courses.length) main.append(el('p', 'Estamos preparando os primeiros cursos. Nenhuma aula está publicada neste catálogo ainda.', 'notice'));
  else {
    const course = catalog.courses[0]; const firstLesson = lessons(course)[0];
    const feature = el('section', undefined, 'featured-course'); const copy = el('div', undefined, 'featured-copy');
    copy.append(el('h2', course.title), el('p', course.description));
    const actions = el('div', undefined, 'actions'); const watch = link('Assistir agora', `#/curso/${course.id}/aula/${firstLesson.id}`); watch.className = 'button primary';
    const details = link('Ver curso', `#/curso/${course.id}`); details.className = 'button secondary'; actions.append(watch, details);
    copy.append(el('p', `${lessons(course).length} aulas · ${duration(lessons(course).reduce((sum, lesson) => sum + lesson.durationSeconds, 0))} · Acesso gratuito`, 'meta'), actions);
    const visual = el('div', undefined, 'featured-visual');
    if (course.cover) {
      const img = el('img'); img.src = course.cover; img.alt = ''; img.className = 'featured-image'; img.addEventListener('error', () => visual.replaceChildren(artwork(course)), { once: true }); visual.append(img);
    } else visual.append(artwork(course));
    feature.append(copy, visual); main.append(feature, group('Todos os cursos', 'Acesso direto, sem matrícula ou pré-requisitos.', catalog.courses, true));
  }
  if (catalog.learnPaths.length) {
    const section = el('section'); section.append(el('h2', 'Caminhos de aprendizagem'));
    for (const path of catalog.learnPaths) { const article = el('article', undefined, 'course-card'); const title = el('h3'); title.append(link(path.title, `#/caminho/${path.id}`)); article.append(title, el('p', path.description), el('p', `${path.courseIds.length} cursos · sequência recomendada`, 'meta')); section.append(article); }
    main.append(section);
  }
  catalog.tracks.forEach(track => main.append(group(track.title, track.description, track.courseIds.map(id => catalog.courses.find(course => course.id === id)), true)));
}
function courseView(course, lesson) {
  main.append(link('Todos os cursos', '#/')); heading(course.title); main.append(el('p', course.description));
  const status = el('p', statsText(course), 'meta'); const meter = el('progress'); meter.max = 100; meter.value = progress.stats(course).percent; meter.setAttribute('aria-label', 'Conclusão do curso'); main.append(status, meter);
  const layout = el('div', undefined, 'course-layout'); const content = el('section'); const sidebar = el('aside'); sidebar.setAttribute('aria-label', 'Módulos e aulas');
  if (lesson) {
    content.append(el('h2', lesson.title), el('p', `${duration(lesson.durationSeconds)} · Reprodução pelo YouTube`, 'meta'));
    const iframe = el('iframe'); iframe.className = 'player'; iframe.src = `https://www.youtube.com/embed/${youtubeId(lesson.youtubeUrl)}`; iframe.title = `Aula: ${lesson.title}`; iframe.allow = 'accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen'; iframe.allowFullscreen = true; iframe.referrerPolicy = 'strict-origin-when-cross-origin'; content.append(iframe);
    const external = link('Abrir no YouTube (nova aba)', `https://www.youtube.com/watch?v=${youtubeId(lesson.youtubeUrl)}`); external.target = '_blank'; external.rel = 'noopener noreferrer'; content.append(el('p', lesson.description), external);
    const warning = el('p', progress.warning, 'notice'); warning.hidden = !progress.warning;
    const toggle = button('', () => {
      const replaceCorrupt = progress.corrupt && window.confirm('O progresso anterior não pode ser lido. Deseja substituí-lo por um novo registro?');
      if (!progress.toggle(lesson.id, { replaceCorrupt })) return;
      updateToggle(); status.textContent = statsText(course); meter.value = progress.stats(course).percent; warning.textContent = progress.warning; warning.hidden = !progress.warning; renderModules(); announce(progress.completed.has(lesson.id) ? 'Aula marcada como concluída.' : 'Conclusão da aula desmarcada.');
    });
    const updateToggle = () => { toggle.textContent = progress.completed.has(lesson.id) ? 'Marcar como não concluída' : 'Marcar como concluída'; toggle.setAttribute('aria-pressed', String(progress.completed.has(lesson.id))); };
    updateToggle(); const actions = el('div', undefined, 'actions'); actions.append(toggle); content.append(actions, warning);
    if (lesson.materials.length) { content.append(el('h3', 'Materiais complementares')); const list = el('ul'); lesson.materials.forEach(material => { const item = el('li'); const a = link(`${material.title} (nova aba)`, material.url); a.target = '_blank'; a.rel = 'noopener noreferrer'; item.append(a); list.append(item); }); content.append(list); }
    content.append(el('p', 'Conclusão manual salva neste navegador. A reprodução não marca a aula automaticamente.', 'meta'));
  } else { content.append(el('h2', 'Comece por uma aula'), el('p', 'Selecione uma aula na lista. Você pode assistir em qualquer ordem.')); }
  function renderModules() {
    sidebar.replaceChildren(el('h2', 'Aulas do curso'));
    course.modules.forEach(module => {
      sidebar.append(el('h3', module.title)); const list = el('ol', undefined, 'lesson-list');
      module.lessons.forEach(item => { const li = el('li'); const a = link(item.title, `#/curso/${course.id}/aula/${item.id}`); if (item.id === lesson?.id) a.setAttribute('aria-current', 'page'); li.append(a, el('div', `${duration(item.durationSeconds)}${progress.completed.has(item.id) ? ' · Concluída' : ''}`, 'meta')); list.append(li); }); sidebar.append(list);
    });
  }
  renderModules(); layout.append(content, sidebar); main.append(layout);
}
async function api(path, options = {}) {
  let response;
  try { response = await fetch(path, { credentials: 'same-origin', cache: 'no-store', ...options, headers: { 'Content-Type': 'application/json', ...options.headers } }); } catch { throw new Error('Não foi possível conectar à administração. Tente novamente.'); }
  if (response.status === 204) return null;
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new Error(response.status === 409 ? 'Outra edição alterou este caminho. Suas alterações foram mantidas. Recarregue a versão atual antes de salvar novamente.' : data?.error?.message || 'Administração indisponível. Verifique a configuração do serviço.');
  if (!data) throw new Error('Resposta inválida do serviço administrativo.');
  return data;
}
function field(form, labelText, name, value, multiline = false) {
  const label = el('label', labelText); label.htmlFor = `field-${name}`; const input = el(multiline ? 'textarea' : 'input'); input.id = label.htmlFor; input.name = name; input.value = value; input.maxLength = multiline ? 4000 : 160; input.required = !multiline; form.append(label, input); return input;
}
async function admin(id, version) {
  const title = heading('Administração'); main.append(el('p', 'Organize caminhos com cursos existentes. Rascunhos são privados; publicar os torna visíveis para todos.'));
  const area = el('section'); main.append(area); area.append(el('p', 'Verificando acesso…'));
  try {
    const session = await api('/api/session'); if (version !== routeVersion) return;
    area.replaceChildren();
    if (!session.authenticated) {
      const form = el('form'); form.append(el('h2', 'Acesso restrito'));
      const password = field(form, 'Senha administrativa', 'password', ''); password.type = 'password'; password.autocomplete = 'current-password';
      const error = el('p', '', 'error'); error.setAttribute('role', 'alert'); const submit = el('button', 'Entrar'); submit.type = 'submit'; form.append(el('div', undefined, 'actions'), submit, error);
      form.addEventListener('submit', async event => { event.preventDefault(); submit.disabled = true; error.textContent = ''; try { await api('/api/session', { method: 'POST', body: JSON.stringify({ password: password.value }) }); password.value = ''; await render(); } catch (e) { password.value = ''; error.textContent = e.message; submit.disabled = false; password.focus(); } }); area.append(form); return;
    }
    const data = await api('/api/admin/learn-paths'); if (version !== routeVersion) return;
    validateCatalog(data.catalog);
    if (!Array.isArray(data.paths)) throw new Error('Lista administrativa inválida.');
    const actions = el('div', undefined, 'actions'); const logout = button('Sair', async () => { logout.disabled = true; try { await api('/api/session', { method: 'DELETE' }); await render(); } catch (e) { area.prepend(el('p', e.message, 'error')); logout.disabled = false; } }); actions.append(link('Todos os caminhos', '#/admin'), logout); area.append(actions);
    if (id) {
      const path = data.paths.find(item => item.id === id); if (!path) { area.append(el('p', 'Caminho não encontrado.', 'error')); return; }
      pathForm(area, data, path);
    } else {
      area.append(el('h2', 'Caminhos cadastrados'));
      if (!data.paths.length) area.append(el('p', 'Nenhum caminho cadastrado.', 'empty'));
      data.paths.forEach(path => { const row = el('article', undefined, 'course-card'); row.append(link(path.title, `#/admin/caminho/${path.id}`), el('p', `${path.status === 'published' ? 'Publicado' : 'Rascunho'} · revisão ${path.revision}`, 'meta')); area.append(row); });
      area.append(el('h2', 'Criar caminho')); pathForm(area, data, null);
    }
    title.focus();
  } catch (e) { if (version === routeVersion) { area.replaceChildren(el('p', e.message, 'error'), button('Tentar novamente', render)); } }
}
function pathForm(area, data, path) {
  const form = el('form'); const isNew = !path; let revision = path?.revision; let ordered = [...(path?.courseIds || [])];
  const id = field(form, 'Identificador (letras minúsculas, números e hífens)', 'id', path?.id || ''); id.maxLength = 80; id.pattern = '[a-z0-9]+(?:-[a-z0-9]+)*'; id.readOnly = !isNew;
  const title = field(form, 'Título', 'title', path?.title || ''); const description = field(form, 'Descrição', 'description', path?.description || '', true);
  const fieldset = el('fieldset'); fieldset.append(el('legend', 'Cursos e ordem recomendada')); const label = el('label', 'Curso para adicionar'); label.htmlFor = 'course-select'; const select = el('select'); select.id = 'course-select';
  data.catalog.courses.forEach(course => { const option = el('option', course.title); option.value = course.id; select.append(option); });
  const list = el('ol', undefined, 'ordered-courses'); const add = button('Adicionar curso', () => { if (select.value && !ordered.includes(select.value)) { ordered.push(select.value); drawOrder(); announce('Curso adicionado.'); } }); add.disabled = !data.catalog.courses.length;
  fieldset.append(label, select, add, list); form.append(fieldset);
  function drawOrder(focusIndex) {
    list.replaceChildren();
    ordered.forEach((courseId, index) => {
      const course = data.catalog.courses.find(item => item.id === courseId); const li = el('li', course?.title || courseId); const controls = el('div', undefined, 'actions');
      for (const [name, delta] of [['Subir', -1], ['Descer', 1]]) {
        const b = button(name, () => { [ordered[index], ordered[index + delta]] = [ordered[index + delta], ordered[index]]; drawOrder(index + delta); announce('Ordem atualizada.'); }); b.disabled = index + delta < 0 || index + delta >= ordered.length; b.setAttribute('aria-label', `${name}: ${course?.title || courseId}`); controls.append(b);
      }
      const remove = button('Remover', () => { ordered.splice(index, 1); drawOrder(Math.min(index, ordered.length - 1)); if (!ordered.length) add.focus(); announce('Curso removido.'); }); remove.setAttribute('aria-label', `Remover: ${course?.title || courseId}`); controls.append(remove); li.append(controls); list.append(li);
    });
    if (focusIndex !== undefined && focusIndex >= 0) { const controls = list.children[focusIndex]?.querySelectorAll('button'); [...(controls || [])].find(control => !control.disabled)?.focus(); }
  }
  drawOrder();
  const error = el('p', '', 'error'); error.setAttribute('role', 'alert'); const notice = el('p', '', 'notice'); notice.hidden = true;
  const save = el('button', 'Salvar rascunho'); save.type = 'submit'; const publish = button('Publicar caminho', () => mutate(true)); publish.disabled = isNew;
  const preview = el('section'); preview.hidden = true; const previewButton = button('Pré-visualizar', () => { preview.replaceChildren(el('h2', title.value || 'Pré-visualização'), el('p', description.value), el('p', 'Pré-visualização privada; suas alterações ainda não foram publicadas.', 'notice')); const items = el('ol'); ordered.forEach(courseId => items.append(el('li', data.catalog.courses.find(course => course.id === courseId)?.title || courseId))); preview.append(items); preview.hidden = false; });
  const actions = el('div', undefined, 'actions'); actions.append(save, previewButton, publish); form.append(error, notice, actions, preview);
  function busy(value) { form.querySelectorAll('button, input, textarea, select').forEach(control => { control.disabled = value; }); if (!value) { publish.disabled = isNew; add.disabled = !data.catalog.courses.length; drawOrder(); } }
  async function mutate(shouldPublish) {
    if (!form.reportValidity()) return;
    if (!isId(id.value)) { error.textContent = 'Identificador inválido.'; return; }
    if (shouldPublish && !ordered.length) { error.textContent = 'Adicione pelo menos um curso antes de publicar.'; return; }
    busy(true); error.textContent = ''; notice.hidden = true;
    try {
      const payload = { title: title.value.trim(), description: description.value.trim(), courseIds: ordered };
      const saved = await api(isNew ? '/api/admin/learn-paths' : `/api/admin/learn-paths/${path.id}`, { method: isNew ? 'POST' : 'PUT', body: JSON.stringify(isNew ? { id: id.value, ...payload } : { ...payload, expectedRevision: revision }) });
      revision = saved.path.revision;
      if (shouldPublish) {
        const published = await api(`/api/admin/learn-paths/${path.id}/publish`, { method: 'POST', body: JSON.stringify({ expectedRevision: revision }) }); revision = published.path.revision;
        const response = await fetch('data/catalog.json', { cache: 'no-store' }); if (!response.ok) throw new Error('Caminho publicado, mas não foi possível atualizar o catálogo nesta tela.'); catalog = validateCatalog(await response.json());
        notice.textContent = 'Caminho publicado. A versão pública já pode ser consultada.';
      } else notice.textContent = `Rascunho salvo · revisão ${revision}.`;
      notice.hidden = false; announce(notice.textContent);
      if (isNew) location.hash = `#/admin/caminho/${saved.path.id}`;
    } catch (e) { error.textContent = e.message; } finally { busy(false); if (!isNew) save.focus(); }
  }
  form.addEventListener('submit', event => { event.preventDefault(); mutate(false); }); area.append(form);
}
async function render() {
  const version = ++routeVersion; main.replaceChildren();
  const route = resolveRoute(location.hash, catalog);
  if (route.type === 'admin') { await admin(route.id, version); return; }
  if (route.type === 'home') home();
  else if (route.type === 'course' || route.type === 'lesson') courseView(route.course, route.lesson);
  else if (route.type === 'path') { main.append(link('Todos os cursos', '#/')); heading(route.path.title); main.append(el('p', route.path.description), el('p', 'Esta ordem é uma recomendação. Todos os cursos estão disponíveis diretamente.', 'notice'), group('Cursos deste caminho', '', route.path.courseIds.map(id => catalog.courses.find(course => course.id === id)))); }
  else { heading('Conteúdo não encontrado'); main.append(el('p', 'Confira o endereço ou volte ao catálogo.'), link('Voltar ao catálogo', '#/')); }
  main.querySelector('h1')?.focus();
}
async function load() {
  main.replaceChildren(el('p', 'Carregando catálogo…'));
  try {
    const response = await fetch('data/catalog.json', { cache: 'no-store' }); if (!response.ok) throw new Error('Falha no carregamento'); catalog = validateCatalog(await response.json()); await render();
  } catch (error) {
    if (resolveRoute(location.hash, catalog).type === 'admin') { await render(); return; }
    console.error('Catálogo indisponível:', error.message); main.replaceChildren(); heading('Catálogo indisponível'); main.append(el('p', 'Não foi possível carregar os cursos. Tente novamente.', 'error'), button('Tentar novamente', load), link('Administração', '#/admin'));
  }
}
window.addEventListener('hashchange', render);
load();
