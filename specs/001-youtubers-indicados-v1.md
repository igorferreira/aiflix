# Spec 001 — Complemento: YouTubers indicados

Versão v2 · 23/11/2026 · extensão do catálogo público.

## Requisito

Criar seção “YouTubers indicados” na home com canais recomendados pela comunidade. Primeiro canal informado diretamente por Igor: https://www.youtube.com/@ronnaldhawk. Exibir handle fornecido; não inferir nome civil, audiência ou ranking.

## Contrato

Campo opcional `creators` em `public/data/catalog.json`, compatível com catálogos v2 existentes sem indicações. Cada entrada contém `id` estável e único, `title`, `description` e `channelUrl`. Validar HTTPS, host exato YouTube e caminho de handle sem parâmetros, credenciais ou porta. Texto renderizado por textContent; link abre nova aba com noopener noreferrer e aviso. Ausência ou lista vazia omite a seção. Catálogo editorial preserva o campo ao publicar learn paths.

## Aceite

- Dado o catálogo com indicação, quando a home abre, então mostra título, descrição e link original do canal.
- Dado catálogo antigo sem creators, a navegação permanece disponível.
- Dada URL insegura ou ID repetido, a validação recusa a entrada.
- Publicar learn path preserva indicações.

Sem imagens não verificadas, aulas inventadas, ranking pessoal ou histórico bruto no repositório público. Pesquisa de vídeos continua em TOP-02/03.

## Seleção dos dez indicados — v2

Igor solicitou ranking pessoal de canais de IA e desenvolvimento com base nos últimos 90 dias. A versão de 23/11/2026 usa somente a primeira conta confirmada; a segunda foi adiada explicitamente. O documento agregado `docs/ranking-youtubers-ia.md` e os artefatos de histórico permanecem locais, ignorados pelo Git e fora da saída pública.

A seleção conta pares únicos de vídeo/data dentro da janela inclusiva de 26/08/2026 a 23/11/2026. Considera o recorte técnico/aplicado de IA, ferramentas, automação e programação; exclui falsos positivos e debates gerais sem esse foco. Ordena por contagem decrescente, com desempate alfabético por casefold Unicode. Esse recorte não representa tempo assistido, ranking iBest ou avaliação de qualidade.

O catálogo contém os dez primeiros, nessa ordem, com nomes e URLs originais verificados por metadados públicos dos vídeos. Mantém o ID estável de Ronnald Hawk. O site não recebe contagens pessoais, e-mails ou registros assistidos. A publicação de canais não publica novas aulas.

Aceite adicional: o catálogo validado deve conter exatamente dez canais, sem IDs ou URLs repetidos; a lista pública deve corresponder à seleção registrada localmente. A segunda conta não pode contribuir com dados não confirmados.
