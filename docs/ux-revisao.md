# Revisão UX — identidade, cursos e compartilhamento

> Data: 15/11/2026. Agente: ux_brand_covers / devsquad-frontend. Escopo: layout, logo e controles de compartilhamento. QA e review independentes são gates da liderança.

## Diagnóstico

O catálogo já tinha a estrutura de streaming solicitada: destaque, carrosséis e player. A marca era apenas texto; o destaque ocultava sua imagem em telas pequenas; páginas de curso não tinham capa ou início direto da aula; faltavam ações claras para compartilhar um curso sem copiar o hash da aplicação. Cursos em preparação precisavam manter essa condição evidente.

## Direção visual

Mantida a marca oficial `aiflix`, sem renomeá-la pela diferença do domínio. Paleta: fundo `#111111`, superfície `#1b191a`, texto `#f4f3f7`, texto secundário `#c0bdbd`, vermelho de marca `#e52b3c` e ação `#c91e2e`. Tipografia local Segoe UI/Arial, sem dependências ou fontes externas.

A referência de streaming está na organização e no comportamento, não em copiar elementos protegidos da Netflix. O ponto de identidade é um símbolo original de reprodução acompanhado de um marcador de início. Nenhum efeito automático foi acrescentado. Capas são a principal expressão visual; navegação e controles ficam discretos.

Fluxo: cabeçalho com marca e catálogo/admin; destaque com capa e acesso à aula; carrosséis com títulos legíveis; página de curso com capa, aulas e compartilhamento. O alinhamento à esquerda e as ações explícitas facilitam leitura e teclado. Rejeitados eyebrows, selos promocionais e ampliação do hero de marketing.

## Alterações

- `logo-mark.svg`: símbolo vetorial original, usado também como favicon.
- `logo-aiflix.svg`: assinatura horizontal com marca e símbolo.
- Cabeçalho com logo dimensionado e nome acessível; imagem redundante tem `alt` vazio.
- Hierarquia dos cartões e contraste entre superfície e fundo refinados; foco visível preservado.
- Capa do destaque visível também no mobile, antes do texto, sem autoplay.
- Página de curso mostra capa editorial e “Assistir à primeira aula” quando há conteúdo.
- Todos os cursos, inclusive os que aguardam vídeos, possuem “Compartilhar no WhatsApp”, “Copiar link” e “Link direto do curso”.
- Compartilhamento usa o contrato canônico `/cursos/<id>/` do módulo `share.js`, sem expor o hash como URL de prévia social.
- Falha de clipboard anuncia orientação e direciona foco ao link direto. Link de WhatsApp avisa abertura em nova aba e usa `noopener noreferrer`.
- Estado de preparação não mostra player ou ação de assistir; não expõe na interface dependência de acesso ao histórico pessoal de Igor.

## Limites

As capas são produzidas e integradas pela raiz. As páginas estáticas, Open Graph e validação de imagens sociais pertencem ao agente course_sharing. Não foi enviado conteúdo a contatos do WhatsApp. A presença dos metadados não comprova como o cache do WhatsApp apresentará links antigos; isso deve ser conferido após publicação.

## Verificações executadas pelo agente UX

`npm test` passou com os 20 testes disponíveis na primeira rodada; o agente de compartilhamento executou posteriormente os testes adicionais do contrato social. Sintaxe de `app.js` conferida.

Smoke Chromium em servidor local isolado e sem configuração editorial: 21 verificações de ausência de overflow, logo carregado, capa de destaque visível em 320/768/1440 pixels, curso em preparação sem iframe, URL de WhatsApp correta, clipboard e CTA para a primeira aula. Mais uma verificação confirmou que a negação do clipboard informa alternativa e move foco ao link direto.

Com as sete novas capas integradas pela raiz, mais 34 verificações confirmaram carregamento das sete imagens de 1200×630 nas três larguras, destaque com `object-fit: contain` (sem cortar título da thumbnail) e links canônicos corretos nas sete páginas de curso. Capturas locais foram inspecionadas. Total: 56 verificações de UX nos escopos descritos, sem duplicar a repetição do smoke após o ajuste de recorte.

O primeiro smoke tentou usar um servidor anterior que retornava `STORAGE_UNAVAILABLE`; foi repetido em porta isolada com configuração editorial ausente, comportamento bootstrap suportado. Isso não foi atribuído a regressão de layout. Nenhuma configuração de produção ou credencial foi alterada.

Não foi enviado link para contatos, aberto o WhatsApp, testado o cache social em cliente real ou reproduzido o vídeo externo. Os gates independentes de QA/review e a publicação ficam sob coordenação da raiz.
