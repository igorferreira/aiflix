# aiflix

Plataforma gratuita e aberta para aprender inteligência artificial, com cursos independentes e caminhos de aprendizagem.

## Estado atual

Projeto em especificação SDD. A página em `public/` apresenta o projeto em construção; catálogo, player e administração ainda não estão implementados.

- Requisitos: `PRD.md`.
- Especificações: `specs/`.
- Tarefas, status e responsáveis: `TASKS.md`.
- Decisões de arquitetura: `docs/adrs/`.
- Repositório: https://github.com/igorferreira/aiflix.
- Endereço solicitado de produção: https://aiflix.vercel.app.

## Publicação

Vercel serve somente `public/`, sem framework nem build. Documentos do repositório não fazem parte dos arquivos públicos do site.

A pasta sincronizada pelo Drive permanece sem `.git`. O checkout usado para versionamento fica fora do Drive; sincronize arquivos revisados explicitamente, sem copiar credenciais ou configurações locais.
