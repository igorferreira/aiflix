# Spec 001 — Complemento: Rodapé Informativo e Explicação do Controle de Aulas (`localStorage`)

> **Versão:** v1.0 · **Data:** 25/11/2026 · **Status:** Proposta pelo DevSquad PO para aprovação de Igor  
> **Fase SDD:** 001 (Catálogo e Player — Transparência e Experiência do Aluno)  
> **Referências:** `PRD.md` v0.4, `AGENTS.md`, `specs/001-mvp-catalogo-player.md` (v2.2)  
> **Autor da especificação:** DevSquad Product Owner (PO) · **Solicitante:** Igor dos Santos Ferreira  

---

## 1. Visão e Motivação do Produto

No MVP atual do **IAFLIX**, o acesso aos cursos é gratuito e sem criação de conta: as aulas marcadas como concluídas são armazenadas localmente no navegador do estudante via `localStorage` (`aiflix.progress.v1`), sem coleta de dados pessoais nem sincronização em servidor.

Embora isso elimine barreiras de entrada, alunos podem estranhar a ausência de login ou não entender por que o progresso não aparece ao trocar de aparelho, usar aba anônima ou limpar o histórico do navegador.

Para resolver essa dúvida com transparência e acabamento de produto de streaming, esta história propõe:
1. **Evoluir o rodapé global do IAFLIX** para um formato informativo com explicações concisas e links úteis (estilo rodapé completo de plataformas de streaming/educação).
2. **Incluir um link discreto e claro no rodapé** (e opcionalmente na nota sob o player) levando a uma **página explicativa dedicada** sobre como funciona o controle local de aulas via `localStorage`, privacidade e autoria dos vídeos.

---

## 2. Histórias de Usuário (User Stories)

### História 1: Como Aluno do IAFLIX
> **Como** visitante ou estudante usando o IAFLIX sem login,  
> **Quero** encontrar no rodapé um link discreto que explique de forma simples como minhas aulas vistas são controladas no navegador (`localStorage`),  
> **Para que** eu saiba que meu progresso fica salvo neste aparelho, entenda que ele não sincroniza entre dispositivos e não perca minhas marcações por surpresa ao limpar os dados do navegador.

### História 2: Como Visitante Avaliando a Plataforma
> **Como** profissional ou empresa conhecendo o IAFLIX pela primeira vez,  
> **Quero** ver no rodapé links e explicações organizadas sobre o funcionamento gratuito, privacidade, armazenamento local e curadoria de YouTubers,  
> **Para que** eu tenha confiança imediata na seriedade e na transparência da plataforma.

---

## 3. Escopo Funcional e Pontos de Contato na Interface (UI)

### 3.1. Rodapé Global Estruturado (`<footer>` em `public/index.html`)
Substituir o bloco atual de três parágrafos soltos por um rodapé organizado em colunas responsivas (grid de 3 colunas no desktop, 1 coluna no mobile), mantendo tipografia discreta (`13px`), cores coerentes com o tema escuro (`var(--muted)`, `var(--line)`) e acessibilidade:

1. **Coluna 1 — Sobre o IAFLIX**
   - Resumo institucional: plataforma gratuita e aberta para aprender inteligência artificial no seu ritmo, com cursos independentes e caminhos opcionais.
   - Nota editorial: os vídeos são incorporados diretamente do YouTube com autoria e links dos canais originais.
2. **Coluna 2 — Informações e Links**
   - `Catálogo de cursos` (`#/`)
   - `Como funciona o controle de aulas (localStorage)` (`#/como-funciona-progresso`)
   - `Privacidade e armazenamento local` (`#/como-funciona-progresso#privacidade`)
   - `Curadoria e direitos autorais` (`#/como-funciona-progresso#curadoria`)
   - `Administração` (`#/admin`, preservando a classe `.admin-link` e rótulo exato `"Administração"`)
3. **Coluna 3 — Progresso Local (Resumo rápido)**
   - Aviso objetivo: sem cadastro e sem rastreamento em servidor; as aulas concluídas ficam salvas apenas neste navegador (`localStorage`), prevalecendo a última gravação entre abas.
   - Link pequeno direto: `Saiba como suas aulas são salvas` (`#/como-funciona-progresso`).

### 3.2. Página Explicativa Dedicada (`#/como-funciona-progresso`)
Nova rota SPA estática em `public/assets/js/catalog.js` e `public/assets/js/app.js` (sem backend ou dependências externas), contendo:

- **Cabeçalho (`h1`):** `Como funciona o controle de aulas` (com foco acessível automático e atualização de `document.title`).
- **Seção 1 — Sem login e 100% gratuito:** explica que qualquer pessoa pode estudar imediatamente sem criar conta.
- **Seção 2 — O que é `localStorage` (em linguagem simples):** explica que o próprio navegador guarda uma pequena lista com os identificadores das aulas concluídas (chave `aiflix.progress.v1`), sem armazenar nome, e-mail ou dados pessoais.
- **Seção 3 — Quando o progresso permanece salvo e quais os limites:**
  - Permanece salvo ao recarregar a página, fechar a aba ou voltar outro dia no **mesmo navegador e dispositivo**.
  - **Não sincroniza** entre celular, computador ou navegadores diferentes (ex.: Chrome e Safari).
  - **É apagado** se o usuário limpar dados de navegação/armazenamento do site ou usar **aba anônima/privada**.
  - **Navegador restritivo:** se o `localStorage` estiver bloqueado, o acesso às aulas continua livre e o progresso vale apenas durante a sessão aberta.
  - **Múltiplas abas:** se duas abas alterarem o progresso simultaneamente, a última gravação prevalece.
- **Seção 4 — Marcação manual e privacidade (`#privacidade`):** explica que o player incorporado do YouTube não reporta automaticamente o tempo assistido ao IAFLIX; o aluno decide quando clicar em *"Marcar como concluída"*, e o IAFLIX não envia histórico de aulas a nenhum servidor próprio.
- **Seção 5 — Curadoria e autoria (`#curadoria`):** reforça que os vídeos pertencem aos respectivos YouTubers indicados, sem download ou hospedagem própria pelo IAFLIX.
- **Navegação de retorno:** link claro `Voltar para o catálogo` (`#/`).

### 3.3. Link Discreto na Tela de Aula (`courseView` em `public/assets/js/app.js`)
Ao lado da nota existente sob o player (*"Conclusão manual salva neste navegador. A reprodução não marca a aula automaticamente."*), incluir um link pequeno e discreto: `Saiba como funciona` apontando para `#/como-funciona-progresso`.

---

## 4. Contrato Técnico e Compatibilidade

- **Rota SPA (`public/assets/js/catalog.js`):**
  - `resolveRoute(hash, catalog)` reconhece `#/como-funciona-progresso` (com ou sem subâncora suportada, ex.: `#/como-funciona-progresso`) retornando `{ type: 'progress-info' }`.
  - Rotas malformadas continuam retornando `{ type: 'not-found' }`.
- **Sem alteração de `catalog.json`:** o contrato de dados do catálogo permanece intacto (`schemaVersion: 2`).
- **Sem alteração na chave de progresso:** a chave `aiflix.progress.v1` e o comportamento de `public/assets/js/progress.js` permanecem preservados.
- **Sem regressão de layout acima da dobra:** o rodapé permanece ao final da página, sem alterar a altura do header ou do destaque principal na home.
- **Acessibilidade e segurança:**
  - `<footer>` com `<nav aria-label="Informações e links do rodapé">`.
  - Contraste adequado, alvos clicáveis acessíveis e foco visível via teclado (`:focus-visible`).
  - Conteúdo renderizado via helpers seguros DOM (`el`, `link`, `textContent`), sem `innerHTML`.

---

## 5. Critérios de Aceite (BDD / Gherkin)

### Cenário 1: Rodapé informativo visível em todas as telas
```gherkin
Dado que estou em qualquer página pública do IAFLIX (home, curso ou aula)
Quando rolo até o rodapé da página
Então visualizo um rodapé estruturado com explicações curtas e links úteis
E existe um link pequeno e claro explicando o controle de aulas via localStorage
E o link "Administração" continua presente e funcional.
```

### Cenário 2: Abertura da página explicativa do `localStorage`
```gherkin
Dado que clico no link sobre o controle de aulas no rodapé (ou sob o player da aula)
Quando a rota "#/como-funciona-progresso" é aberta
Então o título principal explica o controle local de aulas
E o conteúdo esclarece em português simples que o progresso fica no localStorage do navegador, sem login, sem sincronização entre dispositivos e com marcação manual
E existe um link acessível para voltar ao catálogo.
```

### Cenário 3: Responsividade e ausência de overflow
```gherkin
Dado que acesso o IAFLIX em celular (320px/390px), tablet (768px) e desktop (1440px)
Quando visualizo o rodapé e a página "#/como-funciona-progresso"
Então as colunas do rodapé se adaptam sem corte de texto nem rolagem horizontal global
E todos os links mantêm foco visível por teclado.
```

### Cenário 4: Preservação de rotas e contratos existentes
```gherkin
Dado o conjunto de testes unitários e suites Playwright do IAFLIX
Quando executo npm test e os testes de navegador
Então todas as rotas anteriores (home, curso, aula, caminho, admin, not-found) continuam funcionando
E nenhum teste de layout ou contrato existente sofre regressão.
```

---

## 6. Definição de Pronto (Definition of Done - DoD)

Esta história será considerada concluída quando:
- [ ] Especificação SDD (`FTR-01`) aprovada por Igor.
- [ ] Rodapé informativo com colunas e links implementado em `public/index.html` e estilizado em `public/styles.css` (`FTR-02`).
- [ ] Rota `#/como-funciona-progresso` implementada em `public/assets/js/catalog.js` e `public/assets/js/app.js`, incluindo link discreto na nota de progresso sob o player (`FTR-02`).
- [ ] Testes unitários atualizados em `tests/frontend.test.mjs` cobrindo a nova rota e suites Playwright validadas em mobile e desktop (`FTR-03`).
- [ ] Revisão final, sincronização Git/GitHub, deploy na Vercel e verificação em `https://iaflix.vercel.app` (`FTR-04`).
- [ ] `TASKS.md` atualizado com status, agentes executores e evidências.
