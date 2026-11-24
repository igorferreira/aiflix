import assert from 'node:assert/strict';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const base = process.env.QA_BASE_URL || 'http://127.0.0.1:3000';
const course = (id,title) => ({id,title,description:'Curso fixture isolado <img src=x onerror=alert(1)>',modules:[{id:`${id}-module`,title:'Módulo fixture',lessons:[{id:`${id}-lesson`,title:`Aula ${title}`,description:'Descrição fixture',durationSeconds:125,youtubeUrl:'https://www.youtube.com/watch?v=Ze-Q6ZNWpco',materials:[{title:'Referência',url:'https://example.com/material'}]}]}]});
const catalog = {schemaVersion:2,courses:[course('alpha','Curso Alpha'),course('beta','Curso Beta')],tracks:[{id:'iniciantes',title:'Iniciantes',description:'Fixture',courseIds:['alpha','beta']}],learnPaths:[{id:'caminho-a',title:'Caminho A',description:'Ordem sugerida',courseIds:['alpha','beta']},{id:'caminho-b',title:'Caminho B',description:'Outra ordem',courseIds:['beta','alpha']}]};
const browser = await chromium.launch({headless:true});
let checks=0;
const ok = (condition,message) => { assert.ok(condition,message);checks++; };
async function context(options={}) {
 const ctx=await browser.newContext({reducedMotion:'reduce',...options});
 await ctx.route('https://www.youtube.com/**',route=>route.fulfill({status:200,contentType:'text/html',body:'<html><body>Player externo não testado</body></html>'}));
 await ctx.route('**/data/catalog.json',route=>route.fulfill({json:catalog}));
 return ctx;
}
try {
 const ctx=await context();const page=await ctx.newPage();
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 for (const width of [320,768,1440]) {
  await page.setViewportSize({width,height:900});await page.goto(base);await page.getByRole('heading',{name:'O que você quer aprender?'}).waitFor();
  ok(await page.evaluate(()=>document.documentElement.scrollWidth <= innerWidth),`home overflow ${width}`);
  ok(await page.getByRole('link',{name:'Assistir agora',exact:true}).getAttribute('href')==='#/curso/alpha/aula/alpha-lesson',`CTA aponta primeira aula ${width}`);
  const art=await page.locator('.course-card .course-art').first().boundingBox();ok(Math.abs(art.width/art.height-16/9)<.03,`cartão16:9 ${width}`);
  await page.getByRole('link',{name:'Assistir agora',exact:true}).focus();ok(await page.evaluate(()=>document.activeElement.textContent==='Assistir agora'),`CTA foco ${width}`);
  if(width===320){await page.getByRole('button',{name:'Próximo: Todos os cursos',exact:true}).click();ok(await page.getByRole('region',{name:'Cursos: Todos os cursos',exact:true}).evaluate(el=>el.scrollLeft>0),'carrossel avança sem overflow global');}

  await page.goto(`${base}/#/curso/alpha/aula/alpha-lesson`);await page.getByRole('button',{name:'Marcar como concluída',exact:true}).waitFor();
  ok(await page.evaluate(()=>document.documentElement.scrollWidth <= innerWidth),`lesson overflow ${width}`);
 }
 ok(await page.locator('iframe').getAttribute('src') === 'https://www.youtube.com/embed/Ze-Q6ZNWpco','iframe ID seguro');
 ok(await page.locator('iframe').getAttribute('allowfullscreen') !== null,'fullscreen permitido');
 ok(!(await page.locator('iframe').getAttribute('src')).includes('autoplay'),'sem autoplay');
 ok(await page.getByRole('link',{name:'Abrir no YouTube (nova aba)'}).getAttribute('rel') === 'noopener noreferrer','fallback externo seguro');
 ok(await page.locator('main img[onerror]').count() === 0,'texto HTML não vira elemento');
 await page.getByRole('button',{name:'Marcar como concluída',exact:true}).click();await page.reload();await page.getByRole('button',{name:'Marcar como não concluída',exact:true}).waitFor();checks++;
 await page.getByRole('button',{name:'Marcar como não concluída',exact:true}).click();await page.reload();await page.getByRole('button',{name:'Marcar como concluída',exact:true}).waitFor();checks++;
 await page.goto(`${base}/#/curso/beta/aula/alpha-lesson`);await page.getByRole('heading',{name:'Conteúdo não encontrado'}).waitFor();checks++;
 await page.goto(`${base}/#/caminho/caminho-b`);await page.getByRole('heading',{name:'Caminho B',exact:true}).waitFor();await page.getByRole('link',{name:'Curso Alpha',exact:true}).click();await page.getByRole('heading',{name:'Curso Alpha',exact:true}).waitFor();ok(page.url().endsWith('#/curso/alpha'),'curso independente de caminho');
 await page.locator('.brand').focus();await page.keyboard.press('Tab');ok(await page.evaluate(()=>document.activeElement.tagName==='A'),'teclado alcança navegação');
 await page.evaluate(()=>localStorage.setItem('aiflix.progress.v1','quebrado'));await page.goto(`${base}/#/curso/alpha/aula/alpha-lesson`);await page.reload();await page.getByRole('button',{name:'Marcar como concluída',exact:true}).waitFor();
 page.once('dialog',d=>d.dismiss());await page.getByRole('button',{name:'Marcar como concluída',exact:true}).click();ok(await page.evaluate(()=>localStorage.getItem('aiflix.progress.v1'))==='quebrado','cancelar preserva dado corrompido');
 page.once('dialog',d=>d.accept());await page.getByRole('button',{name:'Marcar como concluída',exact:true}).click();ok(await page.evaluate(()=>JSON.parse(localStorage.getItem('aiflix.progress.v1')).completedLessonIds.includes('alpha-lesson')),'consentimento substitui registro');
 ok(errors.length===0,`sem erros JS ${errors}`);await ctx.close();
 const blocked=await context();await blocked.addInitScript(()=>Object.defineProperty(window,'localStorage',{get(){throw new Error('blocked')}}));const bp=await blocked.newPage();await bp.goto(`${base}/#/curso/alpha/aula/alpha-lesson`);await bp.getByRole('button',{name:'Marcar como concluída',exact:true}).waitFor();bp.once('dialog',d=>d.accept());await bp.getByRole('button',{name:'Marcar como concluída',exact:true}).click();await bp.getByText('Progresso disponível apenas nesta sessão.',{exact:true}).waitFor();checks++;await blocked.close();
 const retry=await browser.newContext();let fail=true;await retry.route('**/data/catalog.json',route=>route.fulfill(fail?{status:503,json:{}}:{json:{schemaVersion:2,courses:[],tracks:[],learnPaths:[]}}));const rp=await retry.newPage();await rp.goto(base);await rp.getByRole('heading',{name:'Catálogo indisponível'}).waitFor();fail=false;await rp.getByRole('button',{name:'Tentar novamente'}).click();await rp.getByText('Estamos preparando os primeiros cursos.',{exact:false}).waitFor();checks++;await retry.close();
 const admin=await context();let authenticated=false;let conflict=false;let published=false;let path={id:'novo',title:'Caminho novo',description:'Descrição',courseIds:['alpha','beta'],status:'draft',revision:1};
 await admin.route('**/api/session',route=>{const method=route.request().method();if(method==='POST')authenticated=true;if(method==='DELETE')return route.fulfill({status:204});return route.fulfill({json:{authenticated}})});
 await admin.route('**/api/admin/learn-paths**',route=>{const req=route.request();if(req.method()==='GET')return route.fulfill({json:{paths:[path],catalog}});if(conflict)return route.fulfill({status:409,json:{error:{code:'CONFLICT',message:'Conflito'}}});if(req.url().endsWith('/publish')){published=true;path={...path,status:'published',revision:path.revision+1};return route.fulfill({json:{path}})}const payload=req.postDataJSON();path={...path,...payload,revision:path.revision+1};return route.fulfill({json:{path}})});
 const ap=await admin.newPage();await ap.goto(`${base}/#/admin`);await ap.getByLabel('Senha administrativa',{exact:true}).fill('fixture');await ap.getByRole('button',{name:'Entrar',exact:true}).click();await ap.getByRole('link',{name:'Caminho novo',exact:true}).click();await ap.locator('#field-id[readonly]').waitFor();await ap.getByLabel('Título',{exact:true}).fill('Título alterado');
 await ap.getByRole('button',{name:'Subir: Curso Beta',exact:true}).click();ok(await ap.locator('.ordered-courses li').first().textContent().then(s=>s.includes('Curso Beta')),'admin reordena');
 await ap.getByRole('button',{name:'Pré-visualizar',exact:true}).click();await ap.getByRole('heading',{name:'Título alterado',exact:true}).waitFor({timeout:3000});checks++;
 conflict=true;await ap.getByRole('button',{name:'Salvar rascunho',exact:true}).click();await ap.getByRole('alert').filter({hasText:'Outra edição'}).waitFor();ok(await ap.getByLabel('Título',{exact:true}).inputValue()==='Título alterado','409 preserva formulário');
 conflict=false;await ap.getByRole('button',{name:'Publicar caminho',exact:true}).click();await ap.getByText('Caminho publicado. A versão pública já pode ser consultada.',{exact:true}).waitFor();ok(published,'UI chama publicar após salvar');
 for(const width of [320,768,1440]){await ap.setViewportSize({width,height:900});ok(await ap.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`admin overflow ${width}`)}
 await admin.close();
 const real=await browser.newContext();await real.route('https://www.youtube.com/**',route=>route.abort());const realPage=await real.newPage();await realPage.goto(base);await realPage.getByRole('heading',{name:'Todos os cursos',exact:true}).waitFor();ok(await realPage.getByRole('region',{name:'Cursos: Todos os cursos',exact:true}).locator('.course-card').count()===7,'catálogo real contém sete cursos');
 const realCatalog=await (await realPage.request.get(`${base}/data/catalog.json`)).json();
 ok(realCatalog.courses.filter(course=>course.status!=='preparing'&&course.modules.length>0).length===7,'sete cursos reais com aulas publicados');
 ok(Array.isArray(realCatalog.creators)&&realCatalog.creators.length===10,'dez canais de YouTubers indicados publicados');
 for(const width of [320,768,1440]){
  await realPage.setViewportSize({width,height:900});await realPage.goto(base);await realPage.getByRole('link',{name:'Assistir agora',exact:true}).waitFor();
  ok(await realPage.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`home real com capas sem overflow ${width}`);
  const images=realPage.getByRole('region',{name:'Cursos: Todos os cursos',exact:true}).locator('img.cover');ok(await images.count()===7,`sete capas reais ${width}`);
  for(const image of await images.all()){await image.scrollIntoViewIfNeeded();await realPage.waitForFunction(el=>el.complete&&el.naturalWidth>0,await image.elementHandle());const box=await image.boundingBox();ok(Math.abs(box.width/box.height-16/9)<.03,`capa real16:9 ${width}`)}
  await realPage.getByRole('link',{name:'Assistir agora',exact:true}).focus();await realPage.keyboard.press('Enter');await realPage.locator('iframe.player').waitFor();ok(realPage.url().endsWith('#/curso/introducao-ia/aula/introducao-ia-aula'),`CTA real abre aula ${width}`);
 }
 await realPage.goto(base);await realPage.getByRole('link',{name:'Introdução à inteligência artificial',exact:true}).first().waitFor();await realPage.getByRole('link',{name:'Introdução à inteligência artificial',exact:true}).first().click();await realPage.getByRole('heading',{name:'Introdução à inteligência artificial',level:1,exact:true}).waitFor();ok((await realPage.locator('main').innerText()).includes('Curadoria IAFLIX: aula externa de Diogo Cortiz'),'autoria real visível');checks++;await realPage.goto(`${base}/#/admin`);await realPage.getByText('Administração ainda não configurada.',{exact:true}).waitFor();checks++;await real.close();
 console.log(JSON.stringify({result:'PASS',checks,scope:'UI com fixtures isoladas e API administrativa interceptada; não comprova persistência server-side, reprodução YouTube ou produção'}));
} finally {await browser.close()}
