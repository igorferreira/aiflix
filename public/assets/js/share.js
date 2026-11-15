import { isId } from './catalog.js';

export function courseShareUrl(id) {
  if (!isId(id)) throw new Error('ID de curso inválido');
  return `https://iaflix.vercel.app/cursos/${id}/`;
}

export function whatsappUrl(course) {
  return `https://wa.me/?text=${encodeURIComponent(`${course.title} — IAFLIX\n${courseShareUrl(course.id)}`)}`;
}
