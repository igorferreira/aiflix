# Review final — correção de rolagem da marca e layout IAFLIX

> Data: 15/11/2026 · Agente: devsquad-reviewer · Veredito: **APROVADO para a correção local revisada**.

## Escopo

Nova revisão após o bloqueante documentado em `docs/review-iaflix-brand-layout.md`. Revisão somente de leitura do código; nenhuma alteração de aplicação, teste ou configuração foi feita por este reviewer.

O bloqueante era o uso de `focus({ preventScroll: true })` ao mudar de rota: ao clicar um cartão inferior da home, o título do curso podia ficar acima da janela. `render()` voltou a usar `focus()` nativo. O CSS continua restringindo a remoção de outline a `main h1[tabindex="-1"]:focus`, sem remover o foco visível dos controles.

## Verificação executada

- Executei `tests/qa-iaflix-layout.mjs` com Playwright local no servidor `http://127.0.0.1:4331`: **43 verificações passaram**, zero erros JavaScript, larguras 320, 390, 768, 1440 e 1920px.
- Reproduzi independentemente o cenário bloqueante em 390 × 844px: rolei até o último link “Regressão linear” e cliquei. A rolagem anterior era 3582px; após a navegação, `scrollY` era zero e o H1 estava entre 173px e 205px, focado e visível, com título de documento terminado em IAFLIX. O retângulo do H1 não reapareceu.
- Voltei ao catálogo pelo link da tela de curso. O H1 da home permaneceu visível. Ao pressionar Tab, o foco foi para “Assistir agora” com outline sólido, confirmando a indicação de teclado após interação por mouse.
- O teste de regressão novo cobre a navegação a partir do cartão abaixo da dobra, o foco no título visível e o retorno à home.

## Conclusão

O bloqueante anterior foi resolvido. Não identifiquei outro bloqueante na correção estreita. A marca pública IAFLIX, a ausência do contorno decorativo no H1 e o foco visível por teclado foram preservados. A revisão anterior dos demais ajustes de marca e layout não apresentou outros achados; o QA registrou 26 testes Node e 74 verificações de regressão aprovadas antes deste ajuste de foco.

## Limites

Não publiquei, não acessei o site público por navegador alternativo e não alterei código. A raiz deve conferir o deployment com o navegador integrado. Cache de WhatsApp, reprodução/fullscreen real e administração remota permanecem fora deste gate.
