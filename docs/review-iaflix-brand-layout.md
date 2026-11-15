# Review — marca IAFLIX e primeira página

> Data: 15/11/2026 · Agente: devsquad-reviewer · Veredito: **REPROVADO nesta revisão**, por uma regressão de navegação reproduzida.

## Bloqueante

- `public/assets/js/app.js`, final de `render()`: `focus({ preventScroll: true })` mantém a posição de rolagem da tela anterior quando um curso é aberto por um cartão abaixo da dobra. O título fica focado, porém fora da área visível. Em Chromium local com 390 × 844, clicar no último link “Regressão linear” da home resultou em `scrollY = 692` e `main h1.getBoundingClientRect().top = -519` após a troca de rota; antes do clique a home estava em `scrollY = 3582`.

A correção do retângulo de foco no H1 não exige preservar rolagem entre telas. Mostrar o início/título da nova tela, manter foco assistivo e preservar indicadores de foco nos controles. Adicionar regressão iniciada a partir de cartão abaixo da dobra, não apenas CTA do destaque.

## Revisão restante

Comparei `app.js` e `styles.css` com o checkout Git externo anterior; conferi index, SVG, gerador, compartilhamento e auditoria textual. `npm test`: **26 testes passaram**. QA anterior registrou 40 verificações específicas e 74 de regressão, mas nenhuma delas cobria a navegação descrita acima.

Marca pública IAFLIX e novos assets estão consistentes no código revisado. Cookie e chave de armazenamento legados foram preservados corretamente. URLs reais não foram substituídas globalmente. Metadados continuam escapados, links WhatsApp não enviam mensagem automaticamente e não houve alteração de autenticação, autorização ou CSP.

Não identifiquei outro bloqueante no escopo. Nenhum código foi alterado pelo reviewer.

## Limites

Sem deploy, reprodução audiovisual, cache real do WhatsApp, conta pessoal do YouTube ou administração remota. Nova aprovação depende da correção e validação da regressão de rolagem.
