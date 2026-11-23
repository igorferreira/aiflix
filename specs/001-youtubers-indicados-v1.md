# Spec 001 — Complemento: YouTubers indicados

Versão v1 · 23/11/2026 · extensão do catálogo público.

## Requisito

Criar seção “YouTubers indicados” na home com canais recomendados pela comunidade. Primeiro canal informado diretamente por Igor: https://www.youtube.com/@ronnaldhawk. Exibir handle fornecido; não inferir nome civil, audiência ou ranking.

## Contrato

Campo opcional `creators` em `public/data/catalog.json`, compatível com catálogos v2 existentes sem indicações. Cada entrada contém `id` estável e único, `title`, `description` e `channelUrl`. Validar HTTPS, host exato YouTube e caminho de handle sem parâmetros, credenciais ou porta. Texto renderizado por textContent; link abre nova aba com noopener noreferrer e aviso. Ausência ou lista vazia omite a seção. Catálogo editorial preserva o campo ao publicar learn paths.

## Aceite

- Dado o catálogo com indicação, quando a home abre, então mostra título, descrição e link original do canal.
- Dado catálogo antigo sem creators, a navegação permanece disponível.
- Dada URL insegura ou ID repetido, a validação recusa a entrada.
- Publicar learn path preserva indicações.

Sem imagens não verificadas, aulas inventadas, ranking pessoal ou histórico bruto no repositório. Pesquisa de vídeos e validação de metadados continuam em TOP-02/03.
