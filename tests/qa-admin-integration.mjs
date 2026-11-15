import assert from 'node:assert/strict';
import { randomBytes, scryptSync } from 'node:crypto';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
import { createServer } from '../scripts/dev-server.mjs';
const password=randomBytes(32).toString('hex');const salt=randomBytes(16);
const nativeFetch=globalThis.fetch;
const env={...process.env};
const catalog={schemaVersion:2,tracks:[],learnPaths:[],courses:[{id:'curso-fixture',title:'Curso fixture',description:'Apenas teste',modules:[{id:'modulo-fixture',title:'Módulo',lessons:[{id:'aula-fixture',title:'Aula fixture',description:'',durationSeconds:60,youtubeUrl:'https://youtu.be/abcdefghijk',materials:[]}]}]}]};
let state={schemaVersion:1,paths:[],publishedCatalog:catalog,audit:[]};let sha='sha0';let writes=0;
globalThis.fetch=async(url,options={})=>{
 if(!String(url).startsWith('https://api.github.com/'))return nativeFetch(url,options);
 if(String(url).endsWith('/repos/qa/private'))return new Response(JSON.stringify({private:true}),{status:200});
 if(options.method==='PUT'){
  const body=JSON.parse(options.body);if(body.sha!==sha)return new Response('{}',{status:409});
  state=JSON.parse(Buffer.from(body.content,'base64').toString());sha=`sha${++writes}`;return new Response(JSON.stringify({content:{sha}}),{status:200});
 }
 const data=JSON.stringify(state);return new Response(JSON.stringify({encoding:'base64',content:Buffer.from(data).toString('base64'),sha,size:Buffer.byteLength(data)}),{status:200});
};
const server=createServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));const base=`http://127.0.0.1:${server.address().port}`;
Object.assign(process.env,{ADMIN_PASSWORD_HASH:`scrypt$${salt.toString('hex')}$${scryptSync(password,salt,64).toString('hex')}`,ADMIN_SESSION_SECRET:randomBytes(32).toString('hex'),ADMIN_ORIGIN:base,ADMIN_LOCAL_HTTP:'true',ADMIN_LOGIN_PROTECTION:'platform',EDITORIAL_GITHUB_TOKEN:'fixture-not-a-real-token',EDITORIAL_GITHUB_REPOSITORY:'qa/private',EDITORIAL_GITHUB_BRANCH:'main'});delete process.env.VERCEL;
const browser=await chromium.launch({headless:true});
try{
 const admin=await browser.newContext();const anon=await browser.newContext();const page=await admin.newPage();const visitor=await anon.newPage();
 await page.goto(`${base}/#/admin`);await page.getByLabel('Senha administrativa',{exact:true}).fill(password);await page.getByRole('button',{name:'Entrar',exact:true}).click();await page.getByRole('heading',{name:'Criar caminho',exact:true}).waitFor();
 await page.getByLabel('Identificador (letras minúsculas, números e hífens)').fill('caminho-fixture');await page.getByLabel('Título',{exact:true}).fill('Caminho QA');await page.getByLabel('Descrição',{exact:true}).fill('Teste integração');await page.getByRole('button',{name:'Adicionar curso',exact:true}).click();await page.getByRole('button',{name:'Salvar rascunho',exact:true}).click();await page.locator('#field-id[readonly]').waitFor();
 await page.reload();await page.locator('#field-id[readonly]').waitFor();assert.equal(await page.getByLabel('Título',{exact:true}).inputValue(),'Caminho QA');
 await visitor.goto(base);await visitor.getByRole('heading',{name:'Todos os cursos',exact:true}).waitFor();assert.equal(await visitor.getByRole('link',{name:'Caminho QA',exact:true}).count(),0);
 const unauthorized=await anon.request.get(`${base}/api/admin/learn-paths`);assert.equal(unauthorized.status(),401);
 await page.getByRole('button',{name:'Publicar caminho',exact:true}).click();await page.getByText('Caminho publicado. A versão pública já pode ser consultada.',{exact:true}).waitFor();await visitor.reload();await visitor.getByRole('link',{name:'Caminho QA',exact:true}).waitFor();assert.ok(writes>=3);
 assert.equal((await anon.request.get(`${base}/data/catalog.json`)).status(),200);
 await page.getByLabel('Título',{exact:true}).fill('Rascunho privado');await page.getByRole('button',{name:'Salvar rascunho',exact:true}).click();await page.getByText('Rascunho salvo',{exact:false}).waitFor();await visitor.reload();await visitor.getByRole('link',{name:'Caminho QA',exact:true}).waitFor();assert.equal(await visitor.getByRole('link',{name:'Rascunho privado',exact:true}).count(),0);
 await page.getByRole('button',{name:'Sair',exact:true}).click();await page.getByLabel('Senha administrativa',{exact:true}).waitFor();assert.equal((await admin.request.get(`${base}/api/admin/learn-paths`)).status(),401);
 console.log(JSON.stringify({result:'PASS',scope:'Browser + handlers HTTP reais + GitHub mock privado isolado. Dois contextos verificam rascunho privado, reload, publicação compartilhada e logout. Não comprova GitHub/Vercel produção.',writes}));
 await admin.close();await anon.close();
}finally{await browser.close();globalThis.fetch=nativeFetch;for(const key of Object.keys(process.env))if(!(key in env))delete process.env[key];Object.assign(process.env,env);await new Promise(r=>server.close(r))}
