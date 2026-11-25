# Spec 001 — Complemento: Atribuição de YouTubers e Donos dos Vídeos

> **Versão:** v1.0 · **Data:** 25/11/2026 · **Status:** Proposta pelo DevSquad PO para aprovação de Igor  
> **Fase SDD:** 001 (Catálogo e Player) · **Referência PRD:** Decisão editorial de 14/11/2026 e Curadoria dos 10 indicados (v3)  
> **Autor da especificação:** DevSquad Product Owner (PO) · **Solicitante:** Igor dos Santos Ferreira  

---

## 1. Visão e Motivação do Produto

O **IAFLIX** tem como pilar editorial a curadoria estruturada de vídeos públicos e gratuitos disponíveis no YouTube, organizados em trilhas e cursos sequenciais. Conforme decisão explícita aprovada por Igor em 14/11/2026:
> *"Sim, usar vídeos externos com autoria e links. O IAFLIX organiza a sequência; não reivindica autoria dos vídeos."*

Para garantir total transparência, respeito aos direitos dos criadores originais e uma experiência ética e consistente para os alunos:
1. **Todo vídeo deve exibir no rodapé do player o canal/YouTuber criador (dono do vídeo).**
2. **Sempre que um vídeo for mencionado ou listado na interface (listas de aulas, sidebar, destaques), deve constar em tamanho reduzido (pequeno, embaixo) a indicação do canal/dono do vídeo.**

Esta especificação formaliza os requisitos, o modelo de dados, os pontos de contato da interface e os critérios de aceite no padrão **Spec-Driven Development (SDD)**.

---

## 2. Histórias de Usuário (User Stories)

### História 1: Como Aluno / Visitante
> **Como** estudante de IA navegando no IAFLIX,  
> **Quero** ver com facilidade e clareza quem é o criador/canal de cada vídeo (tanto no rodapé do player quanto abaixo do título nas listas),  
> **Para que** eu conheça a referência original, possa visitar o canal do autor no YouTube se desejar e entenda quem produziu aquele conhecimento técnico.

### História 2: Como Criador de Conteúdo / YouTuber
> **Como** criador técnico parceiro ou indicado cujo vídeo está incluído na curadoria do IAFLIX,  
> **Quero** ter meu canal e minha autoria visíveis em todas as telas onde meu vídeo aparece ou é reproduzido,  
> **Para que** o meu trabalho seja devidamente atribuído e a comunidade seja direcionada para o meu canal original.

### História 3: Como Curador / Operador do Catálogo
> **Como** curador do IAFLIX responsável pela edição do `catalog.json`,  
> **Quero** ter campos claros e padronizados de autor/canal na estrutura de cada aula,  
> **Para que** o frontend renderize as informações automaticamente sem necessidade de gambiarras em texto livre.

---

## 3. Mapeamento dos Pontos de Contato na Interface (Touchpoints)

A regra de negócio *"Todo vídeo tem q ter no rodapé em algum lugar qual o YouTuber, sempre que falar sobre um vídeo tem q ter pequeno em baixo o dono do video"* incide nos seguintes locais:

### 3.1. Rodapé do Player de Aula (`#/curso/:cursoId/aula/:aulaId`)
- **Posicionamento:** Logo abaixo do iframe incorporado do player e da barra de ações principais ("Marcar como concluída" / "Abrir no YouTube").
- **Aparência:** Um componente de rodapé de vídeo (`.video-footer-attribution` ou similar), com tipografia limpa, discreta e legível.
- **Conteúdo obrigatório:**
  - Prefixo descritivo claro: ex.: `Canal:` ou `Vídeo por:`.
  - Nome do canal/YouTuber em destaque (`<strong>Nome do Canal</strong>`).
  - Link seguro direto para o canal original no YouTube (`target="_blank" rel="noopener noreferrer"`), se disponível, ou menção textual padronizada.
  - Nota de transparência: indicação de que o vídeo é uma reprodução autorizada via embed do YouTube sem alteração de conteúdo.

### 3.2. Lista de Aulas / Barra Lateral do Curso (`#/curso/:cursoId`)
- **Posicionamento:** Em cada item `<li>` da listagem de aulas dentro de cada módulo.
- **Aparência:** Logo abaixo do título da aula (`.lesson-owner` ou dentro da linha `.meta`), em tamanho reduzido (CSS `font-size: 0.8rem` / `color: var(--muted-foreground)`).
- **Conteúdo obrigatório:** Nome do canal/criador (ex.: `Canal: Rafael Quintanilha – QuantBrasil`), acompanhando a duração da aula.

### 3.3. Destaque / Hero da Home (`#/`)
- **Posicionamento:** No banner de destaque da home quando a primeira aula ou aula em foco for referenciada (ex.: `.art-lesson` ou copy explicativo).
- **Aparência:** Subtítulo ou etiqueta pequena logo abaixo do título da aula em foco.
- **Conteúdo obrigatório:** Nome do canal/criador do vídeo exibido no destaque.

### 3.4. Cards de Cursos e Carrosséis (quando aula for citada)
- Caso um card exiba o nome da aula atual ou primeira aula, exibir imediatamente abaixo em texto reduzido o autor/YouTuber do vídeo.

### 3.5. Páginas Estáticas Compartilháveis e Metadados Sociais (`public/cursos/:id/index.html`)
- Nos metadados Open Graph e na lista estática de aulas para SEO/PWA, garantir a menção aos criadores originais das aulas.

---

## 4. Contrato de Dados (`public/data/catalog.json`)

Para que a atribuição seja robusta, estruturada e editável em menos de 30 minutos sem código, o contrato do catálogo (Spec 001 v2) é estendido com campos opcionais retrocompatíveis no objeto `lesson`.

### 4.1. Extensão do Objeto `lesson`

```typescript
interface Lesson {
  id: string;               // ID estável da aula (já existente)
  title: string;            // Título da aula (já existente)
  description: string;      // Descrição da aula (já existente)
  durationSeconds: number;  // Duração em segundos (já existente)
  youtubeUrl: string;       // URL do vídeo YouTube (já existente)
  materials: Material[];    // Materiais complementares (já existente)
  
  // Novos campos opcionais de atribuição:
  author?: string;          // Nome legível do YouTuber / Canal (máx 160 chars)
  authorUrl?: string;       // URL HTTPS do canal no YouTube (opcional)
  creatorId?: string;       // Referência opcional ao ID em catalog.creators[].id
}
```

### 4.2. Regra de Resolução e Fallback (Sem Quebra de Compatibilidade)

Para determinar o dono do vídeo em tempo de execução:
1. **Prioridade 1:** Se `lesson.author` estiver definido e não vazio, utiliza seu valor.
2. **Prioridade 2:** Se `lesson.creatorId` estiver definido e corresponder a um criador em `catalog.creators`, utiliza `creator.title` e `creator.channelUrl`.
3. **Prioridade 3 (Legado):** Se não houver campos explícitos, busca no primeiro item de `lesson.materials` cujo título comece com `"Canal original — "` ou extrai o prefixo `"Autoria: "` de `lesson.description`.
4. **Prioridade 4 (Produção Própria):** Caso não haja nenhum dos anteriores (ex.: cursos originais da plataforma), exibe `"IAFLIX"`.

### 4.3. Validação em `public/assets/js/catalog.js`
- Permitir os campos opcionais `author`, `authorUrl` e `creatorId` na verificação de chaves da aula:
  `object(lesson, lp, ['id', 'title', 'description', 'durationSeconds', 'youtubeUrl', 'materials'], ['author', 'authorUrl', 'creatorId']);`
- Validar que `author`, quando presente, seja string de até 160 caracteres não vazia após trim.
- Validar que `authorUrl`, quando presente, seja URL HTTPS válida com host exato do YouTube (`youtube.com`, `www.youtube.com`).
- Validar que `creatorId`, quando presente, corresponda a um ID existente no catálogo ou seja ID válido.

---

## 5. Critérios de Aceite (BDD / Gherkin)

### Cenário 1: Exibição no rodapé do player
```gherkin
Dado que estou na página de uma aula que possui canal/YouTuber identificado
Quando o player for renderizado
Então deve existir um rodapé de atribuição logo abaixo do vídeo
E o rodapé deve exibir claramente "Canal: <Nome do YouTuber>"
E, caso haja URL do canal, deve oferecer um link externo seguro ("Abrir canal no YouTube") abrindo em nova aba com rel="noopener noreferrer".
```

### Cenário 2: Exibição na listagem de aulas do curso
```gherkin
Dado que acesso a página de detalhes de um curso com aulas cadastradas
Quando visualizo a lista de módulos e aulas na barra lateral ou índice
Então cada aula deve exibir, imediatamente abaixo de seu título e em tamanho pequeno, o dono/YouTuber do vídeo
E a informação deve estar visualmente integrada à duração da aula sem poluir o layout.
```

### Cenário 3: Exibição em menções de vídeos no Hero/Destaque
```gherkin
Dado que estou na Home do IAFLIX
Quando um bloco de destaque (Hero) mencionar o título de uma aula específica
Então deve constar logo abaixo do título, em tipografia reduzida, a indicação do canal criador do vídeo.
```

### Cenário 4: Segurança, Acessibilidade e Proteção contra XSS
```gherkin
Dado que um autor ou canal contém caracteres especiais ou tentativas de injeção de HTML
Quando a interface renderizar o nome do autor
Então o texto deve ser inserido exclusivamente via textContent ou helpers seguros de UI
E leitores de tela devem conseguir anunciar o criador do vídeo de forma compreensível.
```

### Cenário 5: Compatibilidade com aulas existentes
```gherkin
Dado um catálogo legado ou aula que não possua o campo explícito "author"
Quando o sistema renderizar a aula
Então a rotina de fallback deve recuperar a autoria a partir da descrição/materiais ou exibir "IAFLIX"
E nenhum erro de renderização ou quebra de tela deve ocorrer.
```

### Cenário 6: Responsividade mobile
```gherkin
Dado que o aluno acessa o IAFLIX por um celular ou dispositivo móvel (PWA)
Quando visualizar a lista de aulas e o player
Então o rodapé do vídeo e a indicação pequena do YouTuber não devem sobrepor controles de reprodução nem quebrar a largura da tela.
```

---

## 6. Definição de Pronto (Definition of Done - DoD)

Uma tarefa derivada desta especificação será considerada concluída quando:
- [ ] Especificação e histórias validadas com Igor (PO).
- [ ] Schema de `catalog.js` atualizado para aceitar e validar `author`, `authorUrl` e `creatorId`.
- [ ] Todas as 24 aulas ativas em `public/data/catalog.json` atualizadas com seus respectivos `author` e links de canal.
- [ ] Componente visual de rodapé de vídeo implementado no player (`public/assets/js/app.js` e `public/styles.css`).
- [ ] Indicador pequeno de criador inserido na listagem de aulas (`public/assets/js/app.js`).
- [ ] Testes unitários atualizados em `tests/frontend.test.mjs` cobrindo o novo schema e renderização segura.
- [ ] Testes de regressão visual e layout em `tests/qa-browser.mjs` aprovados (desktop e mobile).
- [ ] Tarefas devidamente registradas e rastreadas em `TASKS.md`.
