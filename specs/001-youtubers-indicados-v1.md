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

O catálogo contém os dez primeiros, nessa ordem, com nomes e URLs originais verificados por metadados públicos dos vídeos. Mantém o ID estável de Ronnald Hawk. O site não recebe contagens pessoais, e-mails ou registros assistidos.

Aceite adicional: o catálogo validado deve conter exatamente dez canais, sem IDs ou URLs repetidos; a lista pública deve corresponder à seleção registrada localmente. A segunda conta não pode contribuir com dados não confirmados.

## Seleção temática de vídeos dos YouTubers indicados — v3 (24/11/2026)

Igor solicitou publicar os YouTubers indicados e selecionar os vídeos deles pelos temas no site (`Harness`, `Gerência de contexto`, `Memória` e `Agentes`).

Critérios aplicados:

- Fonte restrita aos vídeos efetivamente observados no histórico de 90 dias dos dez YouTubers indicados, sem inventar URLs ou substituir o histórico por buscas genéricas.
- Verificação individual por oEmbed e metadados públicos do YouTube (`title`, `author_name`, `author_url` e `lengthSeconds`), garantindo disponibilidade, incorporação permitida e atribuição explícita ao canal original em `description` e `materials`.
- Distribuição temática nos quatro cursos de `Assuntos de IA em foco`:
  - `harness`: 2 módulos e 8 aulas (Rafael Quintanilha – QuantBrasil, Ronnald Hawk | Engenharia de IA, Matheus Battisti - Hora de Codar e Bruno Okamoto).
  - `gerencia-contexto`: 2 módulos e 5 aulas (Rafael Quintanilha – QuantBrasil, Matheus Battisti - Hora de Codar e AI ProgBr).
  - `memoria-ia`: 1 módulo e 2 aulas (Rafael Quintanilha – QuantBrasil e Maestros da IA).
  - `agentes-ia`: 2 módulos e 9 aulas (Rafael Quintanilha – QuantBrasil, Eli Rigobeli - IA, Inteligência Mil Grau, AI ProgBr, Rafa Voss | IA na Prática, Julio | Lucrar com IA e Maestros da IA).
- Todos os dez YouTubers indicados possuem aulas associadas aos cursos temáticos, removendo `status: "preparing"` dos quatro cursos e atualizando capas e páginas compartilháveis `/cursos/<id>/`.
