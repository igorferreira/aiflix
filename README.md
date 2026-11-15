# aiflix

Plataforma gratuita e aberta para aprender inteligência artificial, com cursos independentes e caminhos de aprendizagem.

## Estado atual

Implementação em validação: catálogo com experiência de streaming, cursos independentes, player YouTube, conclusão local e administração de caminhos de aprendizagem. O catálogo inicial reúne três módulos com aulas externas de Diogo Cortiz, com autoria e fontes preservadas; são recortes da sequência original, não o curso completo do autor.

A administração possui funções de servidor e persistência editorial em repositório privado. Permanece indisponível na produção até configurar token restrito, credenciais, origem e proteção durável de login. Uma UI administrativa implementada não comprova publicação compartilhada na produção.

- Requisitos: `PRD.md`.
- Especificações: `specs/`.
- Tarefas, status e responsáveis: `TASKS.md`.
- Decisões de arquitetura: `docs/adrs/`.
- Repositório: https://github.com/igorferreira/aiflix.
- Página inicial publicada: https://aiflix-topaz-nine.vercel.app.
- Endereço solicitado: https://aiflix.vercel.app; atribuição recusada pela Vercel com `alias_in_use` (já em uso).

## Publicação

Vercel serve arquivos estáticos de `public/` e funções de `api/`, sem framework nem build obrigatório. `/data/catalog.json` é reescrito para o endpoint público de catálogo, que retorna somente o snapshot publicado. Sem integração editorial configurada, usa o catálogo de bootstrap. Documentos do repositório não fazem parte dos arquivos públicos do site.

## Executar e validar

Com Node.js 24, execute `npm test` para os testes automatizados e `npm run dev` para acesso local em `http://127.0.0.1:3000`. Outra porta pode ser definida em `PORT`. Nenhuma dependência de produção precisa ser instalada.

Configuração segura, inicialização do estado privado e gates de ativação estão em `docs/operacao-admin.md`. Testes de navegador ficam em `tests/qa-browser.mjs`; exigem Playwright disponível no ambiente e servidor local ativo. Fixtures ficam isoladas dos dados públicos.

A pasta sincronizada pelo Drive permanece sem `.git`. O checkout usado para versionamento fica fora do Drive; sincronize arquivos revisados explicitamente, sem copiar credenciais ou configurações locais.

## Manutenção do código

O bootstrap e as telas públicas ficam em `app.js`; o editor administrativo em `admin.js`; seu transporte HTTP em `admin-api.js`; helpers DOM em `ui.js`. Validação e progresso continuam módulos independentes. Mapa de dependências e motivos da separação: `docs/revisao-camadas.md`.
