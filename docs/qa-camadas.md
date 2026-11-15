# QA — separação de camadas e manutenção

> Data: 14/11/2026 · Agente: devsquad-qa · Veredito: **APROVADO para o refactor local testado**.

## Escopo e critérios

A revisão separa apresentação administrativa, transporte HTTP e pequenos helpers DOM do bootstrap público. Preservar catálogo, rotas, carrosséis/capas, player/fallback, progresso, login/editor, concorrência e gate administrativo503. Nenhum contrato ou backend foi alterado.

## Execução real

Ambiente: Node.js24.21.0 e Chromium via Playwright disponível no host. O servidor anterior4317 não estava ativo; foi iniciado `PORT=4317 node scripts/dev-server.mjs` sem alterar o script.

```sh
npm test
QA_BASE_URL=http://127.0.0.1:4317 PLAYWRIGHT_MODULE=/tmp/node_modules/playwright/index.mjs node tests/qa-browser.mjs
PLAYWRIGHT_MODULE=/tmp/node_modules/playwright/index.mjs node tests/qa-admin-integration.mjs
```

Resultados: **19 testes Node passaram**, **60 verificações browser passaram**, integração administrativa passou com **quatro gravações** no substituto GitHub privado isolado.

`admin.js`, `admin-api.js` e `ui.js` foram servidos por HTTP200. O grafo de imports não tem ciclo: app depende de admin/ui/catalog/progress; admin depende de ui/admin-api/catalog; admin-api e ui não importam app nem estado de rotas. Catalog não depende do DOM.

## Evidências de regressão

- Node: URLs, contrato, rotas/aula vinculada ao curso, progresso reversível/corrompido, autorização, origem, cookie, CAS e falha de storage. Novo teste do transporte cobre cookies same-origin, no-store, payload,204, falha de rede, JSON inválido,409 e503.
- Browser: catálogo, player/fallback seguros, persistência após recarga, erros, teclado, layout320/768/1440, capas reais16:9, CTA e carrossel. Sem overflow global nos cenários cobertos.
- Integração: login com handlers HTTP reais, salvar/recuperar rascunho, anônimo401, publicação visível em segundo contexto, rascunho posterior sem mudar snapshot público e logout401. Persistência externa foi substituída exclusivamente no teste.
- O gate de configuração administrativa foi preservado; ambiente sem credenciais continua informando indisponibilidade.

## Ajuste no teste

A primeira execução da integração encontrou ambiguidade no locator da mensagem de publicação: a mensagem aparece intencionalmente no aviso visível e na região acessível `aria-live`. Ajustado o locator para `main .notice`, sem alterar aplicação ou reduzir asserções de publicação. A nova execução passou. Não classificar essa correção de automação como regressão funcional do aplicativo.

## Limites

Esta aprovação cobre a manutenção local pedida. Não houve deploy, reprodução/fullscreen audiovisual real do YouTube, auditoria integral de acessibilidade nem teste de persistência administrativa real em GitHub/Vercel. Credenciais e proteção durável de login continuam gates de produção; não há aprovação silenciosa da ativação administrativa.
