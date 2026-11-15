# Spec 007 — Administração e caminhos de aprendizagem

> Versão: v1 · Data: 14/11/2026 · Status: requisitos solicitados incorporados; desenho técnico proposto, implementação pendente.
> Fontes: PRD v0.3, Spec 001 v2 e pedido de Igor. Priorizada antes das fases futuras 002–006.

## 1. Objetivo e limites

Administrador cria, edita, ordena e publica learn paths que referenciam cursos independentes. Aluno acessa cursos e caminhos publicados gratuitamente, sem conta e sem pré-requisitos obrigatórios. Um caminho é recomendação editorial, não liberação progressiva. Não duplicar cursos, aulas, vídeos ou progresso.

Dentro: acesso administrativo autenticado, listagem de caminhos, criação de rascunho, alteração de título/descrição, seleção e reordenação de cursos existentes, pré-visualização e publicação global. Fora: cadastro público de administradores, permissões complexas, cobrança, certificados, contas de alunos e editor de vídeos. Gestão de cursos por formulário não foi pedida; conteúdo de cursos continua no contrato JSON.

## 2. Arquitetura e decisão pendente

Frontend em HTML, CSS e JavaScript vanilla. Área pública continua estática. Publicação global requer serviço confiável que autentique administrador, autorize cada mutação, persista rascunhos e produza o snapshot público. `localStorage` pode guardar progresso do aluno, mas não é persistência editorial compartilhada nem autorização.

ADR 0002 registra a separação. Provedor de autenticação, armazenamento e executor da publicação ainda não foram escolhidos. Antes de implementar escrita, o arquiteto deve registrar a solução concreta, operação, custos, limites e proteção de sessão. Vercel é destino escolhido para frontend; isso não implica escolha automática de banco, SDK ou framework. Consultar documentação atual via Context7 ao selecionar/configurar essas integrações.

Escolher uma única autoridade editorial. Enquanto não houver serviço, catálogo versionado é a fonte manual. Ao ativar o admin, serviço publica snapshot em `data/catalog.json` de forma atômica, com uma revisão ativa. Definir no ADR de implementação como o snapshot chega ao deploy (commit ou armazenamento com geração de artefato), evitando duas fontes de verdade. Não prometer edição compartilhada só com exportação local de JSON.

## 3. Modelo

- Curso: objeto independente da Spec 001, identificado por ID estável.
- Learn path administrativo: `id`, `title`, `description`, `courseIds`, `status` (`draft` ou `published`) e `revision` inteiro positivo.
- `courseIds`: ordem editorial, sem duplicatas, somente cursos existentes; rascunho pode estar vazio; publicação exige ao menos um curso.
- Mesmos limites de IDs/textos da Spec 001. ID não muda por edição de título.
- Snapshot público contém somente `id`, `title`, `description`, `courseIds` das revisões publicadas em `learnPaths`.
- Editar caminho publicado cria rascunho; versão pública anterior permanece até publicação bem-sucedida. Publicação incrementa revisão e substitui snapshot inteiro validado. Não expor rascunhos.
- Curso não pode ser removido se referenciado em caminho publicado; corrigir referências e publicar antes. Não apagar aulas ou progresso ao mudar associação.

## 4. Contrato lógico do serviço (proposto)

Este contrato descreve comportamento esperado; endpoints ainda não existem e serão formalizados em OpenAPI antes da implementação do backend. Endereços são relativos à origem; nenhuma credencial vai para o catálogo ou repositório público.

| Operação | Entrada | Saída e regra |
|---|---|---|
| `GET /api/admin/learn-paths` | Sessão administrativa | `200` lista com revisões, estados e rascunhos; nunca acesso anônimo |
| `POST /api/admin/learn-paths` | `id`, `title`, `description`, `courseIds` | `201` rascunho validado, revisão 1; ID existente gera `409` |
| `PUT /api/admin/learn-paths/{id}` | Campos editoriais e `expectedRevision` | `200` rascunho salvo, nova revisão; `409` se versão mudou |
| `POST /api/admin/learn-paths/{id}/publish` | `expectedRevision` | `200` somente após persistência e confirmação do snapshot público; versão conflitante gera `409` |

`401` sem sessão; `403` sem permissão; `404` ID desconhecido; `422` dados inválidos com caminhos de campos; `503` persistência ou publicação indisponível. Respostas não incluem tokens, detalhes de infraestrutura ou dados de outros usuários. Se publicação demorar e exigir job, revisar contrato para `202` com acompanhamento antes de implementar; não responder sucesso definitivo antes de concluir.

## 5. Fluxo administrativo

1. Administrador acessa área e autentica pelo provedor escolhido. Apenas contas previamente autorizadas; acesso público a cursos permanece livre.
2. Lista caminhos e abre rascunho ou cria novo. UI mostra status e revisão.
3. Seleciona cursos existentes e muda ordem por botões acessíveis; arrastar não pode ser único meio.
4. Salva rascunho e visualiza sequência sem expor a usuários anônimos.
5. Publica explicitamente; UI mantém estado de gravação e só confirma após sucesso do serviço.
6. Em conflito, preserva edição local e orienta recarregar versão atual. Em falha, mantém última versão pública íntegra e permite tentar novamente sem duplicar publicação.

Rotas propostas: `#/admin`, `#/admin/caminho/<pathId>` e `#/caminho/<pathId>` público. Ocultar rotas não é controle de acesso. Nunca renderizar rascunhos a partir de endpoint público.

## 6. Segurança e qualidade

Autenticar e autorizar no servidor todas as operações administrativas; negar por padrão. Validar payload no servidor mesmo após validação no cliente. Credenciais e segredos só no servidor. Escolher proteção contra CSRF conforme mecanismo real de sessão, HTTPS, expiração e encerramento de sessão; não armazenar senha ou chave de administração no JS público. Mensagens de erro não expõem segredos. Não persistir tokens em `localStorage` por conveniência.

Manter histórico mínimo de publicação (ator administrativo, revisão, data e resultado) em armazenamento restrito, com retenção definida na decisão de implementação. Não incluir dados pessoais no snapshot público. Impedir lost update com revisão esperada; falha não pode publicar JSON parcial. Renderização segura, teclado, foco, status acessível e responsividade seguem Spec 001.

## 7. Rastreabilidade, aceite e evidências

| ID | Fonte | Critério |
|---|---|---|
| LP01 | Pedido: área administrativa | Anônimo não lê rascunhos e recebe 401 ao tentar criar/editar/publicar; autenticado sem papel recebe 403 |
| LP02 | Pedido: criar learn paths | Admin cria rascunho, edita texto e ordena cursos; recarga preserva dados compartilhados |
| LP03 | Pedido: cursos independentes | Um curso em dois caminhos mantém URL, conteúdo e progresso; curso fora de caminho continua acessível |
| LP04 | Pedido: publicação | Publicação confirmada é visível em navegador anônimo de outro perfil/dispositivo; rascunho não aparece |
| LP05 | Contrato e segurança | Duplicata, referência quebrada, HTML e payload inválido são rejeitados/escapados; não executam scripts |
| LP06 | Integridade | Edições concorrentes geram 409; falha de publicação preserva snapshot anterior íntegro |
| LP07 | Pedido: plataforma free | Aluno acessa curso e caminho sem conta, pagamento ou bloqueio por ordem |
| LP08 | Acessibilidade | Admin e aluno executam fluxo por teclado; reordenação possui botões rotulados e foco previsível |

Testar contrato e autorização no servidor, acesso anônimo, papel insuficiente, revisão concorrente, falha de persistência, publicação idempotente/repetida e snapshot sem rascunhos. Teste em dois navegadores/perfis comprova compartilhamento; teste local de UI não substitui essa evidência. QA e review de implementação permanecem pendentes.

## 8. Dependências

Decidir serviço de autenticação/persistência/publicação e administrador inicial antes da implementação de escrita. Receber URLs e metadados dos três módulos e seus cursos. Publicar infraestrutura não conclui esta spec. Frontend público pode ser publicado antes, com estado vazio honesto enquanto faltar conteúdo.

## Estado da publicação inicial — 14/11/2026

Repositório público criado: https://github.com/igorferreira/aiflix. Landing de apresentação publicada na conta Vercel de Igor em https://aiflix-topaz-nine.vercel.app. O endereço solicitado aiflix.vercel.app permanece meta bloqueada: Vercel retornou HTTP 400 `alias_in_use`. Somente `public/` é servido; arquivos de documentação ficam fora da saída estática. Esta publicação não implementa nem valida cursos, player, três módulos, progresso ou administração. Evidências: `docs/publicacao-2026-11-14.md`.

## Clarificação de conteúdo — pesquisa iBest Brasil

Igor solicitou pesquisar canais de referência de IA no iBest Brasil para orientar a preparação dos três módulos. A dependência inicial é pesquisa e curadoria, não somente recebimento de URLs de Igor. Fontes e resultados serão registrados em `docs/pesquisa-ibest-2026.md`, a partir da fonte oficial `https://app.premioibest.com/votacao/autoridade-ia`. Confirmar ano, modalidade (indicação, voto popular ou academia), colocação efetivamente publicada e canais YouTube de cada referência. TOP10 não estabelece ordem entre nomes nem comprova qualidade de curso.

Decisão editorial resolvida: Igor autorizou incorporar vídeos externos com autoria e links, conforme registro abaixo. Essa autorização não dispensa curadoria, atribuição e verificação de disponibilidade. Antes de publicar, confirmar seleção, autoria, condições aplicáveis, disponibilidade e associação de aulas aos módulos e cursos. Tarefas CUR-01, CUR-02 e CNT-01 rastreiam essa dependência.

## Decisão editorial aprovada — 14/11/2026

Igor autorizou explicitamente: “Sim, usar vídeos externos com autoria e links”. O catálogo pode incorporar vídeos gratuitos de terceiros disponíveis no YouTube, com atribuição clara ao autor e links originais. O aiflix organiza a sequência; não reivindica autoria dos vídeos. Não baixar, republicar arquivos ou contornar bloqueio de incorporação. Fontes e metadados devem ser verificáveis; popularidade no iBest não comprova qualidade pedagógica. Esta decisão substitui as restrições anteriores a conteúdo exclusivamente próprio e resolve CUR-02; mantém curadoria, disponibilidade e atribuição como gates de publicação.

## Estado da implementação — 14/11/2026

Implementação autorizada no pedido “Devsquad Vamos virar os primeiros cursos e a área administrativa”. Código correspondente em `public/`, `api/` e `lib/`, com execução local em Node.js 24. Arquitetura concreta em ADR 0003 e contrato `specs/openapi-admin.json`. O quadro histórico de endpoints propostos acima é concretizado por esse contrato; respostas de erro usam `{error:{code,message}}`.

Catálogo inicial: três cursos curtos com um módulo e uma aula externa de Diogo Cortiz cada, autoria e links originais preservados. Não equivalem ao curso completo original nem cobrem a meta de um curso por cada uma das seis trilhas. Configuração Vercel reescreve `/data/catalog.json` para `/api/catalog`; sem integração editorial configurada há bootstrap, mas falha de storage configurado retorna indisponibilidade sem fallback silencioso.

QA técnico local aprovado em `docs/qa-implementacao.md`: 18 testes Node, 32 verificações de browser e integração de handlers com armazenamento substituto isolado. Isso não comprova persistência remota ou reprodução efetiva de YouTube. Administração permanece fechada na produção até token restrito, credenciais, origem e proteção durável de tentativas serem configurados. Review final e deploy são gates separados.
