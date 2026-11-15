# PRD — AiFlix

> **Status:** v0.3 · **Criado em:** 14/11/2026 · **Atualizado:** 14/11/2026 (gratuidade, cursos independentes e learn paths) · **Autor do pedido:** Igor dos Santos Ferreira
> **Nome oficial:** `aiflix` (definido por Igor em 14/11/2026 03:29 BRT)
> **Localização:** `/home/igorferreira/Insync/GoogleDrive/igorferreira08/Projetos/aiflix/` (Google Drive via Insync — **sem `.git`**; versionamento fica fora do Drive)

---

## 1. Visão do produto

Uma **"Netflix de IA"**: plataforma de vídeo com experiência de streaming (catálogo, trilhas, player em tela cheia, progresso) onde **todo o conteúdo é hospedado no YouTube** e os cursos são produzidos por nós.

Posicionamento: o lugar onde **qualquer pessoa que queira aprender inteligência artificial**, incluindo empresas e profissionais brasileiros aprendem IA de forma estruturada — do zero ao nível executivo — em vez de se perderem em vídeos soltos.

## 2. Problema

- Conteúdo de IA está espalhado, desatualizado e sem trilha clara para perfis não-técnicos.
- Cursos de plataforma (Udemy/Alura) são genéricos e caros para o contexto BR.
- O Igor já produz/produzirá conteúdo próprio; falta a **vitrine organizada** com cara de produto.

## 3. Público e trilhas (catálogo inicial)

| Trilha | Público | Exemplos de curso |
|---|---|---|
| Nivelamento | qualquer perfil | fundamentos de lógica, dados, nuvem |
| Iniciantes | entrada em IA | o que é IA/LLM, prompts, ferramentas |
| IA para Gestores | gestão média | uso de IA no dia a dia, produtividade |
| IA para Devs | dev sênior/pleno | agentes, RAG, arquitetura, SDD |
| IA para Gerentes de Produto | PM | discovery com IA, prototipagem |
| IA para CIOs e CTOs | executivo | estratégia, governança, TCO, roadmap |

Novas trilhas entram como dados de catálogo, não como mudança de código. Cursos são independentes: podem ser acessados diretamente, sem inscrição, pagamento ou conclusão de outro curso. Learn paths são sequências editoriais opcionais que referenciam cursos existentes, sem duplicá-los ou bloquear acesso.

## 4. Conteúdo

- Vídeos hospedados no **YouTube** (canal do projeto) e embutidos no player da plataforma.
- Cada curso: módulos → aulas (URL YouTube, título, duração, descrição, material complementar).
- Copyright/monetização: conteúdo próprio; embed do YouTube mantém views no canal (benefício duplo).

## 5. Escopo do MVP (Spec 001)

**Dentro:**
- Site estático com cara de Netflix: home com carrosséis por trilha, página de curso, player de aula (embed YouTube), progresso do usuário salvo localmente (localStorage).
- Catálogo em `catalog.json` (fonte única, editável sem código).
- Repositório público no GitHub e publicação na conta Vercel de Igor; endereço solicitado: `https://aiflix.vercel.app`, sujeito à disponibilidade e à verificação da publicação.
- Plataforma gratuita e aberta, sem login obrigatório para estudar.
- Área administrativa para criar, editar, ordenar e publicar learn paths (Spec 007); autenticação restrita a administradores.
- Meta declarada: três módulos de cursos prontos. Conteúdo, títulos e associação aos cursos ainda precisam ser fornecidos; não confundir três módulos com três cursos.

**Fora do MVP (fases futuras):**
- Login/contas de alunos, progresso em nuvem, certificados, upload/streaming próprio, busca avançada, gamificação, mobile app, cobrança.

## 6. Arquitetura inicial

- **Frontend:** HTML/CSS/JS estático (ou SPA leve), consumindo `catalog.json`.
- **Dados:** `data/catalog.json` (cursos, módulos, aulas, URLs YouTube).
- **Deploy:** frontend estático na Vercel; Git público fora do Drive. A publicação administrativa exige persistência compartilhada e autorização no servidor, conforme Spec 007 e ADR 0002; provedor e mecanismo ainda precisam ser definidos. Identidade visual permanece pendente.

## 7. Fases (SDD)

1. **001 — MVP catálogo + player** (esta spec)
2. 002 — Progresso e continuação de aula
3. 003 — Busca e filtros
4. 004 — Landing por trilha + SEO
5. 005 — Contas e progresso em nuvem (decidir backend)
6. 006 — Certificados / gamificação
7. **007 — Administração e learn paths** (novo escopo solicitado, pode ser entregue antes das fases 002–006).

## 8. Premissas e riscos

- **Premissa:** todos os vídeos existem no YouTube antes de entrarem no catálogo.
- **Risco:** dependência do player do YouTube (anúncios, disponibilidade) — mitigável com fallback de links.
- **Risco:** pasta no Google Drive sem `.git` → histórico de versão depende do Drive; specs versionadas por `vN` no nome/cabeçalho.
- **Nome oficial:** aiflix.
- **Administração:** ocultar controles no navegador não protege publicação; toda mutação compartilhada exige autorização no servidor.
- **Conteúdo inicial:** três módulos não têm títulos, vídeos ou curso de destino informados; não alegar disponibilidade real.

## 9. Métricas de sucesso (iniciais)

- Publicação técnica no endereço solicitado, separada do lançamento com cursos reais.
- Meta original de cobertura: ≥ 1 curso por trilha (6 cursos); preservada até decisão explícita. A nova meta de três módulos não a substitui automaticamente.
- Três módulos reais prontos, vinculados aos respectivos cursos, com vídeos próprios verificados.
- Qualquer pessoa acessa cursos gratuitamente e diretamente; learn paths não criam pré-requisitos obrigatórios.
- Administrador autorizado publica learn path visível a outro navegador, sem expor rascunhos ou credenciais.
- Tempo até publicar um curso novo: < 30 min (só editar JSON).
- Feedback dos 8 clientes-piloto do TimeAutomático sobre a experiência.

## 10. Controle de mudanças — v0.3

Solicitação de Igor em 14/11/2026: controlar todos os pedidos em TASKS.md com status e agente responsável; criar GitHub público; publicar na própria conta Vercel em aiflix.vercel.app; preparar três módulos de cursos; manter cursos independentes; administrar learn paths; oferecer aprendizado gratuito de IA para todos. Requisitos solicitados estão incorporados; documentação não comprova execução de infraestrutura nem conteúdo pronto. Specs 001 v2 e 007 v1 detalham os contratos. Identidades de contas, URL real, estado do deploy e evidências devem ser registrados após verificação.

## Estado da publicação inicial — 14/11/2026

Repositório público criado: https://github.com/igorferreira/aiflix. Landing de apresentação publicada na conta Vercel de Igor em https://aiflix-topaz-nine.vercel.app. O endereço solicitado aiflix.vercel.app permanece meta bloqueada: Vercel retornou HTTP 400 `alias_in_use`. Somente `public/` é servido; arquivos de documentação ficam fora da saída estática. Esta publicação não implementa nem valida cursos, player, três módulos, progresso ou administração. Evidências: `docs/publicacao-2026-11-14.md`.

## Clarificação de conteúdo — pesquisa iBest Brasil

Igor solicitou pesquisar canais de referência de IA no iBest Brasil para orientar a preparação dos três módulos. A dependência inicial é pesquisa e curadoria, não somente recebimento de URLs de Igor. Fontes e resultados serão registrados em `docs/pesquisa-ibest-2026.md`, a partir da fonte oficial `https://app.premioibest.com/votacao/autoridade-ia`. Confirmar ano, modalidade (indicação, voto popular ou academia), colocação efetivamente publicada e canais YouTube de cada referência. TOP10 não estabelece ordem entre nomes nem comprova qualidade de curso.

Decisão editorial resolvida: Igor autorizou incorporar vídeos externos com autoria e links, conforme registro abaixo. Essa autorização não dispensa curadoria, atribuição e verificação de disponibilidade. Antes de publicar, confirmar seleção, autoria, condições aplicáveis, disponibilidade e associação de aulas aos módulos e cursos. Tarefas CUR-01, CUR-02 e CNT-01 rastreiam essa dependência.

## Decisão editorial aprovada — 14/11/2026

Igor autorizou explicitamente: “Sim, usar vídeos externos com autoria e links”. O catálogo pode incorporar vídeos gratuitos de terceiros disponíveis no YouTube, com atribuição clara ao autor e links originais. O aiflix organiza a sequência; não reivindica autoria dos vídeos. Não baixar, republicar arquivos ou contornar bloqueio de incorporação. Fontes e metadados devem ser verificáveis; popularidade no iBest não comprova qualidade pedagógica. Esta decisão substitui as restrições anteriores a conteúdo exclusivamente próprio e resolve CUR-02; mantém curadoria, disponibilidade e atribuição como gates de publicação.
