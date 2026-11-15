import { validateCatalog, isId } from './catalog.js';
import { el, link, button } from './ui.js';
import { adminApi as api } from './admin-api.js';

export function createAdminView({ main, heading, announce, render, isCurrent, refreshCatalog }) {
  function field(form, labelText, name, value, multiline = false) {
    const label = el('label', labelText);
    label.htmlFor = `field-${name}`;
    const input = el(multiline ? 'textarea' : 'input');
    input.id = label.htmlFor;
    input.name = name;
    input.value = value;
    input.maxLength = multiline ? 4000 : 160;
    input.required = !multiline;
    form.append(label, input);
    return input;
  }
  async function admin(id, version) {
    const title = heading('Administração'); main.append(el('p', 'Organize caminhos com cursos existentes. Rascunhos são privados; publicar os torna visíveis para todos.'));
    const area = el('section'); main.append(area); area.append(el('p', 'Verificando acesso…'));
    try {
      const session = await api('/api/session');
      if (!isCurrent(version)) return;
      area.replaceChildren();
      if (!session.authenticated) {
        const form = el('form'); form.append(el('h2', 'Acesso restrito'));
        const password = field(form, 'Senha administrativa', 'password', '');
        password.type = 'password';
        password.maxLength = 1024;
        password.autocomplete = 'current-password';
        const error = el('p', '', 'error'); error.setAttribute('role', 'alert'); const submit = el('button', 'Entrar'); submit.type = 'submit'; form.append(el('div', undefined, 'actions'), submit, error);
        form.addEventListener('submit', async event => {
          event.preventDefault();
          submit.disabled = true;
          error.textContent = '';
          try {
            await api('/api/session', { method: 'POST', body: JSON.stringify({ password: password.value }) });
            password.value = '';
            await render();
          } catch (e) {
            password.value = '';
            error.textContent = e.message;
            submit.disabled = false;
            password.focus();
          }
        });
        area.append(form);
        return;
      }
      const data = await api('/api/admin/learn-paths');
      if (!isCurrent(version)) return;
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
    } catch (e) { if (isCurrent(version)) { area.replaceChildren(el('p', e.message, 'error'), button('Tentar novamente', render)); } }
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
          await refreshCatalog();
          notice.textContent = 'Caminho publicado. A versão pública já pode ser consultada.';
        } else notice.textContent = `Rascunho salvo · revisão ${revision}.`;
        notice.hidden = false; announce(notice.textContent);
        if (isNew) location.hash = `#/admin/caminho/${saved.path.id}`;
      } catch (e) { error.textContent = e.message; } finally { busy(false); if (!isNew) save.focus(); }
    }
    form.addEventListener('submit', event => { event.preventDefault(); mutate(false); }); area.append(form);
  }

  return admin;
}
