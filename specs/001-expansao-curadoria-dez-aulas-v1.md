# Spec 001 — Complemento: Expansão de Curadoria (Mínimo de 10 Vídeos por Assunto)

> **Versão:** v1.0 · **Data:** 25/11/2026 · **Status:** Proposta pelo DevSquad PO para aprovação de Igor  
> **Fase SDD:** 001 (Catálogo e Player — Curadoria de Conteúdo)  
> **Referências:** `PRD.md` v0.4, `AGENTS.md`, `specs/001-youtubers-indicados-v1.md` (v3) e `specs/001-atribuicao-dono-do-video-v1.md` (v1)  
> **Autor da especificação:** DevSquad Product Owner (PO) · **Solicitante:** Igor dos Santos Ferreira  

---

## 1. Visão e Motivação do Produto

Na entrega anterior (`YT-02`), o **IAFLIX** publicou 24 aulas nos quatro cursos temáticos de **Assuntos de IA em foco** (`Harness`, `Gerência de contexto`, `Memória` e `Agentes`), utilizando exclusivamente vídeos presentes no histórico pessoal de 90 dias de Igor. Como resultado dessa restrição inicial, alguns assuntos ficaram com carga rasa — especialmente **Memória** (2 aulas) e **Gerência de contexto** (5 aulas).

Para que cada assunto entregue uma jornada real de aprofundamento com experiência de plataforma de cursos (e não apenas uma amostra curta), esta especificação define a expansão ativa da curadoria: **buscar vídeos públicos diretamente nos canais dos 10 YouTubers indicados**, atingindo **pelo menos 10 aulas reais e verificadas por assunto**.

---

## 2. Diagnóstico Atual e Meta de Expansão

### 2.1. Escopo Principal — Trilha `Assuntos de IA em foco` (`assuntos-ia`)

| Curso / Assunto (`id`) | Módulos atuais | Aulas atuais | Meta mínima | Lacuna mínima a preencher |
|---|---:|---:|---:|---:|
| **Harness** (`harness`) | 2 | 8 | ≥ 10 | +2 aulas |
| **Gerência de contexto** (`gerencia-contexto`) | 2 | 5 | ≥ 10 | +5 aulas |
| **Memória** (`memoria-ia`) | 1 | 2 | ≥ 10 | +8 aulas |
| **Agentes** (`agentes-ia`) | 2 | 9 | ≥ 10 | +1 aula |
| **Total (`assuntos-ia`)** | **7** | **24** | **≥ 40** | **+16 aulas (mínimo)** |

### 2.2. Fora do Escopo Imediato (Decisão Aberta para Fase Seguinte)
Os três cursos fundamentais já publicados (`introducao-ia`, `regressao-linear`, `arvore-decisao`) possuem 1 aula cada (autoria Diogo Cortiz). Caso Igor deseje aplicar a meta de 10 vídeos também a esses três cursos, será aberta uma extensão dedicada (Fase 2 / `EXP-P1`), definindo se a busca incluirá o canal do próprio Diogo Cortiz além dos 10 YouTubers indicados.

### 2.3. Fontes Autorizadas (Os 10 YouTubers Indicados em `catalog.creators`)

A busca ativa deve ocorrer **diretamente nos catálogos públicos do YouTube** destes dez canais cadastrados:

1. `quantbrasil` — Rafael Quintanilha – QuantBrasil (`https://www.youtube.com/@QuantBrasil`)
2. `aiprogbr` — AI ProgBr (`https://www.youtube.com/@AIProgBr`)
3. `maestrosdaia` — Maestros da IA (`https://www.youtube.com/@maestrosdaia`)
4. `elirigobeliai` — Eli Rigobeli - IA (`https://www.youtube.com/@EliRigobeliAI`)
5. `juliosilvaai` — Julio | Lucrar com IA (`https://www.youtube.com/@juliosilvaai`)
6. `ronnaldhawk` — Ronnald Hawk | Engenharia de IA (`https://www.youtube.com/@ronnaldhawk`)
7. `matheusbattisti` — Matheus Battisti - Hora de Codar (`https://www.youtube.com/@MatheusBattisti`)
8. `orafavoss` — Rafa Voss | IA na Prática (`https://www.youtube.com/@Orafavoss`)
9. `obrunookamoto` — Bruno Okamoto (`https://www.youtube.com/@obrunookamoto`)
10. `inteligenciamilgrau` — Inteligência Mil Grau (`https://www.youtube.com/@inteligenciamilgrau`)

---

## 3. Histórias de Usuário (User Stories)

### História 1: Como Aluno do IAFLIX
> **Como** estudante explorando um assunto técnico de IA no IAFLIX (`Harness`, `Gerência de contexto`, `Memória` ou `Agentes`),  
> **Quero** encontrar pelo menos 10 aulas bem selecionadas e organizadas em módulos progressivos dentro de cada assunto,  
> **Para que** eu tenha profundidade prática, diversidade de abordagens entre criadores de referência e continuidade real de estudo.

### História 2: Como Curador da DevSquad
> **Como** agente curador responsável por expandir o catálogo,  
> **Quero** critérios objetivos de busca nos 10 canais indicados, gates técnicos de verificação (embed, duração, unicidade e tema) e política explícita para eventuais lacunas temáticas,  
> **Para que** eu publique somente vídeos reais, aderentes ao tema e sem quebrar o progresso salvo dos alunos.

### História 3: Como Criador / YouTuber Indicado
> **Como** dono dos vídeos selecionados nos canais indicados,  
> **Quero** que cada nova aula publicada carregue minha autoria estruturada (`author`, `authorUrl`, `creatorId`) e link original no rodapé e listas,  
> **Para que** minha produção continue sendo devidamente atribuída conforme a política editorial do IAFLIX.

---

## 4. Regras de Negócio e Gates de Curadoria

### 4.1. Critérios de Seleção Editorial
1. **Fonte exclusiva nos 10 canais indicados:** Todo novo vídeo adicionado nesta entrega deve pertencer a um dos 10 canais listados na Seção 2.3.
2. **Aderência temática estrita:** Cada vídeo deve tratar objetivamente do assunto do curso ao qual for associado:
   - **Harness:** ambientes de execução, ferramentas de agente/CLI (Claude Code, Codex, Claude Desktop, OpenRouter, roteadores, workflows de código, configuração de harness).
   - **Gerência de contexto:** janela de contexto, economia/otimização de tokens, SDD/especificações para manter contexto, compactação, regras/prompts estruturados, `CLAUDE.md`/`AGENTS.md`.
   - **Memória:** memória persistente de agentes, grafos de conhecimento, RAG/recuperação de memória, memória entre sessões, bancos vetoriais ou memória episódica/semântica em IA.
   - **Agentes:** arquitetura de agentes autônomos, uso de ferramentas (tool calling/MCP), multiagentes, controle de computador, skills, automações agênticas fim a fim.
3. **Política anti-enchimento (Gate de Honestidade):** É **proibido** adicionar vídeos fora do assunto ou genéricos apenas para cumprir a cota numérica de 10. Caso a busca exaustiva nos 10 canais indicados retorne menos de 10 vídeos genuinamente aderentes em algum assunto (risco mais alto em `Memória`), a DevSquad deve:
   - Publicar os vídeos legítimos encontrados;
   - Registrar a lacuna exata com evidência da varredura dos 10 canais;
   - Consultar Igor antes de incluir canais fora da lista dos 10 indicados ou vídeos em inglês.
4. **Diversidade de criadores:** Sempre que houver vídeos qualificados em múltiplos canais para um assunto, priorizar variedade entre os 10 YouTubers indicados em vez de concentrar tudo em um único canal.
5. **Preferência por conteúdo denso (não Shorts rasos):** Priorizar aulas/tutoriais/análises completas (vídeos padrão do YouTube, preferencialmente ≥ 3 minutos) em vez de YouTube Shorts promocionais ou cortes sem valor didático.
6. **Progressão pedagógica em módulos:** Organizar cada curso de ≥ 10 aulas em **2 a 3 módulos coerentes** (ex.: *Fundamentos*, *Prática e Ferramentas*, *Arquitetura e Casos Avançados*).

### 4.2. Gates Técnicos e Integridade de Dados
1. **Verificação individual obrigatória:** Todo vídeo selecionado deve ter URL canônica `https://www.youtube.com/watch?v=<11-chars>`, disponibilidade pública confirmada, permissão de embed verificada (oEmbed / metadados públicos) e duração real (`durationSeconds > 0`) obtida da fonte oficial — nunca estimada ou inventada.
2. **Unicidade de vídeo e ID:**
   - Nenhum vídeo (`youtubeId`) pode ser duplicado dentro do mesmo curso; preferencialmente `youtubeId` único em todo o catálogo `public/data/catalog.json`.
   - Todos os `id` de módulos e aulas devem ser únicos e respeitar `[a-z0-9]+(?:-[a-z0-9]+)*` (máx. 80 caracteres).
3. **Preservação do progresso dos alunos (Imutabilidade de IDs):**
   - As **24 aulas já publicadas** nos 4 cursos devem manter seus `id` exatamente intactos, mesmo que sejam reorganizadas entre módulos. Não remover nem renomear IDs já publicados.
4. **Conformidade com Atribuição (`specs/001-atribuicao-dono-do-video-v1.md`):**
   - Toda nova aula deve preencher explicitamente `author`, `authorUrl`, `creatorId`, `description` (com resumo objetivo e atribuição) e `materials` (com o link `"Canal original — <Nome>"`).
5. **Zero alteração de código público para publicar:** A entrada das novas aulas ocorre via atualização de `public/data/catalog.json` + regeneração das páginas estáticas (`npm run build`), mantendo o princípio da Spec 001.

---

## 5. Critérios de Aceite (BDD / Gherkin)

### Cenário 1: Meta mínima de 10 vídeos por assunto
```gherkin
Dado o catálogo validado em public/data/catalog.json
Quando verifico os cursos da trilha "assuntos-ia" (harness, gerencia-contexto, memoria-ia, agentes-ia)
Então cada curso deve conter pelo menos 10 aulas publicadas (ou evidência formal aprovada por Igor caso os 10 canais não possuam 10 vídeos aderentes no tema)
E cada curso deve organizar suas aulas em módulos coerentes e não vazios.
```

### Cenário 2: Origem restrita aos 10 YouTubers indicados e atribuição completa
```gherkin
Dado qualquer nova aula adicionada nesta expansão
Quando valido seus metadados no catálogo
Então seu creatorId deve existir em catalog.creators
E author e authorUrl devem corresponder exatamente ao canal original verificado no YouTube
E ao abrir o curso ou player, o rodapé do vídeo e a lista lateral devem exibir o dono do vídeo corretamente.
```

### Cenário 3: Preservação de IDs e progresso existente
```gherkin
Dado um aluno que já marcou aulas anteriores como concluídas no localStorage (chave aiflix.progress.v1)
Quando o catálogo expandido for carregado
Então todos os 24 IDs de aulas previamente publicados continuam existindo no catálogo
E o progresso já salvo permanece preservado sem corrupção ou perda.
```

### Cenário 4: Integridade técnica, unicidade e disponibilidade
```gherkin
Dado todas as aulas dos 4 cursos expandidos
Quando executo a validação de contrato e auditoria de mídia
Então nenhuma URL de vídeo é duplicada no catálogo
E todas as URLs são HTTPS válidas de YouTube com ID de 11 caracteres e embed permitido
E nenhuma duração é zero, negativa ou fictícia
E npm test, npm run build e as suites Playwright passam sem regressões.
```

---

## 6. Definição de Pronto (Definition of Done - DoD)

Esta história será considerada concluída quando:
- [ ] Especificação SDD (`EXP-01`) aprovada por Igor.
- [ ] Varredura dos vídeos públicos nos 10 canais indicados documentada (`EXP-02`), com registro de candidatos verificados (oEmbed, duração, tema e canal) e eventuais lacunas reportadas.
- [ ] `public/data/catalog.json` atualizado (`EXP-03`) com ≥ 10 aulas por assunto em `assuntos-ia` (mantendo os 24 IDs originais intactos e `author`/`authorUrl`/`creatorId` preenchidos).
- [ ] Páginas estáticas `/cursos/<id>/index.html` regeneradas via `npm run build` (`EXP-04`).
- [ ] `npm test` (validação de contrato, autoria, rotas e unicidade) e suites Playwright (`qa-browser`, `qa-iaflix-layout`, `qa-admin-integration`) aprovados (`EXP-04`).
- [ ] Revisão final, sincronização com o repositório Git externo ao Drive, deploy na Vercel e verificação HTTP 200 em `https://iaflix.vercel.app` (`EXP-05`).
- [ ] `TASKS.md` atualizado com status, agentes executores e evidências reais.
