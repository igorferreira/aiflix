# STUDY — AiFlix

Documento de **estudo** do projeto: explica **tudo o que está sendo usado** (conceitos e ferramentas, com o uso prático neste projeto) **e** registra cada passo do SDD. É o companheiro de estudo do PRD.md e das specs/.

---

## Parte A — O que é SDD (Spec-Driven Development)

**SDD** é desenvolver software a partir de **especificações escritas antes do código**. A ordem é: ideia → PRD → spec → implementação → verificação. Cada spec tem requisitos verificáveis (critérios de aceite), e só se escreve código depois que a spec é aprovada.

**Por que usar aqui:** evita construir o site no improviso, permite retomar o projeto semanas depois entendendo tudo, e cada decisão fica registrada (bom para estudar e para o Igor revisar no celular).

**Ciclo aplicado no AiFlix:**
1. **PRD** (o QUÊ e POR QUÊ) — `PRD.md`
2. **Spec** (o COMO, com critérios de aceite) — `specs/NNN-*.md`
3. **Implementação** (código)
4. **Verificação** (testar contra os critérios de aceite)
5. **Registro** (este STUDY.md, Passo NNN)

---

## Parte B — Ferramentas e conceitos usados (e como usamos)

### B1. Insync + Google Drive (onde o projeto vive)
- **O que é:** Insync sincroniza pastas locais com contas Google Drive. O projeto vive em `~/Insync/GoogleDrive/igorferreira08/Projetos/aiflix/` — tudo que salvar aqui sobe automático para o Drive da conta igorferreira08.
- **Como usamos:** é o "repositório" do projeto. Como não roda `.git` dentro do Drive, versionamos por **versão nos documentos** (v0.1, v0.2...) e backups no Drive.

### B2. PRD (Product Requirements Document)
- **O que é:** documento de produto que responde o QUÊ (visão, público, escopo) antes do COMO.
- **Como usamos:** `PRD.md` define visão, 6 trilhas, MVP e fases. Mudança de escopo entra no PRD primeiro.

### B3. Spec técnica + critérios de aceite
- **O que é:** contrato do MVP: user stories, requisitos funcionais (RF), não-funcionais (RNF) e critérios de aceite (CA) verificáveis.
- **Como usamos:** `specs/001-mvp-catalogo-player.md` — aprovada pelo Igor em 14/11/2026.

### B4. Catálogo em JSON (fonte única de dados)
- **O que é:** JSON é formato de texto estruturado que o navegador lê direto.
- **Como usaremos:** `data/catalog.json` descreve trilhas → cursos → módulos → aulas (URL do YouTube). Publicar um curso novo = editar JSON, sem tocar em código.

### B5. Embed do YouTube
- **O que é:** reproduzir um vídeo do YouTube dentro de uma página própria via `<iframe>` (`youtube.com/embed/<ID>`).
- **Como usaremos:** o player do AiFlix é um iframe do YouTube com controles próprios em volta (playlist, próxima aula). Mantém views no canal.

### B6. localStorage (progresso do aluno)
- **O que é:** armazenamento local do navegador (sobrevive a fechar/abrir, fica no dispositivo).
- **Como usaremos:** salvar aulas concluídas e posição ("Continuar assistindo"). No MVP é local — nuvem vem na fase 005.

### B7. Site estático (HTML/CSS/JS sem backend)
- **O que é:** site servido como arquivos prontos, sem servidor de aplicação. Barato, rápido, fácil de hospedar (GitHub Pages/Vercel).
- **Como usaremos:** o AiFlix MVP é 100% estático lendo o JSON no cliente.

### B8. T3 Code (onde o código será escrito)
- **O que é:** ambiente de código da máquina do Igor (servidor local + interface web). O servidor fica em `127.0.0.1:3773`; acesso de outros dispositivos via pareamento ou túnel.
- **Como usaremos:** abrir a pasta `aiflix`, terminal integrado e o Codex rodando dentro.

### B9. Codex CLI
- **O que é:** agente de código da OpenAI em linha de comando (`codex`), que lê o projeto, propõe e aplica mudanças.
- **Como usaremos:** terminal do T3 Code aberto em `aiflix/` rodando `codex` para implementar a Spec 001 com supervisão do Igor.

---

## Parte C — Log dos passos do SDD

### Passo 001 — 14/11/2026 03:26 BRT · Iniciação
- **Pedido:** pasta no Insync (igorferreira08/Projetos), ignorar `.git`, PRD.md, seguir SDD, replicar passos aqui.
- **Feito:** pasta criada; `.insync-ignore` com `.git/`; `PRD.md` v0.1; `specs/001-mvp-catalogo-player.md` DRAFT; registro inicial deste STUDY.
- **Decisões:** codinome IAFLIX (provisório).
- **Estudo relacionado:** B1, B2, B3.

### Passo 002 — 14/11/2026 03:30 BRT · Nome oficial + spec aprovada
- **Pedido/decisão do Igor:** nome oficial **aiflix**; Spec 001 **aprovada**; STUDY.md deve explicar o uso de tudo (este documento foi reescrito: Partes A/B/C).
- **Feito:** pasta renomeada `iaflix` → `aiflix`; PRD atualizado para v0.2 (nome oficial); STUDY.md reestruturado como documento de estudo.
- **Próximo passo (003):** criar `data/catalog.json` com 1 curso de exemplo por trilha + primeiro `index.html` estilo Netflix (spec aprovada, D1 resolvido: JSON lido no cliente).
- **Estudo relacionado:** B4, B5, B6, B7.

---

<!-- Formato de cada passo:
### Passo NNN — AAAA-MM-DD HH:MM BRT · <título>
- Pedido/decisão:
- Feito:
- Decisões:
- Próximo passo:
- Estudo relacionado: Bn...
-->

### Passo 003 — 14/11/2026 · Especificação técnica pelo DevSquad

- **Pedido:** detalhar a especificação técnica com HTML, JavaScript vanilla e CSS; framework apenas se necessário, com indicação do arquiteto.
- **Artefatos:** revisão técnica v1 em `specs/001-mvp-catalogo-player.md`, decisão em `docs/adrs/0001-frontend-estatico.md` e backlog em `TASKS.md`.
- **Stack proposta:** arquivos estáticos, módulos JavaScript nativos e CSS; sem framework, backend ou build obrigatório.
- **Catálogo:** JSON permanece como fonte única. Conteúdo real depende de vídeos próprios fornecidos e verificados antes da publicação.
- **Revisões em relação ao registro anterior:** a leitura do JSON exige servir o site por HTTP(S), inclusive localmente; abrir `index.html` por `file://` não é critério de aceite. Progresso básico registra conclusão manual de aulas; posição em segundos e retomada automática pertencem à evolução da fase 002.
- **Status:** especificação técnica proposta para revisão de Igor. A aprovação histórica da v0.1 não implica aprovação automática das alterações da v1. Nenhum aplicativo ou deploy foi implementado neste passo.
- **Estudo relacionado:** B3, B4, B5, B6 e B7. Os trechos anteriores documentam o entendimento histórico; para o contrato técnico atual, consulte a revisão v1 da Spec 001.


### Passo 004 — 14/11/2026 · Ampliação de escopo e gestão por agentes

- **Pedido:** GitHub público, publicação na conta Vercel de Igor em aiflix.vercel.app, tarefas com status e agente, três módulos de cursos, cursos independentes, administração de learn paths e plataforma gratuita para qualquer pessoa aprender IA.
- **Documentação:** PRD v0.3, Spec 001 v2, Spec 007 v1, ADR 0002 e TASKS v2. ADR 0001 continua aplicável ao leitor público.
- **Conceito:** curso é entidade independente; trilhas e caminhos referenciam IDs ordenados. Caminho recomenda sequência sem impedir acesso livre. Conclusão permanece por ID de aula, evitando perda por mudança editorial.
- **Administração:** exige autenticação e autorização no servidor para publicar globalmente. HTML/JS/CSS continuam na interface; provedor do serviço permanece decisão técnica pendente.
- **Conteúdo:** três módulos foram pedidos como meta; títulos, curso de destino e vídeos não foram fornecidos. Não representam três cursos nem substituem automaticamente a meta original de seis trilhas.
- **Infraestrutura:** execução sob responsabilidade da raiz/DevSecOps, com evidências a registrar em TASKS. Esta revisão documental não prova repositório criado nem deploy. URL solicitada será confirmada após verificar disponibilidade e HTTPS.
- **Correção de leitura histórica:** B3 registra aprovação antiga, não aprovação automática de todas as revisões. B4 descreve schema antigo; schema atual normaliza cursos na raiz. B6 contém retomada futura, fora da Spec 001. B7 descreve leitor público; escrita administrativa é escopo novo separado.

- **Resultado de infraestrutura informado e evidenciado pela raiz:** GitHub público criado; landing READY em https://aiflix-topaz-nine.vercel.app, HTTP 200 e comparação local confirmada. Alias solicitado bloqueado por `alias_in_use`. Evidência detalhada em `docs/publicacao-2026-11-14.md`; nenhuma funcionalidade de cursos/admin foi concluída pelo bootstrap.

- **Clarificação posterior de conteúdo:** pesquisar referências de IA no iBest Brasil para curadoria dos três módulos. Registro em `docs/pesquisa-ibest-2026.md`; CUR-01/02 antecedem CNT-01. Confirmar canais e modalidade/ano, sem inventar ranking. Uso editorial versus embed de terceiros permanece decisão pendente; não presumir direitos ou abandono de conteúdo próprio.

## Passo 005 — Implementação de cursos e administração

Em 14/11/2026, Igor autorizou implementação pelo DevSquad e depois o uso de vídeos externos com autoria e links. PO registrou aceite, arquiteto definiu Vercel Functions e estado editorial privado no GitHub, frontend e backend implementaram sem framework. Catálogo inicial contém três recortes independentes da sequência de Diogo Cortiz com metadados confirmados pela raiz. QA técnico local aprovou 18 testes Node, 32 verificações de browser e integração HTTP real com GitHub substituto; review e publicação verificados separadamente. Token/segredos/rate limit de produção são bloqueios externos e não serão simulados como administração pronta.
