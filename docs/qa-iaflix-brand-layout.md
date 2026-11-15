# QA — marca IAFLIX e correção da primeira página

> Data: 15/11/2026 · Agente: devsquad-qa · Veredito: **APROVADO para a correção local de marca e layout testada**.

## Critérios verificados

- Marca pública IAFLIX no cabeçalho, logo, título de página, descrições de curadoria, metadados das sete páginas sociais e texto de compartilhamento WhatsApp.
- H1 com foco programático sem contorno decorativo de largura inteira; controles interativos mantêm foco visível para teclado.
- Home e player sem overflow global em larguras de 320, 390, 768, 1440 e 1920 pixels, com logo carregado, capas legíveis e CTA funcional.
- Catálogo com os três cursos com aulas e quatro cursos em preparação preservados, incluindo IDs, progresso e ausência de aulas fictícias.
- Regressão de navegação, carrosséis, player/fallback, marcação/reversão de progresso, corrupção de armazenamento, UI administrativa, conflito de revisão e publicação simulada.
- Sete páginas estáticas com título terminado em IAFLIX, `og:site_name` IAFLIX, nome acessível do logo e texto público sem a marca incorreta.

## Execuções reais

Servidor local de desenvolvimento em `http://127.0.0.1:4331`, sem configuração editorial remota. Node.js 24.21.0 e Chromium via Playwright do ambiente.

```sh
npm test
PLAYWRIGHT_MODULE=/tmp/node_modules/playwright/index.mjs node tests/qa-iaflix-layout.mjs
QA_BASE_URL=http://127.0.0.1:4331 PLAYWRIGHT_MODULE=/tmp/node_modules/playwright/index.mjs node tests/qa-browser.mjs
```

Resultados: **26 testes Node passaram**, **40 verificações específicas de marca/layout passaram** e **74 verificações de regressão browser passaram**. Nenhum erro JavaScript de página no teste específico. Inspeção adicional das sete páginas sociais locais encontrou zero inconsistências de marca.

| Largura | Topo de Todos os cursos | Resultado |
|---|---:|---|
| 320px | 860px | Rolagem natural, sem overflow; CTA permanece utilizável |
| 390px | 785px | Título do catálogo dentro da altura de 844px usada na comparação |
| 768px | 558px | Catálogo alcançável sem composição excessivamente alta |
| 1440px | 632px | Título do catálogo antes de 800px |
| 1920px | 586px | Título do catálogo antes de 800px |

Capturas independentes `/tmp/qa-iaflix-brand-mobile.png` e `/tmp/qa-iaflix-brand-desktop.png` foram inspecionadas visualmente. O retângulo rosa no H1 deixou de existir, os CTAs são visíveis no mobile de 390px, a capa do destaque não corta letras e a marca no logo/capas é IAFLIX. Capturas são evidências temporárias locais, não assets de publicação.

## Achado na automação e correção

A primeira rodada de `qa-browser.mjs` parou numa expectativa antiga de somente três cursos e três capas. O catálogo já continha sete cursos antes desta correção: três com aulas e quatro em preparação. Isso não foi classificado como regressão do produto. O frontend corrigiu as contagens e adicionou a verificação explícita dessa composição, mantendo os quatro módulos vazios. A nova execução passou com 74 verificações.

## Compatibilidade e limites

Auditoria textual encontrou `aiflix` no código operacional apenas na chave legada de progresso e cookie administrativo. Sua manutenção é deliberada para preservar dados e sessões. Nomes temporários e expressões de testes que detectam a marca antiga não são apresentação pública. Não foi feita troca global de URLs de repositório ou infraestrutura.

A aprovação não inclui deploy, cache real do WhatsApp, conta pessoal do YouTube, reprodução/fullscreen audiovisual ou ativação administrativa remota. A API administrativa continua indisponível sem credenciais, conforme gate esperado. A raiz deve conferir a publicação no navegador integrado. Não houve certificação integral WCAG.
