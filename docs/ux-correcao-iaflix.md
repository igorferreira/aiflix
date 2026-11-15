# UX — correção de marca e primeira página

> Data: 15/11/2026 · Responsável: devsquad-frontend / iaflix_ux_fix · Status: implementação e validação local concluídas; gates independentes e publicação pela raiz.

## Problemas reproduzidos

A marca pública estava escrita `aiflix`, inclusive no logo, títulos, descrições de curadoria, metadados sociais e texto do compositor WhatsApp. Igor definiu a marca correta: **IAFLIX**.

A primeira página recebia foco programático no H1 após renderizar a rota. A regra global `:focus-visible` desenhava um retângulo rosa de três pixels sobre toda a largura do título, parecendo um contorno decorativo ou erro de layout. A inspeção confirmou H1 como elemento ativo. O problema foi reproduzido em navegador local e a raiz confirmou o mesmo comportamento na publicação.

A composição também acumulava cabeçalho alto, introdução extensa e destaque com a descrição editorial longa. Em 390px, a seção de todos os cursos começava aproximadamente em 992px, abaixo da primeira tela de 844px. O destaque media cerca de 556px. No desktop, a raiz observou o título dos cursos abaixo de 800px; o destaque local de 1440px media 460px. A mesma página reservava grandes seções separadas para três trilhas ainda vazias.

Evidências locais anteriores: `/tmp/iaflix-before-desktop.png` e `/tmp/iaflix-before-mobile.png`. São capturas de diagnóstico temporárias; não fazem parte dos assets publicados.

## Correções

- IAFLIX em títulos, textos públicos, curadoria, WhatsApp, metadados estáticos e novo wordmark `logo-iaflix.svg`. Referências ao arquivo antigo foram substituídas e o arquivo sem uso removido. Favicon mantém o símbolo original e nome acessível correto.
- O foco de rota continua no H1 e mantém o deslocamento nativo para mostrar o título ao mudar de tela. Somente o heading programaticamente focável deixa de receber o contorno global. Links, botões, campos e demais controles mantêm foco visível para teclado.
- Cabeçalho, introdução e espaçamentos compactados. O destaque usa a primeira frase da descrição, preservando o texto completo na página do curso. A capa continua inteira, sem cortar letras gravadas na imagem.
- Trilhas com cursos continuam com carrossel próprio. Trilhas vazias permanecem no catálogo, mas aparecem juntas em “Mais trilhas em preparação”, evitando várias seções sem aulas.
- Singular “1 aula” corrigido em cartões e destaque.

Não houve alteração nos vídeos, IDs, rotas públicas, progresso, conteúdo administrativo ou autorização. As sete capas PNG são responsabilidade da raiz e foram reexportadas com a marca correta.

## Compatibilidade e auditoria

Foi procurado `aiflix` em `public/`, `scripts/`, `tests/`, `lib/`, `api/` e `package.json`. Permanecem deliberadamente a chave `aiflix.progress.v1`, cookie `aiflix_admin`, testes que comprovam sua compatibilidade, nomes de diretórios temporários de teste e expressões que detectam a marca antiga. Esses identificadores internos não aparecem como marca pública; renomeá-los apagaria progresso ou invalidaria sessões sem necessidade.

Nomes reais de repositório, pasta sincronizada, projeto Vercel e documentos históricos pertencem ao histórico operacional; sua atualização é coordenada pela raiz. Não foi realizada substituição global em URLs reais.

## Validação executada

- `npm run build`: sete páginas sociais regeneradas a partir do catálogo.
- `npm test`: **26 testes passaram**, incluindo nova regressão da marca pública em HTML, logo, catálogo e WhatsApp.
- `PLAYWRIGHT_MODULE=/tmp/node_modules/playwright/index.mjs node tests/qa-iaflix-layout.mjs`: **40 verificações passaram**, zero erros JavaScript.
- Larguras: 320, 390, 768, 1440 e 1920 pixels. Verificados ausência de overflow global, logo carregado/nome acessível, título IAFLIX, marca antiga ausente no texto, H1 sem retângulo e foco visível no CTA.

| Largura | Topo do destaque | Altura do destaque | Topo de “Todos os cursos” |
|---|---:|---:|---:|
| 320px | 292px | 516px | 860px |
| 390px | 260px | 473px | 785px |
| 768px | 218px | 286px | 558px |
| 1440px | 231px | 345px | 632px |
| 1920px | 231px | 300px | 586px |

Capturas posteriores `/tmp/iaflix-after-desktop.png` e `/tmp/iaflix-after-mobile.png` foram inspecionadas visualmente. Em 390px e desktop, o título do catálogo volta à primeira dobra nas alturas verificadas. Em 320px permanece rolagem natural; não foi reduzida a legibilidade para forçar todo o conteúdo à primeira tela.

## Limites

Esta etapa não publicou nem acessou a conta pessoal do YouTube. Reprodução e fullscreen reais, ativação administrativa e cache do WhatsApp permanecem fora desta correção. A raiz verificará a versão publicada com o navegador integrado disponível nesta sessão. Não é uma certificação completa de acessibilidade.

## Gate independente de QA

QA aprovou a correção local: 26 testes Node, 40 verificações específicas de marca/layout e 74 verificações de regressão no navegador. As capturas mobile e desktop foram inspecionadas por outro agente. O script de regressão ainda exigia três cartões e três capas apesar de o catálogo já possuir sete cursos; essa expectativa foi atualizada para sete, com asserções adicionais preservando três cursos com aulas e quatro em preparação. Nenhum conteúdo fictício foi acrescentado para atender ao teste. Evidência: `docs/qa-iaflix-brand-layout.md`.

## Correção encontrada no review

O reviewer reproduziu que `preventScroll` preservava a posição de um cartão no fim da home e podia deixar o título da próxima tela fora da janela. A opção foi removida: o foco nativo volta a posicionar o título visivelmente, e o CSS específico continua evitando o retângulo decorativo. O teste agora navega de um cartão abaixo da dobra até o curso, confere título focado visível e retorna ao catálogo. Não há alteração de foco dos controles.

## Gate final de review

O novo review independente aprovou a correção após reproduzir o cenário de navegação abaixo da dobra. Com a home em `scrollY=3582`, abrir o curso agora retornou a `scrollY=0`, com H1 focado e visível entre 173px e 205px. O heading não recebe retângulo; o CTA por teclado mantém contorno visível. As 43 verificações específicas passaram. O parecer final em `docs/review-iaflix-brand-layout-final.md` substitui a reprovação anterior, cuja evidência foi mantida no histórico.
