import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve, join } from 'node:path';
import { validateCatalog } from '../public/assets/js/catalog.js';
import { courseShareUrl, whatsappUrl } from '../public/assets/js/share.js';

const escapeHtml = value => String(value).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);

export function renderCoursePage(course) {
  const url = courseShareUrl(course.id);
  const title = `${course.title} — IAFLIX`;
  const preparing = course.status === 'preparing';
  const description = preparing
    ? `${course.title}: curso em preparação. Vídeos ainda não disponíveis. Aprendizagem gratuita em inteligência artificial no IAFLIX.`
    : course.description.replace(/\s+/g, ' ').trim().slice(0, 240);
  const image = `https://iaflix.vercel.app/assets/images/course-${course.id}.png`;
  const lessonCount = course.modules.reduce((total, module) => total + module.lessons.length, 0);
  return `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  <link rel="canonical" href="${url}">
  <meta property="og:type" content="website">
  <meta property="og:locale" content="pt_BR">
  <meta property="og:site_name" content="IAFLIX">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:url" content="${url}">
  <meta property="og:image" content="${image}">
  <meta property="og:image:secure_url" content="${image}">
  <meta property="og:image:type" content="image/png">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="${escapeHtml(`Capa do curso ${course.title} no IAFLIX`)}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(title)}">
  <meta name="twitter:description" content="${escapeHtml(description)}">
  <meta name="twitter:image" content="${image}">
  <link rel="icon" href="/assets/images/logo-mark.svg" type="image/svg+xml">
  <link rel="stylesheet" href="/styles.css">
</head>
<body>
  <a class="skip" href="#content">Pular para o conteúdo</a>
  <header class="site-header">
    <a class="brand" href="/" aria-label="IAFLIX, início"><img src="/assets/images/logo-iaflix.svg" width="165" height="40" alt=""><span>Aprendizagem em IA</span></a>
    <nav aria-label="Principal"><a href="/">Catálogo</a></nav>
  </header>
  <main id="content" tabindex="-1">
    <h1>${escapeHtml(course.title)}</h1>
    <img class="cover" src="/assets/images/course-${course.id}.png" width="1200" height="630" alt="${escapeHtml(`Capa do curso ${course.title}`)}">
    <p>${escapeHtml(course.description)}</p>
    <p class="notice">${preparing ? 'Vídeos em preparação. Este curso ainda não possui aulas disponíveis.' : `${lessonCount} ${lessonCount === 1 ? 'aula disponível' : 'aulas disponíveis'} · Acesso gratuito, sem matrícula.`}</p>
    <div class="actions">
      <a class="button primary" href="/#/curso/${course.id}">Abrir curso</a>
      <a class="button secondary" href="${escapeHtml(whatsappUrl(course))}" target="_blank" rel="noopener noreferrer">Compartilhar no WhatsApp (nova aba)</a>
    </div>
    ${course.modules.map(module => `<section><h2>${escapeHtml(module.title)}</h2><ul>${module.lessons.map(lesson => `<li><a href="/#/curso/${course.id}/aula/${lesson.id}">${escapeHtml(lesson.title)}</a></li>`).join('')}</ul></section>`).join('\n    ')}
  </main>
  <footer><p>Curadoria IAFLIX. Autoria e links originais preservados nas aulas.</p></footer>
</body>
</html>
`.replace(/[ \t]+$/gm, '');
}

export async function generateCoursePages(catalog, outputDirectory) {
  validateCatalog(catalog);
  for (const course of catalog.courses) {
    const directory = join(outputDirectory, course.id);
    await mkdir(directory, { recursive: true });
    await writeFile(join(directory, 'index.html'), renderCoursePage(course), 'utf8');
  }
  return catalog.courses.length;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const catalog = JSON.parse(await readFile(new URL('../public/data/catalog.json', import.meta.url), 'utf8'));
  const total = await generateCoursePages(catalog, fileURLToPath(new URL('../public/cursos/', import.meta.url)));
  console.log(`${total} páginas de curso geradas com metadados de compartilhamento.`);
}
