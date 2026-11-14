# Evidência de publicação inicial

Data: 14/11/2026. Responsável: agente principal / DevSecOps.

- Repositório público: https://github.com/igorferreira/aiflix.
- Checkout Git externo ao Drive: `/home/igorferreira/projetos/aiflix`.
- Conta Vercel: Igor Ferreira; equipe `isfconsult`.
- Projeto: `aiflix` (`prj_1wW8JKRnvj4J2KeGqjvJb0WvfIBr`), conectado ao repositório e branch `main`.
- Primeiro commit publicado: `0bcb05964ed3b41a826f69b9edf1d4f5f3b8ee7c`.
- Deployment de produção: `dpl_GzWuvHM9AsD28uHSUmDeFqB5U37M`, estado `READY`.
- URL de produção: https://aiflix-topaz-nine.vercel.app.
- Alias solicitado `aiflix.vercel.app`: recusado, HTTP 400, código `alias_in_use`. Não foi possível assumir esse endereço.

## Validação executada

Requisições HTTP à URL de produção retornaram 200 para `/` e `/styles.css`. Comparação byte a byte confirmou igualdade com os arquivos locais. `/PRD.md` retornou 404: documentos internos não integram a saída estática do site. Pasta sincronizada segue sem `.git`.

## Limites

Publicação é uma página de apresentação que informa o estado em construção. Catálogo, player, três módulos, progresso e administração ainda não foram implementados nem testados. A publicação não comprova aceite do produto, conteúdo pronto ou funcionamento da futura plataforma.

Somente `public/` é servido, sem build ou framework, conforme configuração estática documentada em https://vercel.com/docs/builds. O repositório público contém os documentos revisados do projeto; credenciais e configurações locais não devem ser versionadas.
