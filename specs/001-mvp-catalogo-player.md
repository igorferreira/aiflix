# Spec 001 — aiflix: catálogo e player

> Versão: v2.1 · 14/11/2026 · Status: revisão técnica proposta para aprovação de Igor.
> Fontes: PRD.md v0.3, AGENTS.md e solicitação de HTML, JavaScript vanilla e CSS.

## 1. Objetivo e histórico

Entregar gratuitamente catálogo de cursos próprios e independentes de IA, organizado em trilhas e learn paths opcionais, com aulas no YouTube e conclusão local por aula. Esta revisão substitui o texto DRAFT v0.1 deste arquivo; a aprovação histórica registrada em STUDY.md refere-se à versão anterior, não aprova automaticamente esta revisão.

A versão anterior citava nome provisório, dados de exemplo, abertura por `file://` e continuação de reprodução. Nesta revisão: nome oficial `aiflix`; lançamento com conteúdo real; desenvolvimento por HTTP local; progresso básico por conclusão manual. Retomada de posição e “Continuar assistindo” ficam para Spec 002, conforme AGENTS.md. A v2 incorpora o pedido posterior de gratuidade, cursos independentes, GitHub público, Vercel e integração com administração de learn paths na Spec 007. Não registra aprovação inexistente da revisão anterior.

Fora do escopo do leitor público: login de alunos, backend de escrita, banco de dados, cobrança, busca, certificados, gamificação, nuvem, aplicativo móvel, hospedagem de vídeos e rastreamento automático do player.

## 2. Decisão de arquitetura

HTML semântico, CSS responsivo e JavaScript vanilla com módulos nativos. Sem framework, bundler ou dependência de produção: o MVP tem catálogo somente leitura, poucos estados de navegação e armazenamento local simples. Framework não resolve necessidade atual suficiente para justificar instalação e build. Reavaliar mediante requisito concreto; registrar nova ADR antes de mudar stack.

Fluxo: carregar JSON → validar catálogo → ler progresso com tolerância a falhas → resolver rota → renderizar DOM → registrar eventos. A troca de aula substitui o iframe para interromper reprodução anterior. Catálogo é carregado uma vez por abertura; falha permite tentar novamente.

O leitor da Spec 001 consome somente o catálogo público. A API administrativa pertence à Spec 007; o contrato abaixo é o snapshot público. O contrato de integração é o JSON abaixo. Não usar SDK nem IFrame Player API no MVP. Integração é iframe e link externo; não inferir reprodução ou conclusão pelo carregamento do iframe.

### Arquivos alvo e bootstrap existente

| Arquivo | Responsabilidade |
|---|---|
| `public/index.html` | Documento pt-BR, cabeçalho, navegação, região principal e mensagem sem JavaScript |
| `public/styles.css` | Layout, cartões, carrosséis, foco, contraste e adaptação de telas |
| `public/assets/js/app.js` | Inicialização, estado público, rotas hash e renderização pública |
| `public/assets/js/admin.js` | Tela e formulário administrativos; callbacks explícitos para navegação e atualização de catálogo |
| `public/assets/js/admin-api.js` | Transporte HTTP administrativo, cookies e erros, sem DOM |
| `public/assets/js/ui.js` | Helpers DOM compartilhados, sem estado global |
| `public/assets/js/catalog.js` | Leitura, validação e consulta do catálogo; extração segura do ID YouTube |
| `public/assets/js/progress.js` | Leitura/gravação tolerante a erros e cálculo de conclusão |
| `public/data/catalog.json` | Fonte única editorial de trilhas, cursos, módulos e aulas |
| `public/assets/images/` | Capas opcionais; fallback visual local sem imagem |
| `tests/` | Casos de contrato, rotas, URLs e armazenamento; fixtures isoladas do catálogo publicado |

Separar apenas essas responsabilidades. Não criar camadas de serviços, componentes genéricos ou infraestrutura sem necessidade. Somente `public/` integra a saída do deploy; documentos e testes ficam fora. Os caminhos `data/catalog.json` e `assets/` neste contrato são relativos à raiz pública e correspondem a `public/data/catalog.json` e `public/assets/` no repositório. Já existe bootstrap em `public/index.html` e `public/styles.css`, sem catálogo/player/admin. A implementação pode aproveitar esses arquivos sem duplicar estilos. Todos os caminhos de recursos e fetch devem ser relativos à pasta de `index.html`, permitindo publicação em subdiretório.

## 3. Contrato de `data/catalog.json`

Campos definidos abaixo são obrigatórios, exceto `cover`. Objetos não aceitam campos desconhecidos na versão 2; versão não suportada deve produzir erro claro, sem renderização parcial. A ordem dos arrays define ordem editorial.

| Objeto | Campos e restrições |
|---|---|
| Raiz | `schemaVersion`: inteiro igual a 2; `courses`, `tracks` e `learnPaths`: arrays, podem ser vazios |
| Trilha | `id`, `title`, `description`: strings; `courseIds`: array de IDs de cursos existentes, sem duplicatas, pode ser vazio |
| Learn path publicado | `id`, `title`, `description`: strings; `courseIds`: array não vazio de IDs de cursos existentes, sem duplicatas; ordem define sequência recomendada |
| Curso | `id`, `title`, `description`: strings; `cover`: caminho relativo opcional sob `assets/images/`, sem `..`; `modules`: array não vazio |
| Módulo | `id`, `title`: strings; `lessons`: array não vazio |
| Aula | `id`, `title`, `description`: strings; `durationSeconds`: inteiro positivo; `youtubeUrl`: string HTTPS válida; `materials`: array, pode ser vazio |
| Material | `title`: string; `url`: URL HTTPS absoluta, sem credenciais embutidas |

IDs devem corresponder a `[a-z0-9]+(?:-[a-z0-9]+)*`, com 1 a 80 caracteres. IDs de cada tipo são únicos em todo o catálogo. IDs de aulas são imutáveis e independentes do título, ordem e vídeo. Não reutilizar ID removido para outro conteúdo. Textos devem ser não vazios após trim, exceto descrições que podem ser vazias. Limites: título 160 caracteres; descrição 4000; URL 2048. Campos inválidos rejeitam o catálogo inteiro com diagnóstico do caminho, por exemplo `courses[0].modules[0].lessons[0].youtubeUrl`.

Aceitar URLs de aula apenas com protocolo HTTPS, sem usuário/senha e hosts exatos `youtube.com`, `www.youtube.com` ou `youtu.be`. Formas: `/watch?v=<ID>` nos dois primeiros hosts ou `/<ID>` no último. ID deve ter 11 caracteres `[A-Za-z0-9_-]`. Outros caminhos/hosts são rejeitados; parâmetros extras não alteram o embed e não são repassados. Construir URL canônica de reprodução a partir do ID validado. Não aceitar HTML de embed no catálogo.

Conteúdo de teste pode usar fixtures explicitamente fictícias. Não publicar URLs inventadas como cursos reais. O lançamento de conteúdo exige vídeos próprios previamente disponíveis e permissão para embed verificada manualmente. As seis trilhas e a meta de um curso por trilha permanecem objetivos originais; a nova entrega de três módulos aguarda conteúdo e vinculação, não a substitui. Deploy técnico pode apresentar catálogo vazio com estado honesto, sem representar lançamento de cursos.

## 4. Navegação e interface

| Rota hash | Estado |
|---|---|
| `#/` ou hash vazio | Home com todas as trilhas, uma seção por trilha |
| `#/caminho/<pathId>` | Learn path publicado e seus cursos na ordem recomendada, todos acessíveis diretamente |
| `#/curso/<courseId>` | Detalhes, descrição e módulos com lista ordenada de aulas |
| `#/curso/<courseId>/aula/<lessonId>` | Detalhes do curso, player, aula atual, materiais e lista de aulas |

IDs são validados antes da busca. Aula deve pertencer ao curso da rota. Rotas desconhecidas, IDs inexistentes e hashes malformados exibem “Conteúdo não encontrado” com link para home. Recarregar rota profunda e usar voltar/avançar deve preservar a tela correta sem rewrite do servidor. Abrir curso não inicia aula automaticamente; selecionar aula abre sua rota. Link para curso permanece disponível no player.

Home inclui acesso ao catálogo completo de cursos independentes, mesmo sem trilha ou learn path, e carrossel horizontal por trilha, rolável por toque, teclado e botões anterior/próximo com nome acessível. Não há rotação automática. Trilha sem cursos mostra estado vazio; catálogo vazio mostra mensagem geral. Cartão apresenta título, descrição curta, quantidade de aulas, duração total e progresso. Capa é opcional; não exigir imagem para adicionar curso somente por JSON.

Página de curso apresenta título, descrição, duração total e progresso; módulos apresentam aulas com título, duração e estado concluído. Aula atual é identificada visualmente e para tecnologia assistiva. Player usa proporção 16:9, controles nativos do YouTube e permissão de tela cheia. Sem autoplay. O link “Abrir no YouTube” fica sempre visível: a página não detecta de forma confiável bloqueio ou indisponibilidade dentro do iframe entre origens.

## 5. Progresso básico

Conclusão é ação explícita do aluno: “Marcar como concluída”, reversível com “Marcar como não concluída”. Assistir, selecionar ou terminar carregamento do vídeo não marca conclusão. Percentual do curso = `floor(100 × aulas concluídas existentes / total de aulas existentes)`. Contagem e cálculo ignoram IDs ausentes do catálogo, sem apagar automaticamente o registro armazenado.

Chave única `aiflix.progress.v1`, valor JSON `{ "version": 1, "completedLessonIds": [] }`. Array contém somente strings de IDs válidos, sem duplicatas. Não armazenar posição, dados pessoais, vídeo visto ou credenciais. Validar versão e formato na leitura; falha usa estado em memória vazio e informa indisponibilidade de persistência. Não apagar nem sobrescrever automaticamente valor corrompido ou de versão desconhecida. A ação manual posterior pode gravar novo estado versão 1, com aviso prévio de que substituirá o registro ilegível.

Acesso e gravação podem falhar; capturar exceções. Se gravação falhar, manter ação na sessão e informar “Progresso disponível apenas nesta sessão”. Refresh não é prometido nesse caso. Na leitura válida, preservar IDs conhecidos e desconhecidos. Estado é local à origem, navegador e perfil; limpeza de dados, outro dispositivo ou mudança de domínio não preserva progresso. Sem sincronização entre abas no MVP; última gravação prevalece, limitação a informar na documentação de uso.

## 6. Segurança, acessibilidade e erros

Renderizar textos com DOM e `textContent`, nunca HTML vindo do catálogo. Iframe recebe apenas URL construída com ID validado; título inclui nome da aula. Links externos abertos em nova aba usam `rel="noopener noreferrer"` e aviso acessível. Sem scripts inline ou eventos HTML inline. Não coletar telemetria, cookies próprios ou dados pessoais; o player é serviço externo e sua reprodução depende das políticas do YouTube. Headers de segurança específicos serão definidos na implementação para Vercel, sem alegar CSP aplicada antecipadamente.

Documento com `lang="pt-BR"`, landmarks, hierarquia de títulos e link de pular para conteúdo. Controles são botões/links nativos, foco visível e ordem lógica. Mudança de tela atualiza título da página e move foco para título principal; alteração de conclusão mantém foco no botão e anuncia estado em região de status. Contraste mínimo de texto normal 4,5:1; controles 3:1. Respeitar redução de movimento. Tela de 320px não deve ter overflow horizontal global; apenas carrosséis podem rolar.

| Falha | Resposta esperada |
|---|---|
| Rede, HTTP não sucesso, JSON inválido ou contrato inválido | Mensagem de catálogo indisponível, botão tentar novamente; detalhes técnicos no console sem dados pessoais |
| Dados válidos vazios | Mensagem de ausência de conteúdo, sem simular cursos |
| Rota inválida | Estado não encontrado com retorno à home |
| Imagem ausente | Fallback visual, mantendo texto e navegação |
| YouTube bloqueado/removido | Link externo sempre disponível; não prometer recuperar vídeo removido |
| Armazenamento bloqueado/corrompido | Reprodução e navegação funcionam; aviso de progresso temporário |
| JavaScript desabilitado | Mensagem `noscript` explicando necessidade para catálogo interativo |

## 7. Matriz de rastreabilidade e aceite

Todos os critérios abaixo estão pendentes de execução; a existência desta especificação não comprova funcionamento.

| ID | Fonte | Critério verificável |
|---|---|---|
| CA01 | PRD §3, §5 | Dado catálogo válido, home renderiza cursos independentes e trilhas por referências, sem duplicar entidades; preserva ordem editorial |
| CA02 | PRD §4, §5 | Ao abrir curso e selecionar aula, módulos, duração, descrição e materiais correspondem ao catálogo |
| CA03 | PRD §1, §4 | Aula válida produz iframe correto; usuário reproduz e aciona tela cheia; link externo permanece disponível |
| CA04 | PRD §5; AGENTS progresso | Marcar e desmarcar aula atualiza contador/percentual; recarregar mantém estado quando armazenamento funciona |
| CA05 | PRD §3, §9 | Editor adiciona curso e nova trilha somente no JSON, sem tocar JS/HTML/CSS; medir publicação de curso em menos de 30 minutos |
| CA06 | PRD §6; AGENTS hospedagem | Servir por HTTP na raiz e em subdiretório: assets, JSON, deep link, reload e voltar/avançar funcionam |
| CA07 | AGENTS qualidade | Fluxos completos acessíveis por teclado, foco visível, nomes acessíveis e contraste verificado |
| CA08 | AGENTS qualidade | Validar em larguras 320px, 768px e 1440px; player e carrosséis utilizáveis sem overflow global |
| CA09 | PRD §8; AGENTS erros | Exercitar cada falha da seção 6 e confirmar recuperação ou fallback descrito |
| CA10 | PRD §9 | Registrar separadamente deploy técnico, três módulos reais verificados e cobertura original de seis trilhas; não declarar um gate concluído por outro |
| CA11 | PRD §9 | Registrar feedback dos oito clientes-piloto; não substituir aceite de negócio por testes técnicos |
| CA12 | AGENTS segurança | URLs maliciosas, IDs duplicados e strings HTML não executam código; catálogo inválido é rejeitado |

### Plano de testes

Automatizar funções puras de contrato, extração de ID YouTube, resolução de rotas e cálculo de progresso. Testar armazenamento com substituto que lança exceções e valores corrompidos. Casos incluem hosts parecidos, `javascript:`, URL com credenciais, IDs duplicados, array vazio, versão desconhecida, progresso com IDs removidos e marcação reversível. Usar recursos nativos do ambiente escolhido para testes; dependência de testes só se necessária, sem torná-la dependência de produção.

Executar manualmente os fluxos CA01–CA09 no navegador de desenvolvimento e registrar navegador/versão, largura, resultado e evidência. Na publicação, repetir CA03 e CA06 na URL real. Verificar disponibilidade dos vídeos manualmente, pois formato válido não prova existência ou direito de uso. Conteúdo, deploy e piloto são gates separados.

## 8. Publicação e pendências

Servir arquivos por HTTP(S), inclusive localmente: abrir `index.html` por `file://` não faz parte do aceite por depender de carregamento JSON. Não é necessário build. A escolha do servidor local e comandos específicos será documentada na implementação após verificar ferramentas disponíveis.

Publicar repositório público no GitHub e frontend na conta Vercel de Igor. Endereço solicitado: `https://aiflix.vercel.app`; verificar disponibilidade, TLS e resposta no endereço efetivo antes de declarar sucesso. Identidade visual continua pendente. Confirmar origem externa do versionamento e método de sincronização/publicação sem criar `.git` nesta pasta do Drive. Não guardar tokens no catálogo ou arquivos publicados.

Pendências de produto: aprovação desta revisão, conteúdo real das seis trilhas, capas opcionais e visual definitivo. Pendências técnicas: implementação, testes, documentação de execução e validação do host escolhido. Aguardar essas decisões não impede implementar o núcleo estático após aprovação da spec.

## 9. Delta v2 — cursos independentes e gratuidade

O curso existe uma única vez em `courses`; trilhas e learn paths referenciam IDs. Curso pode pertencer a zero ou vários agrupamentos. Não há matrícula, pagamento ou pré-requisito obrigatório. IDs das aulas e chave de progresso permanecem estáveis, independentemente de associação ou reordenação. Rejeitar referência quebrada e duplicata de curso em um mesmo agrupamento. IDs de trilhas e learn paths são únicos dentro de seus respectivos tipos.

A alteração estrutural é `schemaVersion: 2`. Nenhum catálogo foi implementado ou migrado nesta entrega. Se aparecer arquivo v1 durante a implementação, converter por procedimento explícito e preservar IDs; não interpretar v1 silenciosamente como v2. Rascunhos administrativos nunca são incluídos em `data/catalog.json`. Esse arquivo é a única fonte de leitura pública; a publicação da Spec 007 gera atomicamente um snapshot validado, sem edição paralela por duas fontes.

| ID | Fonte | Critério verificável |
|---|---|---|
| CA13 | PRD v0.3 §3, §5 | Curso sem trilha aparece no catálogo e abre por URL direta; aluno anônimo acessa sem pagamento |
| CA14 | PRD v0.3 §3 | Mesmo curso participa de dois paths sem duplicar conteúdo nem progresso; ordem não bloqueia acesso |
| CA15 | PRD v0.3 §5, §9 | Inventariar três módulos com curso de destino, aulas e vídeos reais verificados; sem inventar conteúdo |
| CA16 | Pedido de infraestrutura | GitHub confirmado público; URL Vercel efetiva registrada e validada por HTTPS, separadamente dos cursos e administração |

Testes adicionais: curso sem agrupamento; referências inexistentes; curso em múltiplos caminhos; link direto anônimo; rascunhos ausentes do snapshot; preservação de progresso após reordenação. Administração, autenticação e publicação são especificadas em `007-admin-learn-paths.md` e não estão implementadas.

## 10. Estado verificado da infraestrutura

Bootstrap publicado em `https://aiflix-topaz-nine.vercel.app`, repositório público `https://github.com/igorferreira/aiflix`. Alias desejado `aiflix.vercel.app` bloqueado por `alias_in_use`; não está sob controle confirmado desta conta. Evidências em `docs/publicacao-2026-11-14.md`. Landing não implementa catálogo, aulas, progresso ou administração e não atende os critérios funcionais desta spec.

## Clarificação de conteúdo — pesquisa iBest Brasil

Igor solicitou pesquisar canais de referência de IA no iBest Brasil para orientar a preparação dos três módulos. A dependência inicial é pesquisa e curadoria, não somente recebimento de URLs de Igor. Fontes e resultados serão registrados em `docs/pesquisa-ibest-2026.md`, a partir da fonte oficial `https://app.premioibest.com/votacao/autoridade-ia`. Confirmar ano, modalidade (indicação, voto popular ou academia), colocação efetivamente publicada e canais YouTube de cada referência. TOP10 não estabelece ordem entre nomes nem comprova qualidade de curso.

Decisão editorial resolvida: Igor autorizou incorporar vídeos externos com autoria e links, conforme registro abaixo. Essa autorização não dispensa curadoria, atribuição e verificação de disponibilidade. Antes de publicar, confirmar seleção, autoria, condições aplicáveis, disponibilidade e associação de aulas aos módulos e cursos. Tarefas CUR-01, CUR-02 e CNT-01 rastreiam essa dependência.

## Decisão editorial aprovada — 14/11/2026

Igor autorizou explicitamente: “Sim, usar vídeos externos com autoria e links”. O catálogo pode incorporar vídeos gratuitos de terceiros disponíveis no YouTube, com atribuição clara ao autor e links originais. O aiflix organiza a sequência; não reivindica autoria dos vídeos. Não baixar, republicar arquivos ou contornar bloqueio de incorporação. Fontes e metadados devem ser verificáveis; popularidade no iBest não comprova qualidade pedagógica. Esta decisão substitui as restrições anteriores a conteúdo exclusivamente próprio e resolve CUR-02; mantém curadoria, disponibilidade e atribuição como gates de publicação.

## Estado da implementação — 14/11/2026

Implementação autorizada no pedido “Devsquad Vamos virar os primeiros cursos e a área administrativa”. Código correspondente em `public/`, `api/` e `lib/`, com execução local em Node.js 24. Arquitetura concreta em ADR 0003 e contrato `specs/openapi-admin.json`. O quadro histórico de endpoints propostos acima é concretizado por esse contrato; respostas de erro usam `{error:{code,message}}`.

Catálogo inicial: três cursos curtos com um módulo e uma aula externa de Diogo Cortiz cada, autoria e links originais preservados. Não equivalem ao curso completo original nem cobrem a meta de um curso por cada uma das seis trilhas. Configuração Vercel reescreve `/data/catalog.json` para `/api/catalog`; sem integração editorial configurada há bootstrap, mas falha de storage configurado retorna indisponibilidade sem fallback silencioso.

QA técnico local aprovado em `docs/qa-implementacao.md`: 18 testes Node, 32 verificações de browser e integração de handlers com armazenamento substituto isolado. Isso não comprova persistência remota ou reprodução efetiva de YouTube. Administração permanece fechada na produção até token restrito, credenciais, origem e proteção durável de tentativas serem configurados. Review final e deploy são gates separados.

## Revisão de manutenção v2.1

Refactor sem mudança no contrato ou comportamento público: administração e transporte extraídos do bootstrap. Mapa e justificativa em `docs/revisao-camadas.md`; evidências locais em `docs/qa-camadas.md` e `docs/review-camadas.md`.

## Extensão: cursos por assunto em preparação

Pedido de Igor: cursos independentes Harness, Gerência de contexto, Memória e Agentes reunidos em uma seção por assunto. Seleção será feita a partir de vídeos assistidos na sua conta YouTube, sem publicar o histórico completo ou datas de visualização. Sem acesso ao histórico, nenhum vídeo pode ser atribuído como assistido.

Contrato schema 2 ampliado de forma aditiva: curso pode ter `status: "preparing"` e `modules: []`. Nesse estado não apresenta player, progresso, duração nem ação de assistir; mostra curadoria pendente. Cursos sem status mantêm exigência de módulos e aulas não vazios. Ao cadastrar aulas reais, remover status de preparação. Rota de curso continua válida; rota de aula inexistente permanece não encontrada. Não usar aulas fictícias para satisfazer o contrato.
