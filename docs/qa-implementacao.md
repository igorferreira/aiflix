# QA — catálogo, player e administração

> Data: 14/11/2026. Agente: devsquad-qa. Veredito: **APROVADO para o escopo técnico local testado**. Produto completo e ativação administrativa em produção permanecem pendentes.

## Ambiente e execução

Node.js 24.21.0, Playwright 1.62.1 e Chromium headless. Servidor de desenvolvimento Node com os handlers reais em `http://127.0.0.1:4317`. As larguras verificadas foram 320, 768 e 1440 pixels.

Comandos executados com sucesso:

```sh
npm test
QA_BASE_URL=http://127.0.0.1:4317 PLAYWRIGHT_MODULE=/tmp/node_modules/playwright/index.mjs node tests/qa-browser.mjs
PLAYWRIGHT_MODULE=/tmp/node_modules/playwright/index.mjs node tests/qa-admin-integration.mjs
```

`npm test`: 18 testes passaram, zero falhas na primeira rodada. Browser: 60 verificações passaram na rodada final após o ajuste visual. Integração administrativa: quatro gravações no substituto GitHub, com dois contextos de navegador e handlers HTTP reais na primeira rodada. Playwright é ferramenta de QA; os scripts aceitam módulo instalado normalmente ou caminho explícito por `PLAYWRIGHT_MODULE`, sem dependência de produção. O script browser usa `QA_BASE_URL` ou `http://127.0.0.1:3000`; inicie `npm run dev` na porta escolhida antes de executá-lo. O teste administrativo inicia seu próprio servidor em porta livre.

## Evidência por comportamento

| Aceite | Resultado observado | Limite |
|---|---|---|
| AC-01 / AC-04 | Catálogo com curso independente, agrupamentos e dois caminhos; acesso direto e por caminho mantém a URL de curso | Fixtures isoladas para casos de borda; smoke do catálogo real confirmou três cursos curtos |
| AC-02 | Rota de aula corresponde ao curso; iframe recebe ID seguro, sem autoplay, com permissão fullscreen e fallback externo protegido; vínculo incorreto mostra não encontrado | Reprodução e tela cheia reais no YouTube não foram executadas; iframe externo interceptado no teste |
| AC-03 | Marcar, recarregar, desmarcar e recarregar preservam estado; corrupção só é substituída após consentimento; armazenamento bloqueado mantém sessão com aviso | Mesmo navegador/origem; não testa sincronização, que está fora do escopo |
| AC-05 | Login e cookie reais em teste local, rascunho salvo e recuperado após recarga, anônimo recebe 401, logout remove acesso; testes Node rejeitam assinatura adulterada, expiração, papel incorreto, origem indevida e payload inválido | Credenciais aleatórias apenas no processo de teste; GitHub remoto substituído por mock privado |
| AC-06 | Publicação por UI e handlers reais aparece em segundo contexto anônimo. Editar depois conserva versão pública anterior e não revela rascunho. CAS e falhas de armazenamento exercitados em testes Node; UI 409 preserva formulário | Persistência compartilhada remota em produção ainda não comprovada |
| AC-07 | Nenhum overflow global em home, aula e admin nas três larguras. Navegação por teclado básica, foco e botões de reordenação operantes. HTML do catálogo é texto, não elemento executável. UI de pré-visualização e erro funcionam | Não é auditoria integral com leitor de tela nem certificação WCAG; contraste completo ainda não foi medido |
| AC-08 | Catálogo real tem três recortes independentes, cada um com um módulo/uma aula e atribuição explícita a Diogo Cortiz | Metadados e decisão editorial verificados pela raiz; QA não assistiu às aulas. Seis trilhas com seis cursos, tempo editorial e aceite dos pilotos não estão concluídos |

## Segurança operacional e produção

Sem configuração, a administração retorna 503 e não simula publicação. O smoke local do app real confirmou essa mensagem. Configuração incompleta ou gate de proteção contra tentativas não atendido falha fechada nos testes. Armazenamento configurado indisponível, público ou corrompido não é substituído silenciosamente pelo bootstrap.

Token fine-grained, senha/sessão administrativas, limitação durável de login, origem final e validação remota continuam gates antes de ativar a administração para uso real. Vercel, domínio, acesso anônimo real e política CSP aplicada no host precisam de validação da raiz após publicação. Não usar este veredito como aceite desses itens.

## Achados e correções

Nenhuma falha funcional reproduzida no escopo local final. Ajustes feitos durante a automação foram nos locators e na espera da troca de rota do próprio teste, sem atribuí-los a regressão do aplicativo. Scripts de QA foram tornados portáveis por variáveis de ambiente a pedido da liderança.

## Gates ainda pendentes

Reprodução efetiva dos três vídeos, fullscreen no player real, acessibilidade completa, medição editorial abaixo de 30 minutos, cobertura original das seis trilhas, configuração e persistência administrativa reais, publicação na URL final e feedback dos oito pilotos. Esses itens impedem declarar a plataforma inteira pronta, embora os artefatos técnicos testados possam seguir para review.

## Regressão do layout similar a streaming — rodada final

**APROVADO no escopo técnico local.** O pedido visual posterior foi validado com a mesma automação e novas asserções, totalizando 60 verificações. A home passou a usar destaque de curso, CTA e carrossel em vez da grade anterior; os locators foram atualizados para refletir essa decisão intencional.

- Home com destaque, cartões e player sem overflow global em 320, 768 e 1440 pixels, incluindo dados reais e capas locais.
- As três capas reais completaram carregamento com `naturalWidth > 0`; cartões exibiram proporção 16:9 nas três larguras.
- CTA “Assistir agora” recebeu foco, foi acionado por Enter e abriu a rota da primeira aula real nas três larguras. No catálogo fixture, sua URL também corresponde à primeira aula.
- Carrossel “Todos os cursos” avançou pelo botão de próximo em 320 pixels, com redução de movimento respeitada no contexto de teste.
- Fluxos de curso, aula, progresso persistido/corrompido/bloqueado, caminhos, administração indisponível, pré-visualização, reordenação, conflito 409 e publicação da UI continuaram passando.

Não foram repetidos os testes extensos do backend nesta rodada porque o backend não mudou. A aprovação visual cobre comportamento e dimensões medidos em Chromium, sem afirmar aprovação estética por Igor ou acessibilidade integral. Imagens do catálogo real foram carregadas localmente; reprodução YouTube permaneceu bloqueada no teste para não confundir disponibilidade de iframe com reprodução comprovada.
