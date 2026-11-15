import { isId } from './catalog.js';
const key = 'aiflix.progress.v1';
export function createProgress(storage) {
  const state = { completed: new Set(), warning: '', corrupt: false };
  try {
    const raw = storage.getItem(key);
    if (raw !== null) {
      const data = JSON.parse(raw);
      if (!data || data.version !== 1 || !Array.isArray(data.completedLessonIds) || data.completedLessonIds.some(id => !isId(id)) || new Set(data.completedLessonIds).size !== data.completedLessonIds.length) throw new Error('Formato inválido');
      state.completed = new Set(data.completedLessonIds);
    }
  } catch {
    state.corrupt = true;
    state.warning = 'Não foi possível ler o progresso. O registro anterior será preservado até você autorizar sua substituição.';
  }
  state.toggle = (id, { replaceCorrupt = false } = {}) => {
    if (!isId(id)) throw new Error('ID inválido');
    if (state.corrupt && !replaceCorrupt) return false;
    if (state.completed.has(id)) state.completed.delete(id); else state.completed.add(id);
    try {
      storage.setItem(key, JSON.stringify({ version: 1, completedLessonIds: [...state.completed] }));
      state.corrupt = false; state.warning = '';
    } catch { state.warning = 'Progresso disponível apenas nesta sessão.'; }
    return true;
  };
  state.stats = course => {
    const lessons = course.modules.flatMap(m => m.lessons);
    const completed = lessons.filter(l => state.completed.has(l.id)).length;
    return { completed, total: lessons.length, percent: lessons.length ? Math.floor(100 * completed / lessons.length) : 0 };
  };
  return state;
}
