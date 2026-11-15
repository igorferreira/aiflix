# Revisão de camadas e manutenção

> Data: 14/11/2026. Escopo: refactor proporcional, sem alteração de produto ou framework. QA e review desta revisão serão registrados separadamente.

## Diagnóstico

O ponto de acoplamento identificado pelo arquiteto estava no frontend: `app.js` reunia navegação, estado público, renderização do player, editor administrativo e transporte HTTP administrativo. Alterar mensagens ou chamadas da administração exigia tocar o mesmo módulo do catálogo e do player. O transporte só podia ser carregado junto do DOM, dificultando testes isolados de erros.

No servidor, `auth.js`, `http.js`, `editorial.js` e handlers já têm fronteiras suficientes para o tamanho atual: autenticação, protocolo HTTP, armazenamento/integridade editorial e endpoints. Extrair interfaces genéricas, classes ou repositórios adicionais não traria benefício comprovado. O validador de catálogo permanece puro e compartilhado entre cliente e servidor, evitando contratos divergentes.

## Ajustes

- `app.js` conserva bootstrap, estado de catálogo/progresso, versão de navegação e telas públicas.
- `admin.js` contém login, listagem, formulário, ordenação, prévia e publicação. Recebe elementos e callbacks explicitamente; não importa o bootstrap.
- `admin-api.js` concentra requisições administrativas, cookies same-origin, no-store, leitura JSON e mensagens de erro/conflito. Pode ser testado sem DOM.
- `ui.js` reúne somente os três helpers DOM já existentes (`el`, `link`, `button`), compartilhados entre telas públicas e administrativas. Textos continuam via `textContent`.
- O limite do campo de senha foi alinhado aos 1024 caracteres já aceitos pelo backend; nenhum segredo foi criado ou alterado.

Dependências: `app → admin/ui/catalog/progress`; `admin → admin-api/ui/catalog`. Nenhum módulo importa `app.js`. Estado do catálogo continua no bootstrap; a administração solicita sua atualização por callback após publicar. O callback `isCurrent` mantém a proteção contra resposta administrativa atrasada após troca de rota.

## Manutenção

Mudar transporte administrativo: `admin-api.js`. Mudar fluxo de edição: `admin.js`. Mudar navegação/estado/telas públicas: `app.js`. Mudar contrato de conteúdo: `catalog.js` e seus testes. Mudar persistência/sessão: camadas atuais em `lib/`, sem misturar código de navegador.

Não foram alterados catálogo, URLs, CSS, aparência de streaming, autenticação de servidor, gate503, persistência, cookies ou OpenAPI. Não foi adicionada dependência de produção.

## Verificação e limites

Teste novo do transporte verifica payload, cookies, cache,204, falha de rede, JSON inválido, conflito409 e erro503 do servidor. Os testes existentes continuam cobrindo validação, progresso, autorização e persistência com substitutos isolados. QA de navegador e integração após refactor constam em `docs/qa-camadas.md`; review final em `docs/review-camadas.md` quando concluídos.

Este refactor não ativa administração em produção nem resolve credenciais/proteção operacional pendentes. Reprodução completa de vídeos e aceite dos pilotos permanecem fora da evidência desta revisão.

## Publicação e validação remota

A raiz publicou o commit `3a1f82e8791543e0c6351693ccb008d8b958a555` no deployment Vercel `dpl_6bebpRptCwxCpYueZbpHeeY35D1H`, produção READY. O alias https://iaflix.vercel.app foi atualizado.

Smoke Chromium no endereço público confirmou CTA para a aula esperada, iframe correto, mensagem administrativa de configuração ausente, HTTP200 para `admin.js`, `admin-api.js` e `ui.js` e ausência de erros JavaScript de página. Não constitui validação de reprodução audiovisual, tela cheia ou publicação administrativa remota.
