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

## Publicação do catálogo e layout de streaming

Commit de aplicação: `fcf13637116b3a31e2f1159ec439b31fe4b552be`. Deployment `dpl_9NrpCH92SS9UgXoK22goEuxwo2ed`, produção `READY`, Node.js 24. Alias `https://iaflix.vercel.app` atribuído a esse deployment. A proteção SSO do projeto público foi desativada; autenticação administrativa é responsabilidade dos endpoints da aplicação. Alias permanente continua exigindo atenção nas próximas publicações; confirmar sempre que o endereço aponta ao deployment esperado.

Verificações remotas sem login: `/`, `/data/catalog.json`, `/api/catalog`, JavaScript e capa oficial retornaram 200. Snapshot contém três cursos curtos, três módulos e três aulas externas com autoria. `/PRD.md` retornou 404. `/api/session` retornou 503 `ADMIN_UNAVAILABLE`, conforme gate de configuração ausente.

Smoke Chromium headless no endereço real: CTA “Assistir agora” abriu a aula esperada, iframe recebeu ID original, marcação de conclusão persistiu após recarga, área administrativa informou indisponibilidade e não houve erro JavaScript de página. Não foi validada reprodução audiovisual nem tela cheia do player externo neste smoke.

QA local: 18 testes Node e 60 verificações de navegador no layout final; integração administrativa com quatro gravações em substituto privado do GitHub. Review técnico e review do layout aprovados para o escopo documentado.

Administração ainda não foi ativada na produção: faltam token fine-grained restrito, senha/hash e segredo de sessão, origem e proteção durável de login comprovada. O cartão seguro de token expirou sem resposta. Repositório editorial privado e snapshot inicial estão provisionados; isso não equivale a comprovar escrita remota pela aplicação.
