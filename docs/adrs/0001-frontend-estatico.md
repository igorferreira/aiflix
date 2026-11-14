# ADR 0001 — Frontend estático com HTML, CSS e JavaScript vanilla

> Data: 14/11/2026 · Status: proposta para aprovação junto à Spec 001 v1.

## Contexto

O PRD v0.2 exige catálogo editável em JSON, páginas de curso, player YouTube e progresso local. Igor solicitou HTML, JavaScript vanilla e CSS, deixando ao arquiteto a indicação de framework se necessário. A pasta está no Google Drive e não deve conter `.git`.

## Decisão

Usar HTML semântico, CSS e módulos JavaScript nativos, sem framework, build obrigatório, backend ou dependência de produção. Carregar `data/catalog.json` no cliente. Rotas hash permitem reload e links profundos em hospedagem estática e subdiretórios. Servir por HTTP(S), inclusive durante desenvolvimento.

Usar iframe do YouTube com link externo permanente, sem SDK ou IFrame Player API. Progresso é conclusão manual reversível por ID estável de aula, em `localStorage`. Retomada de posição permanece para Spec 002. Não definir provedor de hospedagem neste ADR.

## Alternativas consideradas

- Framework SPA: acrescenta ferramentas e dependências sem necessidade atual de estado ou navegação complexos.
- Gerador estático: acrescenta etapa de geração para publicar conteúdo que o navegador pode ler diretamente.
- Múltiplos HTML por curso: exige geração ou duplicação para preservar edição somente por JSON.
- History routing: exige configuração de rewrite dependente do host; hash evita esse requisito no MVP.

## Consequências

Publicação sem build e inclusão de cursos sem alteração de código. Responsabilidade explícita por validação de dados, renderização, foco e tratamento de erros. Rotas hash não atendem a futuras páginas indexáveis por trilha; SEO será reavaliado na fase 004. Sem detecção automática de erros internos do iframe ou acompanhamento da reprodução. Progresso não atravessa dispositivos, perfis ou origens.

## Gatilho de revisão

Reavaliar mediante requisitos aprovados de SEO por rota, contas, estado compartilhado ou complexidade comprovada de manutenção. Não adotar framework apenas por aumento no número de cursos: catálogo permanece dado. Mudanças de stack exigem ADR com benefício e custo concretos.

## Evidência e limites

Decisão baseada em PRD, AGENTS.md e escopo solicitado; não constitui teste de runtime, integração, deploy ou aprovação do usuário. Não houve necessidade de consultar documentação de biblioteca: nenhuma foi selecionada. Sintaxe ou configuração específica de API, ferramenta ou hospedagem na implementação deverá seguir Context7.

## Revisão de escopo — 14/11/2026

PRD v0.3 escolhe Vercel para frontend e GitHub público. A decisão sem backend aplica-se ao leitor público da Spec 001 v2. Administração e persistência compartilhada pertencem à Spec 007 e ADR 0002. Contrato público agora usa schemaVersion 2, com cursos independentes referenciados por trilhas e learn paths. Nenhum framework foi necessário para esse desenho.
