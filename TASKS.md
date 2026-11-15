# Tarefas — aiflix

> Versão: v2 · Data: 14/11/2026 · Fonte: PRD.md v0.3 e AGENTS.md.

## Objetivo e limites

Entregar uma vitrine de cursos próprios de IA, organizada para profissionais brasileiros, com vídeos no YouTube. O MVP inclui catálogo por trilha, curso com módulos e aulas, player com tela cheia e progresso local básico. Não inclui contas de alunos, progresso em nuvem, certificados, streaming próprio, busca avançada, gamificação, aplicativo móvel ou cobrança.

O pedido atual autoriza repositório público e publicação Vercel, além da consolidação SDD. Execução de infraestrutura e implantação funcional do produto são resultados distintos. O quadro abaixo é a fonte de status e responsáveis; checkboxes históricos não significam execução de aplicativo.


## Quadro de gestão dos pedidos — fonte atual de status

Status: `concluída` exige evidência; `em andamento` identifica execução real; `planejada` tem responsável previsto, sem agente executando; `bloqueada` indica insumo/decisão ausente. Atualize status, agente e evidência a cada transição. Não atribua execução a um agente apenas por existir no catálogo. Todas as tarefas se vinculam ao PRD v0.3 e às specs indicadas.

| ID | Pedido / tarefa | Status | Agente responsável / executor | Dependência e evidência |
|---|---|---|---|---|
| DOC-01–05 | Especificação inicial, backlog e ADR 0001 | concluída | DevSquad da rodada anterior | Artefatos v1 e registro do Passo 003; só documentação |
| DOC-06 | Incorporar todos os novos pedidos no SDD | concluída | devsquad-lead / sdd_scope_update | PRD v0.3, Spec 001 v2, Spec 007 v1, ADR 0002 |
| DOC-07 | Gestão por status e agente neste TASKS.md | concluída | devsquad-lead / sdd_scope_update | Este quadro; preservar histórias detalhadas abaixo |
| INF-01 | Criar/verificar GitHub público aiflix | concluída | root, função DevSecOps | https://github.com/igorferreira/aiflix público; evidência em docs/publicacao-2026-11-14.md |
| INF-02 | Manter checkout Git fora do Drive e publicar arquivos autorizados | concluída (bootstrap) | root, função DevSecOps | /home/igorferreira/projetos/aiflix; commit inicial 0bcb05964ed3b41a826f69b9edf1d4f5f3b8ee7c; sincronização da nova revisão documental pela raiz |
| INF-03 | Criar projeto e publicar na conta Vercel de Igor | concluída (landing) | root, função DevSecOps | Produção READY em https://aiflix-topaz-nine.vercel.app; / e /styles.css 200, comparação local confirmada; aplicação ainda pendente |
| INF-04 | Atribuir endereço solicitado https://aiflix.vercel.app | bloqueada | root, função DevSecOps | Alias recusado HTTP 400 alias_in_use; produção alternativa ativa; depende de liberação do endereço ou nova escolha de Igor |
| US-01 | Catálogo completo e agrupamentos por referências | planejada | devsquad-frontend (previsto) | Spec 001 v2, CA01/CA05/CA13/CA14 |
| US-02 | Curso independente, módulos e aulas | planejada | devsquad-frontend (previsto) | Spec 001 v2, CA02/CA13 |
| US-03 | Player YouTube, tela cheia e fallback | planejada | devsquad-frontend (previsto) | CA03/CA09/CA12; conteúdo real para teste |
| US-04 | Conclusão manual local reversível | planejada | devsquad-frontend (previsto) | CA04/CA09; retomada fase 002 |
| US-05 | Validar catálogo e procedimento editorial | planejada | devsquad-frontend (previsto) | Schema 2 e CA05/CA12 |
| CUR-01 | Pesquisar referências de IA no iBest Brasil e confirmar canais YouTube | planejada (continuação) | DevSquad / curadoria (previsto); levantamento inicial por root | Fonte oficial https://app.premioibest.com/votacao/autoridade-ia; registro em docs/pesquisa-ibest-2026.md; distinguir ano, TOP10, voto popular e academia, sem ranking inferido |
| CUR-02 | Definir uso das referências: inspiração editorial ou embed de terceiros | planejada | Igor / produto, com curadoria do DevSquad | CUR-01; referência iBest não autoriza substituir conteúdo próprio ou reutilizar material; confirmar autoria, condições de uso e disponibilidade |
| CNT-01 | Preparar três módulos de cursos reais após pesquisa e curadoria | bloqueada | DevSquad / curadoria (previsto) | CUR-01/02; faltam seleção, títulos, curso(s) de destino, aulas e URLs verificadas; CA15; não depende somente de Igor fornecer URLs e não equivale a três cursos |
| CNT-02 | Cobrir seis trilhas com cursos reais | bloqueada | Igor / conteúdo | Meta original preservada; três módulos não a substituem; CA10 |
| PUB-01 | Garantir plataforma gratuita aberta sem login de alunos | planejada | devsquad-frontend (previsto) | CA13/LP07; sem cobrança ou pré-requisitos |
| ADM-01 | Escolher autenticação, persistência e publicação server-side | planejada | devsquad-architect (previsto) | ADR de implementação, custos, conta admin e contrato OpenAPI; Spec 007 |
| ADM-02 | Implementar serviço administrativo autorizado | planejada | devsquad-backend (previsto) | ADM-01; LP01/LP02/LP04/LP05/LP06 |
| ADM-03 | UI para criar/editar/ordenar/pré-visualizar/publicar learn paths | planejada | devsquad-frontend (previsto) | ADM-01/02; LP02/LP08 |
| ADM-04 | Exibir learn paths publicados com cursos independentes | planejada | devsquad-frontend (previsto) | CA14; LP03/LP04/LP07 |
| US-06 | QA de teclado, telas, catálogo, player, progresso e erros | planejada | devsquad-qa (previsto) | CA01–CA15 e LP01–LP08; sem execução funcional nesta revisão |
| US-07 | Validar publicação funcional e coletar feedback dos oito pilotos | planejada | devsquad-qa (previsto) / Igor | Deploy técnico não conclui conteúdo, admin ou aceite de negócio |
| REV-01 | Review final da implementação | planejada | devsquad-reviewer (previsto) | QA aprovado antes de considerar produto pronto |
| UX-01 | Definir identidade visual | planejada | Igor / devsquad-frontend (previsto) | Identidade ainda não definida |

As linhas de infraestrutura refletem execução da raiz e evidências em docs/publicacao-2026-11-14.md; este agente documental não executou GitHub/Vercel. As histórias abaixo conservam o detalhamento de aceite original, complementado por CA13–CA16 e LP01–LP08.

## Entrega documental atual

- [x] DOC-01 — Ler PRD.md e AGENTS.md e identificar escopo e restrições.
- [x] DOC-02 — Registrar backlog priorizado com critérios de aceite e pendências neste arquivo.
- [x] DOC-03 — Elaborar a revisão v1 de `specs/001-mvp-catalogo-player.md` com contrato de catálogo, navegação, progresso, erros e validação.
- [x] DOC-04 — Registrar decisão de stack em `docs/adrs/0001-frontend-estatico.md`; base solicitada: HTML, CSS e JavaScript vanilla. Framework depende de justificativa do arquiteto.
- [x] DOC-05 — Revisar consistência documental entre PRD, especificação, ADR e tarefas.

Revisão documental: fontes, nomes de arquivos, limites da fase 001 e critérios CA01–CA12 conferidos. Não equivale a QA funcional nem aceite do produto.

## Backlog da Spec 001

Todas as histórias têm prioridade P0 para o MVP. A ordem abaixo orienta execução; detalhes técnicos pertencem à especificação.

### US-01 — Consultar trilhas e cursos

Como profissional, quero descobrir cursos por trilha para encontrar conteúdo adequado ao meu perfil.

- [ ] Implementar home com carrosséis derivados do catálogo.
- Fonte: PRD §§3, 5 e 6.
- Dado um catálogo válido, quando abrir a home, então verei cursos agrupados nas respectivas trilhas.
- Dado um curso novo no catálogo, quando recarregar a home, então ele aparecerá sem alteração de código.
- Dado um catálogo vazio ou indisponível, quando abrir a home, então verei um estado compreensível, sem tela quebrada.

### US-02 — Explorar um curso

Como aluno, quero consultar módulos e aulas para entender a sequência do curso e selecionar uma aula.

- [ ] Implementar página de curso e seleção de aula.
- Fonte: PRD §§4 e 5.
- Dado um curso válido, quando abri-lo, então verei seus módulos e aulas na ordem editorial.
- Dada uma aula, quando selecioná-la, então verei título, descrição, duração e materiais complementares disponíveis.
- Dado um endereço de curso ou aula inexistente, quando acessá-lo, então verei uma mensagem e um caminho de volta ao catálogo.

### US-03 — Assistir a uma aula

Como aluno, quero reproduzir a aula na plataforma para acompanhar o curso.

- [ ] Implementar embed do YouTube, acesso à tela cheia e link alternativo.
- Fonte: PRD §§1, 4, 5 e 8.
- Dada uma aula com vídeo disponível, quando abri-la, então poderei iniciar a reprodução e acessar tela cheia pelos controles do player.
- Dado um embed indisponível, quando consultar a aula, então terei um link para abrir o vídeo no YouTube.
- Dada uma URL inválida no catálogo, quando ela for processada, então não será usada para incorporar conteúdo inseguro.

### US-04 — Registrar progresso local básico

Como aluno, quero marcar aulas como concluídas para acompanhar meu avanço no mesmo navegador.

- [ ] Implementar marcação e desmarcação manual de conclusão com persistência local.
- Fonte: PRD §5; delimitação da fase 002 em AGENTS.md.
- Dada uma aula, quando marcar sua conclusão e recarregar a página, então sua conclusão permanecerá no mesmo navegador e origem.
- Dada uma aula concluída, quando desfizer a marcação e recarregar, então ela permanecerá não concluída.
- Dado armazenamento bloqueado ou corrompido, quando usar o curso, então ainda poderei assistir e receberei indicação da limitação de persistência.
- Dado apenas um título alterado e identificadores preservados, quando recarregar, então o progresso não será perdido.
- Retomada no segundo exato e sincronização não fazem parte desta história.

### US-05 — Publicar conteúdo pelo catálogo

Como responsável editorial, quero adicionar cursos e trilhas por dados para publicar sem alterar código.

- [ ] Validar catálogo e documentar procedimento editorial.
- [ ] Fornecer conteúdo próprio real para as seis trilhas iniciais.
- Fonte: PRD §§3, 4, 6, 8 e 9.
- Dado um catálogo válido, quando adicionar uma trilha e seu curso, então ambos aparecerão sem mudança no código.
- Dado o conteúdo e os metadados prontos, quando um responsável adicionar um curso pelo procedimento documentado, então a operação editorial levará menos de 30 minutos; registrar tempo observado.
- Dada a versão candidata ao lançamento, quando conferir o catálogo, então haverá pelo menos um curso real em cada uma das seis trilhas do PRD.
- Dado um vídeo ainda não publicado ou sem confirmação de autoria, quando preparar o catálogo de produção, então sua publicação ficará pendente.

### US-06 — Usar a plataforma com acessibilidade e em diferentes telas

Como aluno, quero navegar por teclado e em telas pequenas para acessar os cursos no meu dispositivo.

- [ ] Validar navegação por teclado, foco, rótulos, iframe e layout responsivo.
- Fonte: PRD §5 e AGENTS.md, Qualidade e validação.
- Dada qualquer ação do fluxo home → curso → aula, quando navegar por teclado, então poderei acioná-la com foco visível.
- Dado o player, quando inspecionar seu nome acessível, então haverá um título que identifica a aula.
- Dadas telas pequenas e grandes, quando percorrer o fluxo, então texto, controles e player permanecerão utilizáveis sem sobreposição.

### US-07 — Acessar a versão publicada

Como cliente-piloto, quero acessar um endereço público para avaliar a experiência.

- [x] Registrar escolha de Vercel e endereço solicitado `https://aiflix.vercel.app` por Igor.
- [ ] Definir identidade visual.
- [ ] Publicar e validar assets, navegação direta e recarga no endereço final.
- [ ] Coletar feedback dos oito clientes-piloto e registrar resultados, sem presumir aprovação.
- Fonte: PRD §§5, 6 e 9.
- Dado o provedor escolhido, quando acessar a versão publicada e recarregar uma aula diretamente, então catálogo, navegação e player funcionarão.
- Dada a versão publicada, quando os oito clientes-piloto avaliarem o fluxo, então seus feedbacks e eventuais pendências serão registrados separadamente da validação técnica.

## Pendências e dependências

| ID | Pendência | Responsável pela decisão ou insumo | Impacto |
|---|---|---|---|
| P-01 | Pesquisa/curadoria de referências iBest, confirmação de canais e decisão sobre uso editorial ou embed; depois metadados e vídeos válidos | DevSquad / curadoria e Igor / produto | Bloqueia preparação dos três módulos; meta original de cobertura continua separada |
| P-02 | Liberar alias solicitado ou escolher endereço definitivo | Igor / root DevSecOps | Conta e publicação verificadas; somente aiflix.vercel.app bloqueado por alias_in_use |
| P-03 | Domínio e identidade visual | Igor | Bloqueia fechamento da apresentação de lançamento |
| P-04 | Coleta e registro do feedback dos oito pilotos | Igor / produto | Bloqueia comprovação da métrica de feedback |

## Fases futuras

- 002 — Evoluir progresso e continuação de aula; especificar antes de implementar.
- 003 — Busca e filtros.
- 004 — Landing por trilha e SEO.
- 005 — Contas e progresso em nuvem, com decisão de backend.
- 006 — Certificados e gamificação.
- 007 — Administração e learn paths; novo escopo priorizado, contrato em specs/007-admin-learn-paths.md.

## Evidências exigidas para conclusão do MVP

Registrar testes de lógica relevante, verificação manual do fluxo, estados de erro, persistência após recarga, acessibilidade, telas pequenas e grandes, teste no endereço publicado, catálogo real e tempo editorial observado. Resultados ainda não executados devem permanecer pendentes. Esta documentação não constitui evidência de implementação ou aceite dos pilotos.

## Ajuste da página inicial — 14/11/2026

- VIS-01 — Concluída por root: remover legenda redundante acima do título e CSS sem uso, após revisão do alerta `hero-eyebrow-chip`. Sem supressão do alerta. Validação: ausência da classe no HTML e CSS; atualização publicada via Git.

## Endereço alternativo — 14/11/2026

- INF-05 — Parcial, root / DevSecOps: alias `iaflix.vercel.app` criado e confirmado no projeto atual, apontando ao deployment `dpl_94H9FbLZ3xjoDKwhps8zyKxKAexU`. Acesso anônimo retorna HTTP 302 para login Vercel. Tentativa de adicionar como domínio permanente retornou HTTP 409 `owned-on-other-team`, apesar de o alias consultado apontar ao projeto correto. Publicação aberta e associação permanente pendentes de resolver essa inconsistência; não declarar URL pública funcional.

## Implementação autorizada — 14/11/2026

| ID | Pedido / tarefa | Status | Agente responsável / executor | Dependência e evidência |
|---|---|---|---|---|
| IMP-01 | Validar escopo e aceite dos primeiros cursos e administração | concluída | devsquad-po / scope | docs/aceite-implementacao.md |
| IMP-02 | Definir implementação concreta administrativa | concluída | devsquad-architect / architecture | ADR 0003 e contrato OpenAPI |
| IMP-03 | Implementar catálogo, aulas e progresso | concluída (técnica local) | devsquad-frontend / frontend | public/ e 7 testes Node; QA em andamento |
| IMP-04 | Implementar autorização, rascunhos e publicação compartilhada | concluída (código/testes locais); produção bloqueada | devsquad-backend / backend | IMP-02; configuração segura de produção |
| IMP-05 | QA funcional e segurança | concluída (escopo técnico local) | devsquad-qa / qa | IMP-03/04 |
| IMP-06 | Review final | concluída | devsquad-reviewer / review | docs/review-implementacao.md: APROVADO para público com admin fechado |

Conteúdo de terceiros aguarda decisão editorial consultada pela raiz; não confundir proposta de curadoria com conteúdo publicado.

- CUR-02 — Concluída por decisão explícita de Igor em 14/11/2026: “Sim, usar vídeos externos com autoria e links”. CUR-01/CNT-01 passam à seleção e verificação de vídeos gratuitos; autoria e link original serão exibidos no catálogo.

- INF-06 — Concluída por root / DevSecOps: repositório privado `igorferreira/aiflix-editorial` inicializado com snapshot validado de três cursos e um caminho, commit `ca2b6d1bea5f9507702632eca1a1233bccd6ca81`. Token de operador não reutilizado pelo aplicativo.
- ADM-CONFIG — Bloqueada: token fine-grained do repositório privado, senha/segredo administrativos e proteção durável de tentativas de login ainda precisam de provisionamento seguro pela raiz. Nenhum administrador está habilitado em produção.

## Resultado técnico desta implementação

QA APROVADO no escopo local: 18 testes Node, 32 verificações de browser e integração de handlers reais com armazenamento GitHub substituto isolado (quatro gravações). Review APROVADO para publicação do catálogo e administração fechada por configuração. Evidências: `docs/qa-implementacao.md` e `docs/review-implementacao.md`.

Três cursos curtos, três módulos e três aulas externas de Diogo Cortiz cadastrados com título, duração, autoria e links originais verificados pela raiz. A meta original de seis cursos/trilhas, reprodução real dos vídeos, fullscreen, auditoria completa de acessibilidade, medição editorial, persistência remota administrativa e aceite dos pilotos permanecem pendentes. Não marcar o produto inteiro como concluído.

## Refinamento visual solicitado — 14/11/2026

- VIS-02 — Implementada e QA aprovado, devsquad-frontend / frontend: Igor solicitou “O layout deve ser similar a netflix”. Aplicar experiência de streaming com fundo escuro, acento vermelho, destaque de curso real e CTA assistir, cartões 16:9 e carrosséis horizontais. Preservar acessibilidade e administração; não copiar marca ou assets Netflix, não inventar capas. QA de fluxos e larguras 320/768/1440 e review antes da publicação.

- INF-05 — Atualização concluída pela raiz: alias `https://iaflix.vercel.app` agora retorna HTTP 200 sem login Vercel, após desativar proteção de deployment do aplicativo público. O conflito anterior de associação permanente permanece como histórico; alias é apontado manualmente ao deployment escolhido. Isso não habilita nem substitui autenticação administrativa, que continua fechada sem configuração.

- VIS-02-QA — Concluída, devsquad-qa / qa: regressão final com 60 verificações browser em 320/768/1440. Capas reais carregadas em 16:9, CTA Assistir agora acionado por teclado abre primeira aula, carrosséis e fluxos anteriores aprovados. Backend inalterado; review visual final aprovado.

- VIS-02-REV — Concluída, devsquad-reviewer / review_streaming: APROVADO sem bloqueantes para publicar catálogo com administração fechada. Relatório `docs/review-layout-streaming.md`; backend inalterado.

## Resultado de publicação — cursos e layout de streaming

- DEP-02 — Concluída por root / DevSecOps: aplicação commit `fcf1363`, deployment `dpl_9NrpCH92SS9UgXoK22goEuxwo2ed` READY em https://iaflix.vercel.app. HTTP200 para frontend, catálogo, script e capa; smoke real confirmou CTA, iframe esperado e conclusão persistente. Evidência: docs/publicacao-2026-11-14.md.
- ADM-PROD — Bloqueada por configuração externa; root / DevSecOps aguarda token restrito por cartão seguro, credenciais administrativas e proteção durável de login. API503 confirmada, sem simular gravação. Código local aprovado não comprova administração ativa na produção.
- CNT-PLAYBACK — Planejada para devsquad-qa: validar reprodução e fullscreen reais das três aulas. Metadados, URLs e duração foram confirmados; não declarar reprodução validada apenas pelo iframe.

- VIS-03 — Concluída por root: revisão dos três alertas impeccable em styles.css; removidas bordas decorativas de avisos, erros e capa fallback. Texto, contraste de fundo, semântica de erro e foco preservados. Nenhuma supressão.

## Revisão de camadas e manutenção — 14/11/2026

| ID | Pedido / tarefa | Status | Agente responsável / executor | Dependência e evidência |
|---|---|---|---|---|
| MAN-01 | Analisar fronteiras de UI, aplicação, transporte e domínio | concluída | devsquad-architect / architecture | Código atual; preservar contratos e aparência |
| MAN-02 | Refatorar apenas fronteiras com acoplamento comprovado | concluída | devsquad-lead / review_layers_maintenance | MAN-01; sem framework ou abstrações genéricas |
| MAN-03 | QA de regressão após refactor | concluída | devsquad-qa / qa | Catálogo, rotas, progresso, admin e falhas |
| MAN-04 | Review final de manutenção | concluída | devsquad-reviewer / review | MAN-03 aprovado; publicação pela raiz |

Aceite: comportamento público e administrativo preservado; HTTP administrativo e renderização separados do bootstrap quando justificado; contratos e gate seguro503 mantidos; nenhuma dependência de produção nova; testes e análise registrados em docs/revisao-camadas.md.

Resultado MAN-01–04: arquitetura revisada, extração frontend concluída, QA APROVADO (19 testes Node,60 verificações browser,4 gravações integração com GitHub substituto), review APROVADO. Evidências: docs/revisao-camadas.md, docs/qa-camadas.md e docs/review-camadas.md. Publicação desta revisão fica com root; não confundir testes locais com administração remota ativa.

- MAN-05 — Concluída por root / DevSecOps: revisão publicada em https://iaflix.vercel.app, commit `3a1f82e`, deployment `dpl_6bebpRptCwxCpYueZbpHeeY35D1H` READY. Smoke remoto confirmou curso/player, novos módulos HTTP200, admin503 esperado e zero erros JavaScript. Evidência: docs/revisao-camadas.md. Credenciais administrativas continuam pendentes.

## Cursos por assunto e histórico YouTube

- TOP-01 — Concluída (estrutura) por root: área “Assuntos de IA em foco”, cursos Harness, Gerência de contexto, Memória e Agentes, independentes, com estado explícito de preparação até receber vídeos reais.
- TOP-02 — Backlog, adiada explicitamente por Igor em 15/11/2026; root / curadoria (previsto): buscar vídeos assistidos na conta de Igor. Preview indisponível (`available:false`), runtime de navegador retornou `No browser is available` e lista de navegadores vazia. Não houve acesso ao histórico nem seleção de vídeos assistidos. Aguardando navegador conectado ou links fornecidos pelo usuário.
- TOP-03 — Backlog, adiada junto à busca no histórico; root / curadoria (previsto): validar autoria, URL, duração e tema dos vídeos recebidos; associar a cada curso e publicar. Não substituir o histórico pessoal por buscas públicas nem apresentar os quatro assuntos como ranking verificado.

Validação TOP-01: 20 testes Node passaram; sintaxe do app conferida; deployment `dpl_Dc1w7YDcmmTMDu2eJgpq7DtK8JV2` READY (commit `5f95acb`), alias https://iaflix.vercel.app atualizado. Catálogo remoto HTTP200 confirmou quatro cursos em preparação e preservou os três cursos com aulas. Sem navegador conectado, verificação visual e leitura do histórico permanecem pendentes.

## UX, capas e compartilhamento — 15/11/2026

- SHARE-01 — Concluída por course_sharing: sete páginas HTML por curso com URLs próprias sem hash, canonical, Open Graph/Twitter Card e estado editorial real. Evidência: scripts/generate-course-pages.mjs e public/cursos/.
- SHARE-02 — Concluída por course_sharing: helper de link direto e compositor WhatsApp; integração na UI pela agente UX. Não envia mensagens.
- SHARE-03 — Concluída por course_sharing: build Vercel regenera páginas do catálogo e servidor local resolve diretórios index.html, preservando isolamento de public. Testes de compartilhamento e segurança: 24 testes Node aprovados.
- SHARE-04 — Planejada para root / QA: verificar PNG1200x630 finais, respostas públicas das sete páginas/imagens e metadados na publicação. Prévia real e cache do WhatsApp ainda não conferidos.
- UX-REVIEW — Em andamento por ux_brand_covers: revisão de layout, logo e controles de compartilhamento, conforme pedido de Igor.
- COURSE-COVERS — Em andamento por root: capas próprias dos sete cursos, sem afirmar aulas publicadas nos cursos em preparação.

Histórico do YouTube: trabalho mantido no backlog a pedido explícito de Igor. Não buscar vídeos ou credenciais nesta entrega de UX/compartilhamento.

## Fechamento de UX e capas

- UX-CAPAS — Concluída por root: sete ilustrações originais geradas com imagegen, composição tipográfica e marca exportadas em PNG1200x630, uma para cada curso. Cursos sem aulas mostram “Em preparação”. Catálogo usa todas as novas capas; imagens originais dos vídeos foram preservadas.
- UX-VALIDACAO — Concluída por agente UX e reviewer: 56 verificações de UX/browser, 25 testes Node finais e review aprovado sem bloqueantes. Ver docs/ux-revisao.md e docs/review-ux-sharing.md. Compartilhamento apenas abre compositor; não envia mensagem. Prévia/cache reais do WhatsApp não testados.

- SHARE-PROD — Concluída por root / DevSecOps: sete links diretos e sete PNG1200x630 publicados, deployment `dpl_8Vv1L2SvRzgmMk643Jv8KcXvhVRy` READY, alias https://iaflix.vercel.app. HTTP200, MIME, dimensões reais e metadados conferidos; crawler simulado recebeu OG estático no alias. Evidência docs/compartilhamento.md. Sem envio de WhatsApp ou confirmação de cache no app real.
