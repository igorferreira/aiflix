import { validateCatalog, youtubeId, resolveRoute } from './catalog.js';
import { createProgress } from './progress.js';
import { el, link, button } from './ui.js';
import { createAdminView } from './admin.js';
import { courseShareUrl, whatsappUrl } from './share.js';
const main = document.querySelector('main');
const announcements = document.querySelector('#announcements');
let catalog = { schemaVersion: 2, courses: [], tracks: [], learnPaths: [] };
let routeVersion = 0;
let storage;
try { storage = window.localStorage; } catch { storage = { getItem() { throw new Error(); }, setItem() { throw new Error(); } }; }
const progress = createProgress(storage);
function announce(text) { announcements.textContent = ''; requestAnimationFrame(() => { announcements.textContent = text; }); }
function heading(text) { const title = el('h1', text); title.tabIndex = -1; document.title = `${text} — aiflix`; main.append(title); return title; }
function duration(seconds) { return `${Math.ceil(seconds / 60)} min`; }
function lessons(course) { return course.modules.flatMap(module => module.lessons); }
function statsText(course) { const s = progress.stats(course); return `${s.completed} de ${s.total} aulas concluídas · ${s.percent}%`; }
function artwork(course) {
  const art = el('div', undefined, 'course-art');
  art.setAttribute('aria-hidden', 'true');
  art.append(el('span', course.title, 'art-title'), el('span', lessons(course)[0]?.title || 'Vídeos em preparação', 'art-lesson'));
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
  if (course.status === 'preparing') {
    article.append(title, el('p', course.description), el('p', 'Vídeos em preparação', 'meta'));
    return article;
  }
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
  else if (catalog.courses.some(course => lessons(course).length)) {
    const course = catalog.courses.find(course => lessons(course).length); const firstLesson = lessons(course)[0];
    const feature = el('section', undefined, 'featured-course'); const copy = el('div', undefined, 'featured-copy');
    copy.append(el('h2', course.title), el('p', course.description));
    const actions = el('div', undefined, 'actions'); const watch = link('Assistir agora', `#/curso/${course.id}/aula/${firstLesson.id}`); watch.className = 'button primary';
    const details = link('Ver curso', `#/curso/${course.id}`); details.className = 'button secondary'; actions.append(watch, details);
    copy.append(el('p', `${lessons(course).length} aulas · ${duration(lessons(course).reduce((sum, lesson) => sum + lesson.durationSeconds, 0))} · Acesso gratuito`, 'meta'), actions);
    const visual = el('div', undefined, 'featured-visual');
    if (course.cover) {
      const img = el('img'); img.src = course.cover; img.alt = ''; img.className = 'featured-image'; img.addEventListener('error', () => visual.replaceChildren(artwork(course)), { once: true }); visual.append(img);
    } else visual.append(artwork(course));
    feature.append(copy, visual); main.append(feature);
  }
  if (catalog.courses.length) main.append(group('Todos os cursos', 'Acesso direto, sem matrícula ou pré-requisitos.', catalog.courses, true));
  if (catalog.learnPaths.length) {
    const section = el('section'); section.append(el('h2', 'Caminhos de aprendizagem'));
    for (const path of catalog.learnPaths) { const article = el('article', undefined, 'course-card'); const title = el('h3'); title.append(link(path.title, `#/caminho/${path.id}`)); article.append(title, el('p', path.description), el('p', `${path.courseIds.length} cursos · sequência recomendada`, 'meta')); section.append(article); }
    main.append(section);
  }
  catalog.tracks.forEach(track => main.append(group(track.title, track.description, track.courseIds.map(id => catalog.courses.find(course => course.id === id)), true)));
}
function shareActions(course) {
  const actions = el('div', undefined, 'actions share-actions');
  actions.setAttribute('role', 'group');
  actions.setAttribute('aria-label', 'Compartilhar curso');
  const whatsapp = link('Compartilhar no WhatsApp', whatsappUrl(course));
  whatsapp.className = 'button secondary';
  whatsapp.target = '_blank';
  whatsapp.rel = 'noopener noreferrer';
  whatsapp.setAttribute('aria-label', `Compartilhar ${course.title} no WhatsApp (nova aba)`);
  const direct = link('Link direto do curso', courseShareUrl(course.id));
  direct.className = 'direct-course-link';
  const copy = button('Copiar link', async () => {
    try {
      await navigator.clipboard.writeText(courseShareUrl(course.id));
      copy.textContent = 'Link copiado';
      announce('Link do curso copiado.');
    } catch {
      announce('Não foi possível copiar. Use o link direto do curso.');
      direct.focus();
    }
  });
  actions.append(whatsapp, copy, direct);
  return actions;
}
function courseView(course, lesson) {
  const back = link('Todos os cursos', '#/');
  back.className = 'back-link';
  main.append(back);
  heading(course.title);
  main.append(el('p', course.description), shareActions(course));
  if (course.status === 'preparing') {
    if (course.cover) {
      const cover = el('img');
      cover.src = course.cover;
      cover.alt = '';
      cover.className = 'course-overview-cover';
      main.append(cover);
    }
    main.append(el('p', 'Vídeos em preparação. Este curso ainda não tem aulas disponíveis.', 'notice'));
    return;
  }
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
  } else {
    if (course.cover) {
      const cover = el('img'); cover.src = course.cover; cover.alt = ''; cover.className = 'course-overview-cover'; content.append(cover);
    }
    const firstLesson = lessons(course)[0];
    const watch = link('Assistir à primeira aula', `#/curso/${course.id}/aula/${firstLesson.id}`);
    watch.className = 'button primary';
    content.append(el('h2', 'Comece por uma aula'), el('p', 'Selecione uma aula na lista. Você pode assistir em qualquer ordem.'), watch);
  }
  function renderModules() {
    sidebar.replaceChildren(el('h2', 'Aulas do curso'));
    course.modules.forEach(module => {
      sidebar.append(el('h3', module.title)); const list = el('ol', undefined, 'lesson-list');
      module.lessons.forEach(item => { const li = el('li'); const a = link(item.title, `#/curso/${course.id}/aula/${item.id}`); if (item.id === lesson?.id) a.setAttribute('aria-current', 'page'); li.append(a, el('div', `${duration(item.durationSeconds)}${progress.completed.has(item.id) ? ' · Concluída' : ''}`, 'meta')); list.append(li); }); sidebar.append(list);
    });
  }
  renderModules(); layout.append(content, sidebar); main.append(layout);
}
const admin = createAdminView({
  main, heading, announce, render,
  isCurrent: version => version === routeVersion,
  async refreshCatalog() {
    const response = await fetch('data/catalog.json', { cache: 'no-store' });
    if (!response.ok) throw new Error('Caminho publicado, mas não foi possível atualizar o catálogo nesta tela.');
    catalog = validateCatalog(await response.json());
  }
});

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
